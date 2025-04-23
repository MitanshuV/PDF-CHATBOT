from flask import Flask, request, jsonify
import requests
import uuid
import os
import json

app = Flask(__name__)

# Chat session storage file
SESSION_FILE = "chat_sessions.json"

# In-memory session store
session_store = {}

# Load previous sessions if they exist
def load_sessions():
    global session_store
    if os.path.exists(SESSION_FILE):
        with open(SESSION_FILE, "r") as f:
            session_store = json.load(f)

# Save sessions to file
def save_sessions():
    with open(SESSION_FILE, "w") as f:
        json.dump(session_store, f)

load_sessions()

# Together.ai model setup
TOGETHER_API_KEY = "3e038e3c2db8ae4ba93084d4c53c2559958d2c5c80ac5acf6563357824e69ad7"  # set this in your environment
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"
MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.1"
HEADERS = {
    "Authorization": f"Bearer {TOGETHER_API_KEY}",
    "Content-Type": "application/json"
}

@app.route("/chat/start", methods=["POST"])
def start_chat():
    data = request.get_json()
    file_id = data.get("file_id")
    if not file_id:
        return jsonify({"error": "file_id is required"}), 400

    response = requests.get(f"http://localhost:5000/get_text/{file_id}")
    if response.status_code != 200:
        return jsonify({"error": "Failed to retrieve document text"}), 500

    text = response.json().get("extracted_text", "")
    session_id = str(uuid.uuid4())
    session_store[session_id] = [
        {"role": "system", "content": "You are a helpful assistant that answers questions based on the document."},
        {"role": "user", "content": f"Here is the document: {text}"}
    ]
    save_sessions()
    return jsonify({"session_id": session_id})

@app.route("/chat/message", methods=["POST"])
def chat_message():
    data = request.get_json()
    session_id = data.get("session_id")
    message = data.get("message")

    if not session_id or not message:
        return jsonify({"error": "session_id and message are required"}), 400

    if session_id not in session_store:
        return jsonify({"error": "Session not found"}), 404

    session_store[session_id].append({"role": "user", "content": message})

    payload = {
        "model": MODEL_NAME,
        "messages": session_store[session_id],
        "temperature": 0.7
    }

    try:
        response = requests.post(TOGETHER_API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()
        result = response.json()
        reply = result["choices"][0]["message"]["content"]
        session_store[session_id].append({"role": "assistant", "content": reply})
        save_sessions()
        return jsonify({"answer": reply})
    except requests.exceptions.HTTPError as e:
        return jsonify({"answer": f"Error: {response.status_code}, {response.text}"})

@app.route("/chat/reset/<session_id>", methods=["POST"])
def reset_session(session_id):
    if session_id in session_store:
        del session_store[session_id]
        save_sessions()
        return jsonify({"message": f"Session {session_id} has been reset."})
    return jsonify({"error": "Session not found."}), 404

if __name__ == "__main__":
    app.run(port=5001, debug=True)
