import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../lib/api.js";

import "./Auth.css";

export default function Login({ onAuthed }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function update(field) {
    return (e) => {
      setForm((f) => ({
        ...f,
        [field]: e.target.value,
      }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(form);

      // Save token and user/admin state
      onAuthed(data);

      // Redirect based on role
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">

      {/* TOPBAR — redirects back to the landing page */}
      <div className="auth-topbar">
        <Link to="/" className="auth-brand">
          Prep Vault
        </Link>

        <Link to="/" className="auth-home-link">
          ← Back to home
        </Link>
      </div>

      <div className="auth-card">
        <h1>Welcome back</h1>

        <p className="sub">
          Log in to see your packs and pick up where you left off.
        </p>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              placeholder="you@college.edu"
              value={form.email}
              onChange={update("email")}
            />
          </div>

          <div className="field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={update("password")}
            />
          </div>

          <button
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? "Logging in…"
              : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          New here?{" "}
          <Link to="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}