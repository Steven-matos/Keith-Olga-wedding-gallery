import React, { useState, useEffect } from "react";
import useSWR from "swr";
import axios from "axios";
import Gallery from "react-image-gallery";
const ImageGallery = Gallery.default ? Gallery.default : Gallery;

// SWR fetcher function
const fetcher = (url) => axios.get(url).then((res) => res.data);

// SWR configuration
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 300000, // 5 minutes
  dedupingInterval: 60000, // 1 minute
  errorRetryCount: 3,
};

const GalleryPage = () => {
  const [photo, setPhotos] = useState([]);
  const { data, error } = useSWR(
    `${process.env.REACT_APP_API}/api/photo/all-photos`,
    fetcher,
    swrConfig
  );

  useEffect(() => {
    if (error) console.error("Failed to load photos");
    if (data) setPhotos(data);
  }, [data, error]);

  return (
    <div className="mt-7 mx-4 md:mx-11 pt-7 rounded-none border-t-2 border-solid border-slate-500">
      <h3 className="text-center text-3xl md:text-5xl style-script-regular mb-6">
        Gallery
      </h3>
      <section className="mx-auto p-2 md:p-4">
        <article className="max-w-4xl mx-auto">
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
            infinite={true}
            lazyLoad={true}
            additionalClass="mobile-gallery"
          />
        </article>
      </section>
    </div>
  );
};

export default GalleryPage;
