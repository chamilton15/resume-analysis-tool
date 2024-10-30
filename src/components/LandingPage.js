import React from 'react';
import FileUpload from './FileUpload';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <h1>Resume Analysis Tool</h1>
      <p>Upload your resume to receive a detailed analysis and feedback.</p>
      <FileUpload />
    </div>
  );
};

export default LandingPage;
