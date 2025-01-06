import React from "react";
import "../App.css";

const Header = () => {
  return (
    <>
      <header className="header">
        <h1 className="title style-script-regular">Keith & Olga 2025</h1>
      </header>
      <section>
        <article className="text-center p-2">
          <h2 className="text-2xl py-1">
            Welcome to Olga & Keith's Wedding Website!
          </h2>
          <p>
            As we count down to our special day on May 2025, we're excited to
            share this celebration with you. Share your favorite photos from the
            wedding day with us and relive the magic! <br />
            <br /> Upload your pics here and let's create a treasure trove of
            memories together!
          </p>
        </article>
      </section>
    </>
  );
};

export default Header;
