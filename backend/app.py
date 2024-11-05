from flask import Flask, request, jsonify
import requests
from PyPDF2 import PdfReader
from io import BytesIO

app = Flask(__name__)

# Google Gemini API Information
API_KEY = "AIzaSyCBWZKzXAcCW_q7MDGuF3wm1ZHV2DHWKSU"  # Replace with your actual Google API key
API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

def extract_text_from_pdf(file_stream):
    """Extracts text from a PDF file."""
    text = ""
    try:
        reader = PdfReader(file_stream)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        return None, str(e)
    return text, None

def call_gemini_api(text):
    """Calls the Google Gemini API to process text."""
    headers = {
        'Content-Type': 'application/json'
    }
    data = {
        "contents": [{
            "parts": [{"text": text}]
        }]
    }
    full_url = f"{API_URL}?key={API_KEY}"
    
    response = requests.post(full_url, headers=headers, json=data)
    
    if response.status_code == 200:
        result = response.json()
        return result['candidates'][0]['content'], None
    else:
        return None, f"API request failed with status code {response.status_code}"

@app.route('/api/upload', methods=['POST'])
def upload():
    text_input = request.form.get('text')
    file = request.files.get('file')

    # Check if either text or file is provided
    if not text_input and not file:
        return jsonify({"error": "No text or file provided"}), 400

    # If a file is provided, process it first
    if file:
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Process PDF file
        file_stream = BytesIO(file.read())
        pdf_text, error = extract_text_from_pdf(file_stream)
        if error:
            return jsonify({"error": f"Failed to extract text from PDF: {error}"}), 500

        # If text input is also provided, combine it with the PDF content
        if text_input:
            combined_text = text_input + "\n\n" + pdf_text
        else:
            combined_text = pdf_text

        # Call API with combined text
        result, error = call_gemini_api(combined_text)
        if error:
            return jsonify({"error": error}), 500
        return jsonify({"result": result})

    # If only text input is provided, process the text input
    if text_input:
        result, error = call_gemini_api(text_input)
        if error:
            return jsonify({"error": error}), 500
        return jsonify({"result": result})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
