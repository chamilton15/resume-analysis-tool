import React, { useState } from 'react';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please upload a resume file before submitting.');
      return
    }

    console.log('Uploaded file:', file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log("Result: ", data.result)

      if (response.ok) {
        // Check if result has the structure { parts: Array, role: string }
        if (data.result && data.result.parts && data.result.parts.length > 0) {
          setResult(data.result.parts[0].text); // Extracts the text from the first part
        } else {
          setResult('No text found in the response.');
        }
      } else {
        setError(data.error || 'An error occurred while processing the request.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>Upload Resume</button>
      </form>
      {loading && <p>Processing your file...</p>}
      {file && <p>Selected file: {file.name}</p>}
      {result && <div><h3>Analysis Result:</h3><p>{result}</p></div>}
      {error && <div style={{ color: 'red' }}><p>Error: {error}</p></div>}
    </div>
  );
};

export default FileUpload;