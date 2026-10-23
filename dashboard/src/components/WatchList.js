import React, { useState, useContext, useEffect } from "react";

import GeneralContext from "./GeneralContext";

import { Tooltip, Grow } from "@mui/material";

import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

import { watchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";

const WatchList = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [watchlistError, setWatchlistError] = useState("");
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3002"}/api/watchlist`, { credentials: "include" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load your watchlist.");
        if (Array.isArray(data.instruments)) {
          setItems(data.instruments.map((symbol) => (
            watchlist.find((stock) => stock.name === symbol) || {
              name: symbol,
              price: "—",
              percent: "—",
              isDown: false,
            }
          )));
        }
      })
      .catch((error) => {
        setWatchlistError(error.message);
      })
      .finally(() => setLoadingWatchlist(false));
  }, []);

  const addInstrument = async (event) => {
    event.preventDefault();
    const symbol = search.trim().toUpperCase();
    if (!symbol) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3002"}/api/watchlist`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save instrument.");
      setItems((current) => current.some((stock) => stock.name === symbol)
        ? current
        : [...current, watchlist.find((stock) => stock.name === symbol) || {
          name: symbol,
          price: "—",
          percent: "—",
          isDown: false,
        }]);
      setSearch("");
      setWatchlistError("");
    } catch (error) {
      setWatchlistError(error.message);
    }
  };

  const removeInstrument = async (symbol) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3002"}/api/watchlist/${encodeURIComponent(symbol)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Could not remove instrument from your watchlist.");
      setItems((current) => current.filter((stock) => stock.name !== symbol));
      setWatchlistError("");
    } catch (error) {
      setWatchlistError(error.message);
    }
  };

  const visibleItems = items.filter((stock) => stock.name.toLowerCase().includes(search.trim().toLowerCase()));
  const data = {
    labels: visibleItems.map((stock) => stock.name),
    datasets: [
      {
        label: "Price",
        data: visibleItems.map((stock) => typeof stock.price === "number" ? stock.price : 0),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // export const data = {
  //   labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  // datasets: [
  //   {
  //     label: "# of Votes",
  //     data: [12, 19, 3, 5, 2, 3],
  //     backgroundColor: [
  //       "rgba(255, 99, 132, 0.2)",
  //       "rgba(54, 162, 235, 0.2)",
  //       "rgba(255, 206, 86, 0.2)",
  //       "rgba(75, 192, 192, 0.2)",
  //       "rgba(153, 102, 255, 0.2)",
  //       "rgba(255, 159, 64, 0.2)",
  //     ],
  //     borderColor: [
  //       "rgba(255, 99, 132, 1)",
  //       "rgba(54, 162, 235, 1)",
  //       "rgba(255, 206, 86, 1)",
  //       "rgba(75, 192, 192, 1)",
  //       "rgba(153, 102, 255, 1)",
  //       "rgba(255, 159, 64, 1)",
  //     ],
  //     borderWidth: 1,
  //   },
  // ],
  // };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <form onSubmit={addInstrument}>
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search / add symbol, e.g. INFY"
          className="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="watchlist-add" type="submit" aria-label="Add symbol to watchlist">Add</button>
        <span className="counts"> {items.length} / 50</span>
        </form>
        <p className="watchlist-demo-note">Prices shown here are sample data.</p>
        {watchlistError && <p className="watchlist-error" role="alert">{watchlistError}</p>}
      </div>

      <ul className="list">
        {visibleItems.map((stock) => {
          return <WatchListItem stock={stock} key={stock.name} onRemove={removeInstrument} />;
        })}
        {loadingWatchlist && <li className="watchlist-empty">Loading your watchlist…</li>}
        {!loadingWatchlist && visibleItems.length === 0 && !watchlistError && <li className="watchlist-empty">Your watchlist is empty. Add an instrument above.</li>}
      </ul>

      <DoughnutChart data={data} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onRemove }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = () => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = () => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span className="price">{stock.price}</span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions uid={stock.name} onRemove={onRemove} />}
    </li>
  );
};

const WatchListActions = ({ uid, onRemove }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openOrderWindow(uid, "BUY");
  };

  const handleSellClick = () => {
    generalContext.openOrderWindow(uid, "SELL");
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="buy" onClick={handleBuyClick}>Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="sell" onClick={handleSellClick}>Sell</button>
        </Tooltip>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action" onClick={() => onRemove(uid)} aria-label={`Remove ${uid} from watchlist`}>
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
