import React from "react";
import { Link } from "react-router-dom";

function Universe() {
  return (
    <section className="container py-5 text-center">
      <p className="st-eyebrow">ONE CONNECTED WORKSPACE</p>
      <h2 className="display-6">Your market tools, together.</h2>
      <p className="text-secondary">Watchlists, portfolio examples, and simulated orders in one educational demo.</p>
      <Link className="st-button st-button--primary mt-3" to="/signup">Get started <span>→</span></Link>
    </section>
  );
}

export default Universe;
