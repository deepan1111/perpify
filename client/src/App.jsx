import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import PackDetails from "./pages/PackDetails.jsx";
import CompanyPage from "./pages/CompanyPage.jsx";

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
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setCheckedAuth(true);
      });
  }, []);

  function handleAuthed({ token, user }) {
    localStorage.setItem("token", token);
    setUser(user);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  if (!checkedAuth) {
    return null;
  }

  return (
    <Routes>

      {/* Landing */}
      <Route
        path="/"
        element={<Landing user={user} />}
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />

      {/* Company preparation */}
      <Route
        path="/company/:slug"
        element={<CompanyPage />}
      />

      {/* Pack details */}
      <Route
        path="/pack/:slug"
        element={<PackDetails />}
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onAuthed={handleAuthed} />
          )
        }
      />

      {/* Signup */}
      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Signup onAuthed={handleAuthed} />
          )
        }
      />

      {/* Email verification */}
      <Route
        path="/verify-email"
        element={
          <VerifyEmail onAuthed={handleAuthed} />
        }
      />

      {/* User dashboard */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <Dashboard
              user={user}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}