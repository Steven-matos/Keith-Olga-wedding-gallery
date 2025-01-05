import React, { useState } from "react";
import axios from "axios";

const PhotoUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please select a photo to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", selectedFile);

    axios
      .post("http://localhost:3000/api/photos", formData)
      .then((response) => {
        // Handle success response
      })
      .catch((error) => {
        // Handle error response
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default PhotoUploader;
