import React from "react";
import { Link } from "react-router-dom";

const PACKS = [
  {
    name: "Quant & logical reasoning",
    detail: "Topic-wise sets built around the patterns each company actually tests.",
  },
  {
    name: "Coding practice",
    detail: "Original problems with walkthroughs, not copy-pasted from forums.",
  },
  {
    name: "Interview breakdowns",
    detail: "What's asked at each round, and how to structure your answers.",
  },
];

export default function Landing({ user }) {
  return (
    <div>
      <nav className="nav wrap">
        <Link to="/" className="brand">
          Prep Vault
        </Link>
        <div className="nav-links">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Get free credits
              </Link>
            </>
          )}
        </div>
      </nav>

      <header className="hero wrap">
        <p className="hero-eyebrow">Company-specific placement packs</p>
        <h1>Stop guessing what a company's test will look like.</h1>
        <p>
          Each pack is built around one company's actual hiring pattern — aptitude, coding,
          technical rounds and interview questions, organised and kept up to date. Try one free,
          then unlock the rest for ₹59.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary">
            Start with free credits
          </Link>
          <Link to="/login" className="btn btn-ghost">
            I already have an account
          </Link>
        </div>
        <p className="hero-note">No card required to try a pack.</p>
      </header>

      <div className="companies wrap">
        <span>Accenture</span>
        <span>TCS</span>
        <span>Infosys</span>
        <span>Cognizant</span>
        <span>Capgemini</span>
        <span>Deloitte</span>
        <span>Zoho</span>
      </div>

      <section className="section wrap">
        <h2>What's inside a pack</h2>
        <div className="grid">
          {PACKS.map((pack) => (
            <div className="pack-item" key={pack.name}>
              <h3>{pack.name}</h3>
              <p>{pack.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="pricing">
          <div>
            <div className="pricing-amount">
              ₹59 <span>per company pack</span>
            </div>
          </div>
          <Link to="/signup" className="btn btn-primary">
            Claim your free credits
          </Link>
        </div>
      </section>

      <footer className="footer wrap">
        <span>© {new Date().getFullYear()} Prep Vault</span>
        <span>Built for students, updated regularly</span>
      </footer>
    </div>
  );
}
