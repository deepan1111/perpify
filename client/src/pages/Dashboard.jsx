import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  return (
    <div className="wrap dash-shell">
      <div className="dash-header">
        <div>
          <h1>Hey, {user.name.split(" ")[0]}</h1>
          <p>Your packs and credits will show up here.</p>
        </div>
        <button className="btn btn-ghost" onClick={handleLogout}>
          Log out
        </button>
      </div>

      <div className="credit-card">
        <div className="count">{user.credits}</div>
        <p>free credits available — use one to unlock a company pack.</p>
      </div>
    </div>
  );
}
