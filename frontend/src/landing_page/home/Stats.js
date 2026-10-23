import React from "react";

function Stats() {
  return (
    <section className="container py-5">
      <div className="row g-4">
        <div className="col-md-4">
          <h3 className="h5">See the context</h3>
          <p className="text-secondary">A simple overview helps keep market information organized.</p>
        </div>
        <div className="col-md-4">
          <h3 className="h5">Stay in control</h3>
          <p className="text-secondary">Your watchlist is attached to your signed-in account.</p>
        </div>
        <div className="col-md-4">
          <h3 className="h5">Practice safely</h3>
          <p className="text-secondary">Orders are simulated and never sent to a broker or exchange.</p>
        </div>
      </div>
    </section>
  );
}

export default Stats;
