import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [userName, setUserName] = useState("Investor");
  const [logoutError, setLogoutError] = useState("");

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3002"}/api/auth/me`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.user?.fullName) setUserName(data.user.fullName);
      })
      .catch((error) => console.error("Could not load account profile:", error));
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3002"}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("The server could not revoke this session.");
      window.location.replace(`${process.env.REACT_APP_WEB_URL || "http://localhost:3001"}/signin`);
    } catch (error) {
      console.error("Could not revoke the server session:", error);
      setLogoutError("Sign out failed. Please check your connection and retry.");
    }
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  return (
    <div className="menu-container">
      <Link className="dashboard-brand" to="/">ST</Link>
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
              onClick={() => handleMenuClick(6)}
            >
              <p className={selectedMenu === 6 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />
        <div className="profile">
          <div className="avatar">{userName.slice(0, 2).toUpperCase()}</div>
          <p className="username">{userName}</p>
          <div>
            <button className="dashboard-logout" type="button" onClick={handleLogout}>Sign out</button>
            {logoutError && <span className="logout-error" role="alert">{logoutError}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
