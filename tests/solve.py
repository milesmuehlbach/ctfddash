import requests

url = "http://127.0.0.1:5000/api/solve"

challengename = input("Enter challenge name: ")
challengeuser = input("Enter challenge user: ")
challengeteam = input("Enter challenge team: ")

payload = {
    "secret": "superscooper",
    "message": f"Challenge {challengename} was solved by {challengeuser} on {challengeteam}",
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
