import React from "react";
import { Link } from "react-router-dom";

import "./Landing.css";

const PACKS = [
  {
    name: "Quant & logical reasoning",
    detail: "Topic-wise sets built around the patterns each company actually tests, not a generic 500-question dump.",
  },
  {
    name: "Coding practice",
    detail: "Original problems with full walkthroughs — written for this pack, not copy-pasted from a forum thread.",
  },
  {
    name: "Interview breakdowns",
    detail: "What's asked at each round, in what order, and how to structure an answer that actually lands.",
  },
];

const REASONS = [
  {
    icon: "🎯",
    title: "Built around one company at a time",
    detail: "No generic 'placement prep' course. Every pack is scoped to how one company actually hires.",
  },
  {
    icon: "🔄",
    title: "Kept current every hiring season",
    detail: "Patterns shift year to year. Packs are revised as new rounds and question styles show up.",
  },
  {
    icon: "🧾",
    title: "One price, nothing recurring",
    detail: "₹39 unlocks the pack for good. No subscription, no auto-renewal to remember to cancel.",
  },
 
];

const FAQ = [
  {
    q: "What exactly do I get for ₹39?",
    a: "Full access to that company's pack — aptitude sets, coding problems with walkthroughs, and a round-by-round interview breakdown. It's yours permanently, no expiry.",
  },
  {
    q: "What if the pack doesn't help me?",
    a: "Email us within 7 days of unlocking a pack and we'll refund it, no back-and-forth. We'd rather lose ₹39 than have you feel misled.",
  },
  {
    q: "Do packs get updated after I buy?",
    a: "Yes. When a company's hiring pattern changes, the pack is revised and you get the update at no extra cost.",
  },
  {
    q: "My company isn't listed yet — what do I do?",
    a: "Tell us which company you're preparing for. New packs get built based on what students are actually asking for next.",
  },
];

export default function Landing({ user }) {
  return (
    <div className="landing">
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
                Unlock a pack
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
          technical rounds and interview questions, organised and kept current. No 400-video
          course to sit through, no scattered PDFs to piece together.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary">
            Unlock your first pack — ₹39
          </Link>
          <Link to="#whats-inside" className="btn btn-ghost">
            See what's inside
          </Link>
        </div>
        <p className="hero-note">
          One-time price ·  No subscription
        </p>
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

      {/* ==================================
          THE PROBLEM
      ================================== */}

      <section className="section wrap">
        <span className="section-tag">The problem</span>
        <h2>Generic prep wastes the time you don't have.</h2>
        <p className="section-lead">
          Most placement prep is the same 10,000-question bank reused for every company. You end
          up solving problems that were never going to show up, and walking in blind to the ones
          that were.
        </p>

        <div className="compare-grid">
          <div className="compare-card bad">
            <h3>Scattered prep</h3>
            <ul className="compare-list">
              <li>The same generic question bank, reused for every company</li>
              <li>No idea which rounds a company actually runs</li>
              <li>Hours lost hunting across YouTube, PDFs and old forum threads</li>
              <li>No way to tell if the material is even current</li>
            </ul>
          </div>

          <div className="compare-card good">
            <h3>Prep Vault pack</h3>
            <ul className="compare-list">
              <li>Built around one company's actual hiring pattern</li>
              <li>Round-by-round breakdown, so you know what's coming</li>
              <li>One pack, everything in one place</li>
              <li>Revised whenever the pattern changes</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================================
          WHAT'S INSIDE
      ================================== */}

      <section className="section wrap" id="whats-inside">
        <span className="section-tag">What's inside</span>
        <h2>Everything for one company, in one pack.</h2>
        <p className="section-lead">
          No separate purchases for coding vs. aptitude vs. interview prep. It's one pack per
          company, covering all three.
        </p>

        <div className="grid">
          {PACKS.map((pack) => (
            <div className="pack-item" key={pack.name}>
              <h3>{pack.name}</h3>
              <p>{pack.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================
          HOW IT WORKS
      ================================== */}

      <section className="section wrap">
        <span className="section-tag">How it works</span>
        <h2>Three steps to walking in ready.</h2>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Pick your company</h3>
            <p>Find the company on your list and open its pack.</p>
          </div>
          <div className="step">
            <div className="step-number">02</div>
            <h3>Unlock for ₹59</h3>
            <p>One payment, permanent access, updates included.</p>
          </div>
          <div className="step">
            <div className="step-number">03</div>
            <h3>Work through it round by round</h3>
            <p>Aptitude, coding, then the interview — in the order they'll actually test you.</p>
          </div>
        </div>
      </section>

      {/* ==================================
          WHY STUDENTS CHOOSE THIS
      ================================== */}

      <section className="section wrap">
        <span className="section-tag">Why it's worth ₹59</span>
        <h2>Less than a canteen meal. Built to actually be used.</h2>

        <div className="reasons-grid">
          {REASONS.map((reason) => (
            <div className="reason-card" key={reason.title}>
              <div className="reason-icon">{reason.icon}</div>
              <div>
                <h3>{reason.title}</h3>
                <p>{reason.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================
          PRICING / CLOSE
      ================================== */}

      <section className="pricing-section wrap">
        <div className="pricing-card">
          <div className="pricing-left">
            <span className="pricing-tag">SIMPLE, ONE-TIME PRICING</span>
            <div className="pricing-amount">
              ₹39
              <span>per company pack — yours permanently</span>
            </div>
          </div>

          <div className="pricing-right">
            <Link to="/signup" className="btn btn-gold">
              Unlock your first pack
            </Link>
            <span className="pricing-guarantee">7-day money-back guarantee</span>
            <span className="pricing-guarantee">No subscription, no auto-renewal</span>
          </div>
        </div>
      </section>

      {/* ==================================
          FAQ
      ================================== */}

      <section className="section wrap">
        <span className="section-tag">Before you unlock a pack</span>
        <h2>Questions students actually ask.</h2>

        <div className="faq-list">
          {FAQ.map((item) => (
            <div className="faq-item" key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================
          FINAL CTA
      ================================== */}

      <section className="final-cta wrap">
        <h2>Your next interview shouldn't be a guess.</h2>
        <p>
          Unlock the pack for the company you're preparing for and know exactly what's coming.
        </p>
        <Link to="/signup" className="btn btn-primary">
          Unlock your first pack — ₹39
        </Link>
      </section>

      <footer className="footer wrap">
        <span>© {new Date().getFullYear()} Prep Vault</span>
        <span>Built for students, updated every placement season</span>
      </footer>
    </div>
  );
}