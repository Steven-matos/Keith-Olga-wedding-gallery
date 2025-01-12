import React from "react";
import "../App.css";
import { Link } from "react-router";
import GalleryPage from "./GalleryPage";
import Header from "./Header";

const Homepage = () => {
  return (
    <div>
      <Header />
      <Link to="/upload">
        <span className="sm:ml-3 flex justify-center py-2">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Upload Photos
          </button>
        </span>
      </Link>
      <GalleryPage />
    </div>
  );
};

export default Homepage;
