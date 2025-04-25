import React from "react";
import "../App.css";
import couple from "../assets/olga-keith.jpg";

const Header = () => {
  return (
    <>
      <header className="header">
        <h1 className="title style-script-regular text-4xl md:text-5xl">
          Keith & Olga
        </h1>
      </header>
      <section className="px-4 md:px-8">
        <img
          src={couple}
          className="m-auto mb-2 h-64 md:h-96 w-auto rounded-md object-cover"
          alt="Olga and Keith"
        />
        <article className="text-center p-3 max-w-2xl mx-auto">
          <p className="text-base md:text-lg">
            As we prepare for our special wedding day on <b>May 17, 2025</b>,
            from 4pm to 10pm, we're thrilled to share this special moment with
            you.
            <br />
            <br /> Join us as we celebrate the union of Olga and Keith in an
            evening filled with love, joy, and cherished memories!
            <br />
            <br />
          </p>
          <p className="text-base md:text-lg">
            <b>
              RSVP by March 25 <br /> text or call
            </b>
            <br />
            <a
              className="underline underline-offset-4 text-blue-600 hover:text-blue-800 active:text-blue-900"
              href="tel:321-437-8105"
            >
              321-437-8105
            </a>
          </p>
          <br />
          <address className="not-italic">
            <span className="italic">Address</span>
            <br />
            <a
              className="underline underline-offset-4 text-blue-600 hover:text-blue-800 active:text-blue-900"
              href="https://maps.app.goo.gl/vLxoRTqfQmMBrh597"
              rel="noreferrer noopener"
              target="_blank"
            >
              414 King St, Oviedo, FL 32765
            </a>
          </address>
          <p className="text-base md:text-lg mt-4">
            Share your favorite photos from the wedding day with us and relive
            the magic! Upload your pics below and let's create a treasure trove
            of memories together!
          </p>
        </article>
      </section>
    </>
  );
};

export default Header;
