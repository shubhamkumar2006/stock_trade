import React from "react";

function DashboardPage() {
  const dashboardUrl = process.env.REACT_APP_DASHBOARD_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://singhtrades-dashboard.onrender.com"
      : "http://localhost:3000");

  return (
    <main aria-label="Trading dashboard">
      <iframe
        title="Stock Traders simulated dashboard"
        src={dashboardUrl}
        style={{
          display: "block",
          width: "100%",
          height: "calc(100vh - 90px)",
          border: 0,
        }}
      />
    </main>
  );
}

export default DashboardPage;
