import React, { useState } from "react";
import axios from "axios";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router";

const PhotoUploader = () => {
  let navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFiles([...selectedFiles, ...event.target.files]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (selectedFiles.length === 0) {
      alert("Please select at least one photo to upload.");
      return;
    }

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    formData.append("uploaderName", "generic");

    axios
      .post("http://localhost:3000/api/upload", formData, {
        withCredentials: true,
      })
      .then((response) => {
        return navigate("/");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <header className="header">
        <h1 className="title style-script-regular">Keith & Olga 2025</h1>
      </header>
      <div className="col-span-full">
        <label
          htmlFor="photo-uploader"
          className="block text-2xl font-medium text-gray-900 text-center"
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
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>
      <div className="flex justify-evenly">
        <Link to="/">
          <span className="sm:ml-3 flex justify-center py-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-red-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Cancel
            </button>
          </span>
        </Link>
        <span className="sm:ml-3 flex justify-center py-2">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-green-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={handleSubmit}
          >
            Upload
          </button>
        </span>
      </div>
    </div>
  );
};

export default PhotoUploader;
