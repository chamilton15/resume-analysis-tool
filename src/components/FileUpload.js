import React, { useState } from 'react';
import TextBox from './TextBox';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Update file state when file changes
  };

  const handleTextChange = (newText) => {
    setText(newText); // Update text state when text changes in TextBox
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
    if (text) {
      formData.append('text', text)
    }
    console.log("Form Data: ", formData)

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
          const formattedResult = formatResult(data.result.parts[0].text)
          setResult(formattedResult); // Extracts the text from the first part
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

  const formatResult = (text) => {
    const lines = text.split('\n');
  
    const formattedLines = lines.map((line) => {
      // Clean up the line by trimming and removing extra "**" around inline bold text
      let cleanedLine = line.trim();
  
      // Inline bold: Replace "**text**" with <strong>text</strong>
      cleanedLine = cleanedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
      // Remove any extra trailing "**" after bold text (to handle cases like "**text**" or "text**")
      cleanedLine = cleanedLine.replace(/\*\*$/, '');
  
      // Empty lines (for spacing)
      if (cleanedLine === '') {
        return '<br>'; // For empty lines
      }
  
      // Sub-bullets (e.g., "* **Subpoint**")
      if (cleanedLine.startsWith('* ')) {
        return `<li style="margin-left: 20px;">${cleanedLine.replace('*', '').trim()}</li>`;
      }
  
      // Main bullet points: Only treat lines that start with "**" but have no spaces after the `**` as true bullets
      if (cleanedLine.startsWith('**') && !cleanedLine.includes(' ')) {
        const bulletContent = cleanedLine.replace(/\*\*/g, '').trim();
        return `<li>${bulletContent}</li>`;
      }
  
      // Bolded paragraphs (lines that start with "**" and contain text after it are treated as bolded paragraphs)
      if (cleanedLine.startsWith('**') && cleanedLine.includes(' ')) {
        return `<p>${cleanedLine}</p>`;
      }
  
      // Default paragraphs for regular text (non-bullet points and non-bold text)
      return `<p>${cleanedLine}</p>`;
    });
  
    // Join lines and wrap in <ul> for bullet points
    const htmlResult = formattedLines.join('');
    return htmlResult.includes('<li>')
      ? `<ul>${htmlResult}</ul>`
      : htmlResult;
  };

  return (
    <div className="file-upload-container">
      <TextBox onTextChange={handleTextChange} /> {/* Integrate TextBox */}
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>Upload Resume</button>
      </form>
      {loading && <p>Processing your file...</p>}
      {file && <p>Selected file: {file.name}</p>}
      {result && (
        <div
          className="result-container"
          style={{ textAlign: 'left', whiteSpace: 'pre-line' }}
          dangerouslySetInnerHTML={{ __html: result }}
        />
      )}
      {error && <div style={{ color: 'red' }}><p>Error: {error}</p></div>}
    </div>
  );
};

export default FileUpload;