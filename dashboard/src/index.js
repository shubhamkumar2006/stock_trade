import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import "./index.css";
import Home from "./components/Home";

function ProtectedHome() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";
    fetch(`${apiUrl}/api/auth/me`, { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("unauthenticated");
        return response.json();
      })
      .then(() => setStatus("ready"))
      .catch(() => {
        setStatus("signed-out");
        window.location.replace(`${process.env.REACT_APP_WEB_URL || "http://localhost:3001"}/signin?next=/dashboard`);
      });
  }, []);

  if (status !== "ready") {
    return <main className="session-check">{status === "checking" ? "Checking your session…" : "Redirecting to sign in…"}</main>;
  }

  return <Home />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<ProtectedHome />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
