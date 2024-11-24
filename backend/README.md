# Intelligent Resume Analysis Tool Backend

This Flask application allows you to send either text or a PDF file to the Google Gemini API. You can also combine text and file content in a single request, which the API will then process.

## Requirements

- Python 3.6 or later
- Flask
- PyPDF2 (for PDF processing)
- Requests (for making HTTP requests)
- Cross-Origin Resource Sharing (CORS: for React to communicate with Flask)
- TextScore (for readability scores)
- BERTScore (for context-aware similarity scores)

## Setup

1. Clone this repository.
2. Install dependencies:
   ```bash
   pip install flask requests PyPDF2 flask-cors textstat bert-score
   ```
3. Replace the placeholder `API_KEY` in `app.py` with your actual Google API key.

## Usage

### Start the Flask Server

Run the following command to start the server:

   ```bash
   python app.py
   ```

The server will start on `http://0.0.0.0:5001`.

### API Endpoint

- **Endpoint**: `/api/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `text` (optional): Text to be processed by the Google Gemini API.
  - `file` (optional): A PDF file to be processed by the Google Gemini API.

You can provide either `text`, `file`, or both in a single request.

### Example Requests

#### 1. Text-Only Request

   ```bash
   curl -X POST -F "text=This is a test for the Google Gemini API." http://localhost:5001/api/upload
   ```

#### 2. File-Only Request

   ```bash
   curl -X POST -F "file=@/path/to/your/file.pdf" http://localhost:5001/api/upload
   ```

#### 3. Text and File Combined Request

   ```bash
   curl -X POST \
   -F "text=Could you tell me what's in this pdf file?" \
   -F "file=@/path/to/your/file.pdf" \
   http://localhost:5001/api/upload
   ```

### Response

The API returns a JSON response with the processed result from Google Gemini API. Example response structure:

   ```json
   {
     "result": "Processed content from the text or PDF file."
   }
   ```

### Error Handling

If the request fails, the API returns an error message with the corresponding HTTP status code.

Example error response:
   ```json
   {
     "error": "Failed to extract text from PDF: [Error details here]"
   }
   ```

## License

This project is open-source and available under the MIT License.