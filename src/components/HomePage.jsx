import React from "react";
import Uploader from "./Uploader";
import GalleryPage from "./GalleryPage";
import Header from "./Header";

const Homepage = () => {
  return (
    <div>
      <Header />
      <Uploader />
      <GalleryPage />
    </div>
  );
};

export default Homepage;
