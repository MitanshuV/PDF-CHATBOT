import os
import fitz  # PyMuPDF for PDF processing
import docx
import pytesseract
from PIL import Image
import cv2
import numpy as np
import uuid
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
# from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Set upload folder (temporary storage)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Set up Tesseract path (Modify this to your installed path)
pytesseract.pytesseract.tesseract_cmd = r'D:\Software\Tesseract-OCR\tesseract.exe'  

# Dictionary to store extracted
extracted_text_store = {}

# Supported languages
SUPPORTED_LANGUAGES = {
    'Hindi': 'hin', 'Bengali': 'ben', 'Gujarati': 'guj', 'Kannada': 'kan',
    'Malayalam': 'mal', 'Marathi': 'mar', 'Punjabi': 'pan', 'Tamil': 'tam',
    'Telugu': 'tel', 'Urdu': 'urd', 'English': 'eng', 'French': 'fra',
    'German': 'deu', 'Spanish': 'spa', 'Italian': 'ita', 'Chinese Simplified': 'chi_sim',
    'Japanese': 'jpn', 'Russian': 'rus', 'Arabic': 'ara'
}

def process_document(file_path, lang='eng'):
    """Processes a document based on file type."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.docx':
        return process_docx(file_path)
    elif ext == '.pdf':
        return process_pdf(file_path, lang)
    elif ext in ['.jpeg', '.jpg', '.png']:
        return process_image(file_path, lang)
    else:
        return "Unsupported file type"

def process_docx(docx_file):
    """Extract text from DOCX files."""
    doc = docx.Document(docx_file)
    return '\n'.join([para.text for para in doc.paragraphs])

def process_pdf(pdf_file, lang='eng'):
    """Extract text from text-based PDFs, otherwise use OCR."""
    text = ""
    with fitz.open(pdf_file) as doc:
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
    return text if text.strip() else perform_ocr_on_pdf(pdf_file, lang)

def perform_ocr_on_pdf(pdf_file, lang='eng'):
    """Perform OCR on image-based PDFs."""
    text = ""
    with fitz.open(pdf_file) as doc:
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            pix = page.get_pixmap()
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            processed_img = preprocess_image_for_ocr(img)
            text += pytesseract.image_to_string(processed_img, lang=lang)
    return text

def process_image(image_file, lang='eng'):
    """Perform OCR on image files (JPEG, PNG, etc.)."""
    img = Image.open(image_file)
    processed_img = preprocess_image_for_ocr(img)
    return pytesseract.image_to_string(processed_img, lang=lang)

def preprocess_image_for_ocr(img):
    """Improve image quality for OCR."""
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    return Image.fromarray(gray)

@app.route('/hello', methods=['GET'])
def hello_world():
    """Simple API endpoint for testing."""
    return jsonify({'message': 'Hello, World!'})

@app.route('/upload-file', methods=['POST'])
def process_file():
    """API endpoint to process uploaded files."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    lang = request.form.get('lang', 'eng')  # Default to English

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if lang not in SUPPORTED_LANGUAGES.values():
        return jsonify({'error': 'Unsupported language'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    extracted_text = process_document(filepath, lang)
    os.remove(filepath)  # Clean up uploaded file

    file_id = str(uuid.uuid4())
    extracted_text_store[file_id] = extracted_text

    return jsonify({'file_id': file_id, 'extracted_text': extracted_text})

@app.route('/get_text/<file_id>', methods=['GET'])
def get_extracted_text(file_id):
    """Fetch extracted text for a given file_id."""
    text = extracted_text_store.get(file_id)
    if not text:
        return jsonify({'error': 'Text not found'}), 404
    return jsonify({'file_id': file_id, 'extracted_text': text})

# Run the server
if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000, debug=True)
    
    # CORS(app, origins=["http://localhost:5173"])
