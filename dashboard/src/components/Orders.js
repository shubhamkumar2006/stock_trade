import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3002"}/api/orders`, { credentials: "include" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load simulated orders.");
        setOrders(data.orders || []);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="orders">
      <div className="orders-heading">
        <div>
          <h3 className="title">Orders</h3>
          <p className="simulated-data-note">Simulated orders only. No broker or exchange is connected.</p>
        </div>
        <span className="simulated-order-badge">PRACTICE MODE</span>
      </div>
      {error && <p className="order-error" role="alert">{error}</p>}
      {loading ? <p>Loading simulated orders…</p> : orders.length === 0 && !error ? (
        <div className="no-orders">
          <p>You haven’t placed any practice orders yet.</p>
          <Link to="/" className="btn">Explore watchlist</Link>
        </div>
      ) : (
        orders.length > 0 && (
          <div className="order-table">
            <table>
              <thead>
                <tr><th>Instrument</th><th>Side</th><th>Quantity</th><th>Status</th><th>Created</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.symbol}</td>
                    <td className={order.side === "BUY" ? "profit" : "loss"}>{order.side}</td>
                    <td>{order.quantity}</td>
                    <td>Simulated</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </section>
  );
};

export default Orders;
