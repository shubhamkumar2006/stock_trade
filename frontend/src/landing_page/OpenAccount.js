import React from "react";
import { Link } from "react-router-dom";

function OpenAccount() {
  return (
    <section className="st-cta">
      <div>
        <div className="st-eyebrow">START WITH STOCK TRADERS</div>
        <h2>Your next investing chapter starts here.</h2>
        <p>Explore a demo workspace for learning about markets.</p>
      </div>
      <Link className="st-button st-button--light" to="/signup">Create account <span>→</span></Link>
    </section>
  );
}

export default OpenAccount;
