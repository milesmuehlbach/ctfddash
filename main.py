from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask import Flask, jsonify, request
import toml

app = Flask(__name__, static_folder="./static")
socketio = SocketIO(app, cors_allowed_origins="*")

settings = toml.load("./settings.toml")
ctfname = settings["CTF_NAME"]
ctfurl = settings["CTF_URL"]
secret = settings["SECRET"]


@app.route("/")
def _root():
    return app.send_static_file("index.html")


@app.route("/api/info")
def info():
    return jsonify(ctfname, ctfurl)


@app.route("/api/solve", methods=["POST"])
def solve():
    data = request.json

    if not data:
        return jsonify({"error": "No data provided"}), 400

    if data.get("secret") == secret:
        message = data.get("message", "")
        print(data.get("solve_number", ""))
        # Emit to all connected clients
        socketio.emit("solve", message)
        return jsonify({"success": True, "message": message}), 200
    else:
        return jsonify({"error": "Invalid secret"}), 401


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", debug=True, allow_unsafe_werkzeug=True)
