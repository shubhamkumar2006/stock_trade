import React from "react";

import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  return (
    <>
      <TopBar />
      <div className="dashboard-demo-banner">
        Educational demo · market values and portfolio examples are simulated · no trades are executed
      </div>
      <Dashboard />
    </>
  );
};

export default Home;
