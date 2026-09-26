import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { fetchMe } from "./lib/api.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCheckedAuth(true);
      return;
    }
    fetchMe(token)
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setCheckedAuth(true));
  }, []);

  function handleAuthed({ token, user }) {
    localStorage.setItem("token", token);
    setUser(user);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  if (!checkedAuth) return null;

  return (
    <Routes>
      <Route path="/" element={<Landing user={user} />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login onAuthed={handleAuthed} />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" /> : <Signup onAuthed={handleAuthed} />}
      />
      <Route
        path="/dashboard"
        element={
          user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}
