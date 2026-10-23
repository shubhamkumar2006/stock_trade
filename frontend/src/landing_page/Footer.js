import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="st-footer" id="support">
      <div className="st-footer__main">
        <Link className="st-brand" to="/">
          <span className="st-brand__mark">S</span>
          <span>Stock<span>Traders</span></span>
        </Link>
        <p>Tools for more informed investing.</p>
        <small>© {new Date().getFullYear()} Stock Traders. All rights reserved.</small>
      </div>
      <div className="st-footer__column">
        <strong>Explore</strong><Link to="/">Home</Link><a href="/#markets">Markets</a><a href="/#features">Products</a>
      </div>
      <div className="st-footer__column">
        <strong>Account</strong><Link to="/signin">Sign in</Link><Link to="/signup">Open account</Link><Link to="/forgot-password">Reset password</Link>
      </div>
      <div className="st-footer__risk">
        Stock Traders is an educational demo. Market values are simulated and orders are not sent to any broker or exchange.
        Investing involves risk. This demo is not investment advice.
      </div>
    </footer>
  );
}

export default Footer;
