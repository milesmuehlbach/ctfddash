from flask import request
from flask.wrappers import Response
from CTFd.utils.dates import ctftime
from CTFd.models import Challenges, Solves
from CTFd.utils import config as ctfd_config
from CTFd.utils.user import get_current_team, get_current_user
from CTFd.utils.scores import get_standings
from functools import wraps
from pathlib import Path
import requests
import toml

BASE_DIR = Path(__file__).resolve().parent
settings = toml.load(BASE_DIR / "settings.toml")


def load(app):
    try:
        secret = settings["SECRET"]
        dashurl = settings["DASH_URL"]
    except:
        print("one or more required values in settings.toml not set!")
        return

    def challenge_attempt_decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            result = f(*args, **kwargs)
            if not ctftime():
                return result
            if isinstance(result, Response):
                data = result.json
                if (
                    isinstance(data, dict)
                    and data.get("success") == True
                    and isinstance(data.get("data"), dict)
                    and data.get("data").get("status") == "correct"
                ):
                    if request.content_type != "application/json":
                        request_data = request.form
                    else:
                        request_data = request.get_json()
                    challenge_id = request_data.get("challenge_id")
                    challenge = Challenges.query.filter_by(
                        id=challenge_id
                    ).first_or_404()

                    # Get current user and team
                    user = get_current_user()
                    team = get_current_team()

                    # Build message with proper attribute access
                    user_name = getattr(user, "name", None) if user else None
                    if not user_name:
                        user_name = "Unknown User"

                    team_name = getattr(team, "name", None) if team else None
                    if not team_name:
                        team_name = "No Team"

                    challenge_name = getattr(challenge, "name", "Unknown Challenge")

                    # Check if this is first blood (first solve for this challenge)
                    solves = Solves.query.filter_by(challenge_id=challenge.id)
                    solves = solves.filter(Solves.team.has(hidden=False))
                    num_solves = solves.count()
                    is_first_blood = num_solves == 1

                    # Check if team is currently in first place
                    is_first_place = False
                    if team:
                        try:
                            standings = get_standings()
                            if standings and len(standings) > 0:
                                first_place_team = standings[0]
                                is_first_place = first_place_team.team_id == team.id
                        except:
                            pass

                    payload = {
                        "secret": secret,
                        "message": f"Challenge '{challenge_name}' was solved by {user_name} on {team_name}.",
                        "first_blood": is_first_blood,
                        "first_place": is_first_place,
                        "solve_number": num_solves,
                    }

                    try:
                        response = requests.post(dashurl, json=payload)
                        print(f"Status Code: {response.status_code}")
                        print(f"Response: {response.json()}")

                    except requests.exceptions.RequestException as e:
                        print(f"Error: {e}")

            return result

        return wrapper

    app.view_functions["api.challenges_challenge_attempt"] = (
        challenge_attempt_decorator(
            app.view_functions["api.challenges_challenge_attempt"]
        )
    )
