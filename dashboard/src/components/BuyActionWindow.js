import React, { useContext, useState } from "react";
import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid, side }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3002"}/api/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: uid, quantity: Number(stockQuantity), side }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not place simulated order.");
      generalContext.closeBuyWindow();
    } catch (requestError) {
      setError(requestError.message || "Could not place simulated order.");
    } finally {
      setBusy(false);
    }
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              max="100000"
              step="1"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Order type</legend>
            <input type="text" value={`Simulated ${side.toLowerCase()} order`} readOnly />
          </fieldset>
        </div>
        <p className="simulated-order-notice">Demo only — this order is not sent to a broker or exchange.</p>
        {error && <p className="order-error" role="alert">{error}</p>}
      </div>

      <div className="buttons">
        <span>Simulated order</span>
        <div>
          <button type="button" className="btn btn-blue" onClick={handleBuyClick} disabled={busy}>{busy ? "Submitting…" : `Simulate ${side}`}</button>
          <button type="button" className="btn btn-grey" onClick={handleCancelClick} disabled={busy}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
