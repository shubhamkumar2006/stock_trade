import React from "react";

function PricingPage() {
  return (
    <main className="container py-5">
      <div className="text-center py-5">
        <p className="st-eyebrow">SIMPLE BY DESIGN</p>
        <h1 className="display-5 fw-semibold">Explore the demo for free.</h1>
        <p className="text-secondary">This educational version has no brokerage connection, real orders, or financial account balance.</p>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="bg-white border rounded-4 p-4 p-lg-5">
            <p className="st-eyebrow">STOCK TRADERS DEMO</p>
            <h2 className="display-6 fw-semibold">$0</h2>
            <p className="text-secondary">No subscription is charged by this local demo.</p>
            <ul className="text-secondary">
              <li>Simulated market snapshots</li>
              <li>Personal watchlists</li>
              <li>Practice orders only</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PricingPage;
