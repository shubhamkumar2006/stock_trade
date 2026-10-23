import React from "react";

function Hero() {
  return (
    <main className="container py-5">
      <div className="row py-5">
        <div className="col-lg-8 mx-auto text-center">
          <p className="st-eyebrow">ABOUT STOCK TRADERS</p>
          <h1 className="display-5 fw-semibold">A calmer way to explore investing.</h1>
          <p className="text-secondary mt-3">
            Stock Traders is an educational trading interface designed to make
            market concepts and portfolio tools easier to explore. The product
            currently uses simulated values and does not execute real trades.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Hero;
