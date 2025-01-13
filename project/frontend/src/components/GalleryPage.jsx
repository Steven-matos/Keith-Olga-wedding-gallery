import React, { useState, useEffect } from "react";
import useSWR from "swr";

import axios from "axios";
import Gallery from "react-image-gallery";
const ImageGallery = Gallery.default ? Gallery.default : Gallery;

const GalleryPage = () => {
  const [photo, setPhotos] = useState([]);
  const { data, error } = useSWR(
    `${process.env.REACT_APP_API}/api/photo/all-photos`,
    (url) =>
      axios
        .get(url)
        .then((response) => response.data)
        .catch((error) => alert(error))
  );

  useEffect(() => {
    if (error) console.error("Failed to load photos");
    if (data) setPhotos(data);
  }, [data, error]);

  return (
    <div className="mt-7 mx-11 pt-7 rounded-none border-t-2 border-solid border-slate-500">
      <h3 className="text-center text-5xl style-script-regular">Gallery</h3>
      <section className="mx-auto p-4">
        <article>
          <ImageGallery
            items={photo.map((item) => ({
              ...item,
              original: item.photoURL,
              thumbnail: item.photoURL,
            }))}
            showNav={true}
            showThumbnails={false}
            showPlayButton={false}
            slideDuration={1000}
          />
        </article>
      </section>
    </div>
  );
};
export default GalleryPage;
