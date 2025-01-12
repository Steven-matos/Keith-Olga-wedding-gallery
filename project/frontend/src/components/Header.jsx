import React from "react";
import "../App.css";
import couple from "../assets/olga-keith.jpg";

const Header = () => {
  return (
    <>
      <header className="header">
        <h1 className="title style-script-regular">Keith & Olga</h1>
      </header>
      <section>
        <img
          src={couple}
          className="m-auto mb-2 h-96 rounded-md"
          alt="Olga and Keith"
        />
        <article className="text-center p-3">
          <p>
            As we prepare for our special wedding day on <b>May 17, 2025</b>,
            from 4pm to 10pm, we're thrilled to share this special moment with
            you.
            <br />
            <br /> Join us as we celebrate the union of Olga and Keith in an
            evening filled with love, joy, and cherished memories!
            <br />
            <br />
          </p>
          <p>
            <b>RSVP by March 25</b>
            <br />
            <a className="underline underline-offset-4" href="tel:321-437-8105">
              321-437-8105
            </a>
          </p>
          <br />
          <address>
            <span className="italic">Address</span>
            <br />
            <a
              className="underline underline-offset-4"
              href="https://maps.app.goo.gl/vLxoRTqfQmMBrh597"
              rel="noreferrer noopener"
              target="_blank"
            >
              414 King St, Ovideo, FL 32765
            </a>
          </address>
          <p>
            <br />
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
