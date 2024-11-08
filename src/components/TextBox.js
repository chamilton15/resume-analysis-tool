import React, { useState } from 'react';

const TextBox = ({ onTextChange }) => {
  const [text, setText] = useState('');
  const maxChars = 10000;

  const handleChange = (event) => {
    if (event.target.value.length <= maxChars) {
      setText(event.target.value);
      onTextChange(event.target.value); // Pass the text value up to the parent component
    }
  };

  return (
    <div className="text-box-container">
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Type your text here..."
        maxLength={maxChars}
        rows="10"
        cols="50"
      />
      <p>{text.length}/{maxChars} characters</p>
    </div>
  );
};

export default TextBox;