import React from "react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="container py-5">
      <div className="row py-5">
        <div className="col-lg-8 mx-auto text-center">
          <p className="st-eyebrow">STOCK TRADERS HELP</p>
          <h1 className="display-5 fw-semibold">How can we help?</h1>
          <p className="text-secondary">Find account guidance and answers about this educational demo.</p>
          <Link to="/signup" className="st-button st-button--primary">Create an account <span>→</span></Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
