from flask import Flask, request, jsonify
import uuid
import requests

app = Flask(__name__)

# Sessions dict to hold context per session
sessions = {}

# Together.ai API setup
TOGETHER_API_KEY = '3e038e3c2db8ae4ba93084d4c53c2559958d2c5c80ac5acf6563357824e69ad7'  # Replace with your key
TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions'

def call_together_api(prompt, context):
    headers = {
        'Authorization': f'Bearer {TOGETHER_API_KEY}',
        'Content-Type': 'application/json',
    }

    messages = [
        {"role": "system", "content": "You are a helpful assistant that answers questions based on provided context."},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion:\n{prompt}"}
    ]

    data = {
        'model': 'mistralai/Mistral-7B-Instruct-v0.1',
        'messages': messages,
        'temperature': 0.7,
        'max_tokens': 512,
        'top_p': 0.9,
    }

    response = requests.post(TOGETHER_API_URL, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content']
    else:
        return f"Error: {response.status_code}, {response.text}"

@app.route('/chat/start', methods=['POST'])
def start_chat():
    data = request.get_json()
    file_id = data.get('file_id')

    if not file_id:
        return jsonify({'error': 'file_id is required'}), 400

    try:
        response = requests.get(f'http://localhost:5000/get_text/{file_id}')
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch document text'}), 500

        extracted_text = response.json()['extracted_text'][:2000]  # Limiting context for LLM

        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            'extracted_text': extracted_text,
            'chat_history': []
        }
        return jsonify({'session_id': session_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/message', methods=['POST'])
def chat_message():
    data = request.get_json()
    session_id = data.get('session_id')
    user_message = data.get('message')

    if not session_id or not user_message:
        return jsonify({'error': 'session_id and message are required'}), 400

    session = sessions.get(session_id)
    if not session:
        return jsonify({'error': 'Invalid session_id'}), 404

    context = session['extracted_text'][:2000]  # Token limit safety
    answer = call_together_api(user_message, context)

    session['chat_history'].append({
        'user': user_message,
        'assistant': answer
    })

    return jsonify({'answer': answer})

@app.route('/chat/reset/<session_id>', methods=['GET'])
def reset_session(session_id):
    if session_id in sessions:
        del sessions[session_id]
        return jsonify({'message': f'Session {session_id} reset'}), 200
    return jsonify({'error': 'Invalid session_id'}), 404

if __name__ == '__main__':
    app.run(port=5001, debug=True)
