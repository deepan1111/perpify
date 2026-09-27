import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../lib/api.js";

import "./Auth.css";

export default function Signup({ onAuthed }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signup(form);

      navigate("/verify-email", {
        state: {
          email: data.email,
        },
      });
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
        <h1>Create your account</h1>

        <p className="sub">
          Sign up, then unlock any company's pack for ₹59.
        </p>

        <div className="auth-note">
          🎫 ₹59 per pack · one-time · 7-day money-back guarantee
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              required
              placeholder="Your full name"
              value={form.name}
              onChange={update("name")}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={update("password")}
            />
          </div>
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}