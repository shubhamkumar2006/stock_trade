import React from "react";

function DashboardPage() {
  return (
    <main aria-label="Trading dashboard">
      <iframe
        title="Stock Traders simulated dashboard"
        src={process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3000"}
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
