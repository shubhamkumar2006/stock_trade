import React from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="st-nav-wrap">
      <nav className="st-nav" aria-label="Main navigation">
        <Link className="st-brand" to="/" aria-label="Stock Traders home">
          <span className="st-brand__mark">S</span>
          <span>Stock <span>Traders</span></span>
        </Link>
        <div className="st-nav__links">
          <NavLink to="/">Home</NavLink>
          <a href="/#markets">Markets</a>
          <a href="/#features">Products</a>
          <a href="/#pricing">Pricing</a>
          <a href="/#support">Support</a>
        </div>
        <div className="st-nav__actions">
          <Link className="st-nav__signin" to="/signin">Sign in</Link>
          <Link className="st-nav__signup" to="/signup">Open free account <span>→</span></Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
