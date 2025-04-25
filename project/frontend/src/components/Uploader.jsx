import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PhotoIcon } from "@heroicons/react/24/solid";

const PhotoUploader = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [eventSource, setEventSource] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking...");

  useEffect(() => {
    // Check backend connection
    const checkConnection = async () => {
      try {
        await axios.get(`${process.env.REACT_APP_API}/api/photo/all-photos`);
        setServerStatus("connected");
        console.log("Backend server is running and connected");
      } catch (error) {
        setServerStatus("disconnected");
        console.error("Backend server is not responding:", error);
      }
    };

    checkConnection();
    setSelectedFiles([]);
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [navigate, eventSource]);

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
    setLoading(true);
    setUploadProgress({});

    // Initialize progress for each file
    const initialProgress = {};
    selectedFiles.forEach((file) => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);

    // Set up SSE connection for progress updates
    const source = new EventSource(
      `${process.env.REACT_APP_API}/api/upload/progress`
    );
    setEventSource(source);

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setUploadProgress((prev) => ({
        ...prev,
        [data.fileId]: data.progress,
      }));
    };

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
        if (source) {
          source.close();
        }
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        if (source) {
          source.close();
        }
        alert(error.message);
      });
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    if (eventSource) {
      eventSource.close();
    }
    navigate("/");
  };

  return (
    <div>
      <div className="text-center text-sm text-gray-600 mb-2">
        Server Status:{" "}
        <span
          className={
            serverStatus === "connected" ? "text-green-600" : "text-red-600"
          }
        >
          {serverStatus}
        </span>
      </div>
      {loading ? (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900/75 text-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto mt-20">
            <h2 className="text-xl font-semibold mb-4">Uploading Files</h2>
            {selectedFiles.map((file) => (
              <div key={file.name} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {uploadProgress[file.name] || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress[file.name] || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <header className="header">
        <h1 className="title style-script-regular">Keith & Olga</h1>
      </header>
      <div className="col-span-full">
        <label
          htmlFor="photo-uploader"
          className="block text-xl md:text-2xl font-medium text-gray-900 text-center underline"
        >
          Photo Uploader
        </label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 mx-4 md:mx-44 my-4 uploader">
          <div className="text-center w-full max-w-md">
            <PhotoIcon
              aria-hidden="true"
              className="mx-auto size-12 text-gray-300"
            />
            <div className="mt-4 flex text-sm/6 text-gray-600 justify-center">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 w-full max-w-xs"
              >
                <div className="bg-gray-200 hover:bg-blue-500 cursor-pointer rounded-lg p-4 transition-colors duration-300 ease-linear flex justify-center items-center touch-manipulation">
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full cursor-pointer"
                    accept="image/*"
                  />
                </div>
              </label>
            </div>
            <p className="text-xs/5 text-gray-600 mt-2">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
        <div className="flex justify-evenly gap-4 px-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 max-w-xs inline-flex items-center justify-center rounded-md bg-red-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 max-w-xs inline-flex items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 touch-manipulation"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploader;
