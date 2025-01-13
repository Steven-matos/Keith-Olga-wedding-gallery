import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PhotoIcon } from "@heroicons/react/24/solid";

const PhotoUploader = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedFiles([]);
  }, [navigate]);

  const handleFileChange = (event) => {
    setSelectedFiles([...selectedFiles, ...event.target.files]);
    let newPreviewImages = [];
    Array.from(event.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviewImages.push({ preview: reader.result, file });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedFiles.length) {
      alert("Please select at least one photo to upload.");
      return;
    }
    setLoading(true); // Set loading to true
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });
    formData.append("uploaderName", "generic");
    axios
      .post(`${process.env.REACT_APP_API}/api/upload`, formData, {
        withCredentials: false,
      })
      .then(() => {
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
      });
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    navigate("/");
  };

  return (
    <div>
      {loading ? (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900/75 text-center p-4">
          <span className="text-white">
            <i className="fa-solid fa-spinner fa-spin-pulse fa-10x"></i>
          </span>
        </div>
      ) : null}
      <header className="header">
        <h1 className="title style-script-regular">Keith & Olga</h1>
      </header>
      <div className="col-span-full">
        <label
          htmlFor="photo-uploader"
          className="block text-2xl font-medium text-gray-900 text-center underline"
        >
          Photo Uploader
        </label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 mx-44 my-4 uploader">
          <div className="text-center">
            <PhotoIcon
              aria-hidden="true"
              className="mx-auto size-12 text-gray-300"
            />
            <div className="mt-4 flex text-sm/6 text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
              >
                <div className="bg-gray-200 hover:bg-blue-500 cursor-pointer rounded-lg p-4 transition-colors duration-300 ease-linear flex justify-center items-center">
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>
              </label>
            </div>
            <p className="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        <div className="flex justify-evenly">
          <span className="sm:ml-3 flex justify-center py-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center rounded-md bg-red-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Cancel
            </button>
          </span>
          <span className="sm:ml-3 flex justify-center py-2">
            <button
              type="submit"
              onClick={handleSubmit}
              className="inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Upload
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};
export default PhotoUploader;
