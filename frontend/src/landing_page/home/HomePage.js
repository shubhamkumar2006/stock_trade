import React from "react";
import { Link } from "react-router-dom";

const market = [
  { name: "NIFTY 50", value: "22,450.35", change: "+0.42%", positive: true },
  { name: "SENSEX", value: "73,950.80", change: "+0.36%", positive: true },
  { name: "RELIANCE", value: "1,450.20", change: "-0.28%", positive: false },
];

const features = [
  { icon: "◒", title: "Portfolio clarity", text: "Understand your holdings and performance with a clean, unified view." },
  { icon: "⌕", title: "Market insights", text: "Follow market movements and explore instruments in one place." },
  { icon: "☆", title: "Personal watchlists", text: "Keep the securities you care about close and easy to review." },
  { icon: "↗", title: "Practice orders", text: "Learn order flows in a simulated environment before making decisions." },
];

function HomePage() {
  return (
    <main className="st-home">
      <section className="st-hero">
        <div className="st-hero__copy">
          <div className="st-eyebrow"><span /> A clearer way to invest</div>
          <h1>Build your market confidence, <em>one decision at a time.</em></h1>
          <p>
            Stock Traders brings your watchlists, portfolio insights, and market
            learning tools together in one thoughtful investing workspace.
          </p>
          <div className="st-hero__actions">
            <Link className="st-button st-button--primary" to="/signup">Open a free account <span>→</span></Link>
            <Link className="st-button st-button--quiet" to="/signin">Sign in</Link>
          </div>
          <div className="st-trust-note"><span>●</span> Practice safely with simulated orders. No real trades are placed.</div>
        </div>

        <div className="st-market-card" id="markets">
          <div className="st-market-card__top">
            <div><span className="st-eyebrow">MARKET PULSE</span><h2>Today at a glance</h2></div>
            <span className="st-simulated">SIMULATED DATA</span>
          </div>
          <div className="st-chart">
            <div className="st-chart__grid"><i /><i /><i /><i /></div>
            <svg viewBox="0 0 600 190" role="img" aria-label="Illustrative market chart">
              <defs><linearGradient id="marketFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3a80f7" stopOpacity=".25" /><stop offset="100%" stopColor="#3a80f7" stopOpacity="0" /></linearGradient></defs>
              <path d="M0 148 C35 136 36 151 70 132 S120 113 145 126 S191 119 217 96 S256 116 282 92 S322 104 348 71 S388 88 412 72 S457 84 479 48 S527 65 551 33 S580 43 600 18 L600 190 L0 190Z" fill="url(#marketFill)" />
              <path d="M0 148 C35 136 36 151 70 132 S120 113 145 126 S191 119 217 96 S256 116 282 92 S322 104 348 71 S388 88 412 72 S457 84 479 48 S527 65 551 33 S580 43 600 18" fill="none" stroke="#3a80f7" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="st-market-card__rows">
            {market.map((item) => (
              <div className="st-market-row" key={item.name}>
                <span>{item.name}</span><strong>₹{item.value}</strong>
                <b className={item.positive ? "positive" : "negative"}>{item.change}</b>
              </div>
            ))}
          </div>
          <small className="st-market-disclaimer">Illustrative values for product demonstration only.</small>
        </div>
      </section>

      <section className="st-features" id="features">
        <div className="st-section-heading">
          <div className="st-eyebrow">TOOLS FOR THOUGHTFUL INVESTING</div>
          <h2>Everything you need to stay <em>informed.</em></h2>
          <p>Simple, useful tools that help you see the bigger picture.</p>
        </div>
        <div className="st-feature-grid">
          {features.map((feature) => (
            <article className="st-feature-card" key={feature.title}>
              <div className="st-feature-card__icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <span className="st-feature-card__arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="st-cta" id="pricing">
        <div>
          <div className="st-eyebrow">START WITH STOCK TRADERS</div>
          <h2>Your next investing chapter starts here.</h2>
          <p>Create an account to explore the Stock Traders demo workspace.</p>
        </div>
        <Link className="st-button st-button--light" to="/signup">Get started <span>→</span></Link>
      </section>
    </main>
  );
}

export default HomePage;
