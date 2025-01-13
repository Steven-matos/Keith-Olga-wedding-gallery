import React, { useState, useEffect } from "react";
import axios from "axios";

const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [api, setAPI] = useState(process.env.REACT_APP_API);
  const [modalImage, setModalImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${api}/api/photo/all-photos`, {
        withCredentials: true,
      })
      .then((response) => {
        setPhotos(response.data);
        console.log(response.data);
      })
      .catch(() => setError("Failed to load photos"));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setModalImage("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex justify-center mt-7 mx-11 pt-7 rounded-none border-t-2 border-solid border-slate-500">
      <div className="text-5xl style-script-regular">Gallery</div>
    </div>
  );
};

export default GalleryPage;
