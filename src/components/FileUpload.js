import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TextBox from './TextBox';
import '../App.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [similarities, setSimilarities] = useState(null); // To store pre and post refinement similarity scores

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Update the file state
  };

  const handleTextChange = (newText) => {
    setText(newText); // Update the text state
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please upload a resume file before submitting.');
      return;
    }

    console.log('Uploaded file:', file);
    const formData = new FormData();
    formData.append('file', file);
    if (text) {
      formData.append('text', text);
    }
    console.log("Form Data: ", formData);

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log("Result: ", data);

      if (response.ok) {
        // Save similarity data
        if (data.pre_refine_similarity !== undefined && data.post_refine_similarity !== undefined) {
          setSimilarities({
            pre: data.pre_refine_similarity,
            post: data.post_refine_similarity,
          });
          console.log("Pre-refinement similarity:", data.pre_refine_similarity);
          console.log("Post-refinement similarity:", data.post_refine_similarity);
        }

        // Set results
        if (data.result && data.result.parts && data.result.parts.length > 0) {
          setResult(data.result.parts[0].text);
        } else {
          setResult(data.result || 'No analysis result found.');
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
      {/* TextBox input for text */}
      <TextBox onTextChange={handleTextChange} />

      {/* File upload form */}
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </form>

      {/* Loading state */}
      {loading && <p>Processing your file...</p>}

      {/* Display selected file */}
      {file && <p>Selected file: {file.name}</p>}

      {/* Similarity scores */}
      {similarities && (
        <div>
          <h3>Position Match Rate:</h3>
          <p>Before Refinement: {(similarities.pre * 100).toFixed(2)}%</p>
          <p>After Refinement: {(similarities.post * 100).toFixed(2)}%</p>
        </div>
      )}

      {/* Display result as Markdown */}
      {result && (
        <div>
          <h3>Analysis Result:</h3>
          <div className="result-container">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <div style={{ color: 'red' }}><p>Error: {error}</p></div>}
    </div>
  );
};

export default FileUpload;
