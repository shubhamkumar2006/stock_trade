import React from "react";

function Awards() {
  return (
    <section className="container py-5">
      <div className="row align-items-center">
        <div className="col-lg-6">
          <div className="p-4 p-lg-5 rounded-4" style={{ background: "#eaf2ff", color: "#214d8e" }}>
            <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1 }}>S</div>
            <p className="mb-0 mt-3">A workspace designed for clarity.</p>
          </div>
        </div>
        <div className="col-lg-6 p-4">
          <p className="st-eyebrow">MADE FOR LEARNING</p>
          <h2 className="display-6">Explore markets with context.</h2>
          <p className="text-secondary">
            Review illustrative market movements, build a personal watchlist,
            and practice with simulated order workflows.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Awards;
