import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PhotoIcon } from "@heroicons/react/24/solid";
import imageCompression from 'browser-image-compression';

// Get the correct API URL based on environment
const getApiUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://kow-backend.vercel.app/api";
  }
  return process.env.REACT_APP_API || "http://localhost:3001/api";
};

const PhotoUploader = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [eventSource, setEventSource] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking...");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    // Check backend connection
    const checkConnection = async () => {
      try {
        await axios.get(`${getApiUrl()}/photo/all-photos`);
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

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    
    // Show loading state
    setLoading(true);
    
    try {
      // Compress files in parallel
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );
      
      setSelectedFiles(prev => [...prev, ...compressedFiles]);
      
      // Create previews
      const newPreviewImages = [];
      compressedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviewImages.push({ preview: reader.result, file });
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toast component
  const Toast = ({ message, type }) => (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      <div className={`rounded-lg px-6 py-3 shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white`}>
        {message}
      </div>
    </div>
  );

  // Function to show toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Function to compress image
  const compressImage = async (file) => {
    // Mobile-specific compression options
    const options = {
      maxSizeMB: 2, // Smaller size for mobile
      maxWidthOrHeight: 1600, // Slightly smaller for mobile
      useWebWorker: true,
      initialQuality: 0.7, // Slightly lower quality for faster uploads
      alwaysKeepResolution: true, // Keep aspect ratio
      fileType: file.type, // Keep original file type
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      return file;
    }
  };

  // Function to upload files in chunks
  const uploadFilesInChunks = async (files, chunkSize = 1) => { // Reduced chunk size for mobile
    const chunks = [];
    for (let i = 0; i < files.length; i += chunkSize) {
      chunks.push(files.slice(i, i + chunkSize));
    }

    let successfulUploads = 0;
    let failedUploads = 0;
    const failedFiles = [];

    for (const chunk of chunks) {
      const formData = new FormData();
      chunk.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("uploaderName", "generic");

      try {
        const response = await axios.post(`${getApiUrl()}/upload`, formData, {
          withCredentials: false,
          timeout: 60000, // 1 minute timeout for mobile
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress((prev) => ({
              ...prev,
              total: percentCompleted,
            }));
          },
        });

        if (response.status === 207) {
          successfulUploads += response.data.successful;
          failedUploads += response.data.failed;
          failedFiles.push(...response.data.failedFiles);
        } else {
          successfulUploads += chunk.length;
        }
      } catch (error) {
        failedUploads += chunk.length;
        chunk.forEach(file => {
          failedFiles.push({
            filename: file.name,
            error: error.response?.data?.details || error.message
          });
        });
      }
    }

    return { successfulUploads, failedUploads, failedFiles };
  };

  const handleSubmit = async (event) => {
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
    const source = new EventSource(`${getApiUrl()}/upload/progress`);
    setEventSource(source);

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setUploadProgress((prev) => ({
        ...prev,
        [data.fileId]: data.progress,
      }));
    };

    try {
      const { successfulUploads, failedUploads, failedFiles } = await uploadFilesInChunks(selectedFiles);

      if (failedUploads === 0) {
        showToast('All photos uploaded successfully!', 'success');
      } else if (successfulUploads > 0) {
        const message = `${successfulUploads} files uploaded successfully, ${failedUploads} failed`;
        showToast(message, 'warning');
        alert(`Upload partially completed:\n${message}\n\nFailed files:\n${failedFiles.map(f => `- ${f.filename}: ${f.error}`).join('\n')}`);
      } else {
        showToast('Upload failed', 'error');
        alert(`Upload failed:\n${failedFiles.map(f => `- ${f.filename}: ${f.error}`).join('\n')}`);
      }

      if (successfulUploads > 0) {
        navigate("/");
      }
    } catch (error) {
      let errorMessage = "Upload failed: ";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += "Request timed out. Please try uploading fewer images at once or reduce image sizes.";
      } else if (error.response) {
        const { data } = error.response;
        errorMessage += data.details || data.error || error.message;
      } else if (error.request) {
        errorMessage += "Server is not responding. Please try again in a few moments.";
      } else {
        errorMessage += error.message;
      }

      showToast('Upload failed', 'error');
      alert(errorMessage);
    } finally {
      setLoading(false);
      if (source) {
        source.close();
      }
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    if (eventSource) {
      eventSource.close();
    }
    navigate("/");
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900/75 text-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-auto mt-20">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
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
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress[file.name] || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
        <div className="mt-4 text-sm text-gray-600">
          Total Progress: {uploadProgress.total || 0}%
        </div>
      </div>
    </div>
  );

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
      {loading && <LoadingSpinner />}
      {toast.show && <Toast message={toast.message} type={toast.type} />}
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
              Select photos or take new ones
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
            disabled={selectedFiles.length === 0}
            className={`flex-1 max-w-xs inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 touch-manipulation ${
              selectedFiles.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-700'
            }`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploader;
