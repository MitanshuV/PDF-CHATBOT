import os
import fitz  # PyMuPDF for PDF processing
import docx
import pytesseract
from PIL import Image
import cv2
import numpy as np

# Set up the Tesseract command path
pytesseract.pytesseract.tesseract_cmd = r'D:\Software\Tesseract-OCR\tesseract.exe'  # Update this path

def process_document(file_path, lang='eng'):
    # Get the file extension
    ext = os.path.splitext(file_path)[1].lower()

    # Call appropriate function based on file extension
    if ext == '.docx':
        return process_docx(file_path)
    elif ext == '.pdf':
        return process_pdf(file_path, lang)
    elif ext in ['.jpeg', '.jpg', '.png']:
        return process_image(file_path, lang)
    else:
        return "Unsupported file type"

def process_docx(docx_file):
    # Process DOCX files
    doc = docx.Document(docx_file)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def process_pdf(pdf_file, lang='eng'):
    # Process PDF files (check if they are text-based or image-based)
    text = ""
    with fitz.open(pdf_file) as doc:
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
        if text.strip():
            return text
        else:
            return perform_ocr_on_pdf(pdf_file, lang)

def perform_ocr_on_pdf(pdf_file, lang='eng'):
    # Perform OCR on image-based PDFs
    text = ""
    with fitz.open(pdf_file) as doc:
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            pix = page.get_pixmap()
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            # Preprocess the image
            processed_img = preprocess_image_for_ocr(img)
            
            # OCR on the preprocessed image
            text += pytesseract.image_to_string(processed_img, lang=lang)
    return text

def process_image(image_file, lang='eng'):
    # Perform OCR on image files (JPEG, PNG, etc.)
    img = Image.open(image_file)
    
    # Preprocess the image before OCR
    processed_img = preprocess_image_for_ocr(img)
    processed_img.save("preprocessed_output.png")

    
    # OCR on the preprocessed image
    return pytesseract.image_to_string(processed_img, lang=lang)

def preprocess_image_for_ocr(img):
    # Convert PIL Image to OpenCV format
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    
    # Convert back to PIL Image format for pytesseract
    return Image.fromarray(gray)

# List of supported Indian languages and others
supported_languages = {
    'Hindi': 'hin',
    'Bengali': 'ben',
    'Gujarati': 'guj',
    'Kannada': 'kan',
    'Malayalam': 'mal',
    'Marathi': 'mar',
    'Punjabi': 'pan',
    'Tamil': 'tam',
    'Telugu': 'tel',
    'Urdu': 'urd',
    'English': 'eng',
    'French': 'fra',
    'German': 'deu',
    'Spanish': 'spa',
    'Italian': 'ita',
    'Chinese Simplified': 'chi_sim',
    'Japanese': 'jpn',
    'Russian': 'rus',
    'Arabic': 'ara'
}

# Test the code
if __name__ == "__main__":
    # Provide the path to your file here
    file_path = input("Enter the file path: ")
    
    # Ask user to select language
    print("Supported languages:")
    for i, (lang_name, lang_code) in enumerate(supported_languages.items()):
        print(f"{i+1}. {lang_name} ({lang_code})")
    
    lang_input = input("Enter the number of the language(s) you want to use (e.g., 1 for Hindi, 1+2 for Hindi+Bengali): ")
    
    # Split and map user input to language codes
    lang_codes = '+'.join([list(supported_languages.values())[int(idx)-1] for idx in lang_input.split('+')])
    
    # Process the document based on its type and language(s)
    result = process_document(file_path, lang=lang_codes)
    
    # Print extracted text or message
    print("Extracted text:\n", result)
