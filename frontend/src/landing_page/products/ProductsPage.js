import React from "react";
import { Link } from "react-router-dom";

const products = [
  ["Market overview", "Explore illustrative index and instrument data in one uncluttered view."],
  ["Personal watchlists", "Save symbols to your account and return to them whenever you sign in."],
  ["Practice orders", "Learn the basics of placing an order using a clearly marked simulation."],
];

function ProductsPage() {
  return (
    <main className="container py-5">
      <header className="text-center py-5">
        <p className="st-eyebrow">STOCK TRADERS TOOLS</p>
        <h1 className="display-5 fw-semibold">A practical investing workspace</h1>
        <p className="text-secondary">Explore tools for learning and organization, not real-market execution.</p>
      </header>
      <div className="row g-4">
        {products.map(([title, description]) => (
          <article className="col-md-4" key={title}>
            <div className="border rounded-4 p-4 h-100 bg-white">
              <h2 className="h5">{title}</h2>
              <p className="text-secondary mb-0">{description}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="text-center mt-5"><Link className="st-button st-button--primary" to="/signup">Explore Stock Traders <span>→</span></Link></div>
    </main>
  );
}

export default ProductsPage;
