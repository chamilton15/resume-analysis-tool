import React, { useState } from 'react';

const FileUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (file) {
      // Handle file submission logic here (e.g., sending the file to an API)
      console.log('Uploaded file:', file);
    } else {
      alert('Please upload a resume file before submitting.');
    }
  };

  return (
    <div className="file-upload-container">
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        <button type="submit">Upload Resume</button>
      </form>
      {file && <p>Selected file: {file.name}</p>}
    </div>
  );
};

export default FileUpload;