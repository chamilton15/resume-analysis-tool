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
  const [bertScore, setBERTScore] = useState(null);
  const [readability, setReadability] = useState(null);

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

        if (data.pre_refine_bert_score !== undefined && data.post_refine_bert_score !== undefined) {
          setBERTScore({
            pre: data.pre_refine_bert_score,
            post: data.post_refine_bert_score,
          });
          console.log("Pre-refinement BERTScore:", data.pre_refine_bert_score);
          console.log("Post-refinement BERTScore:", data.post_refine_bert_score);
        }

        if (data.pre_refine_readability !== undefined && data.post_refine_readability !== undefined) {
          setReadability({
            pre: data.pre_refine_readability,
            post: data.post_refine_readability,
          });
          console.log("Pre-refinement Readability:", data.pre_refine_readability);
          console.log("Post-refinement Readability:", data.post_refine_readability);
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

      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
        {/* Similarity scores */}
        {similarities && (
          <div style={{ flex: 1 }}>
            <h3>Position Match Rate (Higher is Better):</h3>
            <p>Before Refinement: {(similarities.pre * 100).toFixed(2)}%</p>
            <p>After Refinement: {(similarities.post * 100).toFixed(2)}%</p>
          </div>
        )}

        {/* BERTScore for similarity */}
        {bertScore && (
          <div style={{ flex: 1 }}>
            <h3>BERTScore (Higher is Better for All):</h3>
            <p>
              <strong>Before Refinement:</strong><br />
              Precision: {(bertScore.pre.precision * 100).toFixed(2)}%<br />
              Recall: {(bertScore.pre.recall * 100).toFixed(2)}%<br />
              F1 Score: {(bertScore.pre.f1 * 100).toFixed(2)}%
            </p>
            <p>
              <strong>After Refinement:</strong><br />
              Precision: {(bertScore.post.precision * 100).toFixed(2)}%<br />
              Recall: {(bertScore.post.recall * 100).toFixed(2)}%<br />
              F1 Score: {(bertScore.post.f1 * 100).toFixed(2)}%
            </p>
          </div>
        )}

        {/* Readability Scores */}
        {readability && (
          <div style={{ flex: 1 }}>
            <h3>Readability Scores (Higher Reading Ease and Lower Grade Level are Better):</h3>
            <p>
              <strong>Before Refinement:</strong><br />
              Flesch Reading Ease: {readability.pre.flesch_reading_ease.toFixed(2)}<br />
              Flesch-Kincaid Grade Level: {readability.pre.flesch_kincaid_grade.toFixed(2)}
            </p>
            <p>
              <strong>After Refinement:</strong><br />
              Flesch Reading Ease: {readability.post.flesch_reading_ease.toFixed(2)}<br />
              Flesch-Kincaid Grade Level: {readability.post.flesch_kincaid_grade.toFixed(2)}
            </p>
          </div>
        )}
      </div>

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
