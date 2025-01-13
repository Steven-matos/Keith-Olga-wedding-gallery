import React from "react";
import "../App.css";
import { Link } from "react-router";
import GalleryPage from "./GalleryPage";
import Header from "./Header";

const Homepage = () => {
  return (
    <div className="text-center w-full">
      <Header className="mb-4" />
      <br />
      <Link
        to="/upload"
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Upload Photos
      </Link>
      <GalleryPage />
    </div>
  );
};

export default Homepage;
