# chatbot.py
from transformers import pipeline

# Load the conversational model (Ensure PyTorch is installed)
chatbot = pipeline('text-generation', model='microsoft/DialoGPT-medium')

def chat_with_bot(input_text):
    conversation = chatbot(input_text)
    return conversation[0]['generated_text']
