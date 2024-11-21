from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from PyPDF2 import PdfReader
from io import BytesIO
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Google Gemini API Information
API_KEY = "AIzaSyCBWZKzXAcCW_q7MDGuF3wm1ZHV2DHWKSU"  # Replace with your actual Google API key
API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

# Load the Sentence-BERT model
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(file_stream):
    """Extract text from a PDF file."""
    text = ""
    try:
        reader = PdfReader(file_stream)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        if not text:
            return None, "No text found in PDF"
    except Exception as e:
        return None, str(e)
    return text, None

def call_gemini_api(text):
    """Call the Google Gemini API to process the text."""
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

def compute_similarity(text1, text2):
    """Compute the similarity between two pieces of text."""
    embeddings = model.encode([text1, text2])
    sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return float(sim)  # Convert to Python float type to ensure JSON serialization compatibility

@app.route('/api/upload', methods=['POST'])
def upload():
    text_input = request.form.get('text')
    file = request.files.get('file')

    # Check if both text and file are provided
    if not text_input or not file:
        return jsonify({"error": "Both text and file must be provided"}), 400

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Extract resume text from the PDF file
    file_stream = BytesIO(file.read())
    resume_text, error = extract_text_from_pdf(file_stream)
    if error:
        return jsonify({"error": f"Failed to extract text from PDF: {error}"}), 500

    # Compute the similarity before refinement
    pre_refine_similarity = compute_similarity(text_input, resume_text)

    # Combine text as input for the LLM
    combined_text = text_input + "\n\n" + resume_text

    # Call the LLM for refinement
    refined_result, error = call_gemini_api(combined_text)
    if error:
        return jsonify({"error": error}), 500

    # If refined_result is a dictionary and contains a text field, use it
    refined_text = refined_result.get('parts', [{}])[0].get('text', '') if isinstance(refined_result, dict) else refined_result

    # Compute the similarity after refinement
    post_refine_similarity = compute_similarity(text_input, refined_text)

    return jsonify({
        "result": refined_result,
        "pre_refine_similarity": pre_refine_similarity,
        "post_refine_similarity": post_refine_similarity
    })

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
