import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPublicPack } from "../lib/api.js";
import "./UserUI.css";

function getRoleName(role) {
  if (!role) return "";
  if (typeof role === "string") return role;
  return role.name || "";
}

function getCompanyName(company) {
  if (!company) return "Company";
  if (typeof company === "string") return company;
  return company.name || "Company";
}

function formatPrice(price) {
  const value = Number(price);

  if (!Number.isFinite(value) || value <= 0) {
    return "Free";
  }

  return `₹${value}`;
}

export default function PackDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPack() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchPublicPack(slug);

        if (!cancelled) {
          setPack(data.pack || data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load preparation pack");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPack();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const roleName = useMemo(
    () => getRoleName(pack?.role),
    [pack]
  );

  const companyName = useMemo(
    () => getCompanyName(pack?.company),
    [pack]
  );

  const rounds = Array.isArray(pack?.rounds)
    ? [...pack.rounds].sort(
        (a, b) => Number(a.order || 0) - Number(b.order || 0)
      )
    : [];

  const questionCount =
    pack?.questionCount ??
    (Array.isArray(pack?.questions)
      ? pack.questions.length
      : 0);

  const materialCount =
    pack?.materialCount ??
    (Array.isArray(pack?.materials)
      ? pack.materials.length
      : 0);

  const isFree =
    !Number.isFinite(Number(pack?.price)) ||
    Number(pack?.price) <= 0;

  function handleBuy() {
    alert("Payment will be connected in the next step.");
  }

  if (loading) {
    return (
      <div className="user-page pack-page">
        <div className="pack-shell">
          <div className="pack-loading">
            <div className="pack-loading-line"></div>
            <div className="pack-loading-line short"></div>
            <div className="pack-loading-card"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="user-page pack-page">
        <div className="pack-shell">
          <button
            className="pack-back-button"
            onClick={() => navigate(-1)}
          >
            <span>←</span>
            Back
          </button>

          <div className="pack-error">
            <div className="pack-error-icon">!</div>

            <h2>Pack not found</h2>

            <p>
              {error ||
                "This preparation pack is unavailable or has been removed."}
            </p>

            <button
              className="pack-primary-button"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-page pack-page">
      <div className="pack-shell">

        {/* BACK */}
        <button
          className="pack-back-button"
          onClick={() => navigate(-1)}
        >
          <span>←</span>
          Back to preparation packs
        </button>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="pack-main-card">

          <div className="pack-hero-left">

            <div className="pack-company-row">
              <div className="pack-company-logo">
                {companyName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="pack-company-name">
                  {companyName}
                </div>

                <div className="pack-pack-label">
                  INTERVIEW PREPARATION
                </div>
              </div>
            </div>

            <h1 className="pack-main-title">
              {pack.title}
            </h1>

            {roleName && (
              <div className="pack-main-role">
                {roleName}
              </div>
            )}

            <p className="pack-main-description">
              Company-specific interview preparation for
              {roleName ? ` the ${roleName} role.` : " your interview."}
            </p>

            <div className="pack-hero-divider"></div>

            <div className="pack-hero-bottom">

              <div className="pack-price-block">
                <span>PACK PRICE</span>

                <strong>
                  {formatPrice(pack.price)}
                </strong>
              </div>

              <button
                className="pack-primary-button pack-hero-button"
                onClick={handleBuy}
              >
                {isFree ? "Get Pack" : "Buy & Unlock"}
                <span>→</span>
              </button>

            </div>

          </div>

          <div className="pack-hero-right">

            <div className="pack-hero-badge">
              <span></span>
              {isFree ? "FREE PACK" : "PREMIUM PACK"}
            </div>

            <div className="pack-hero-number">
              01
            </div>

            <div className="pack-hero-pattern">
              <div></div>
              <div></div>
              <div></div>
            </div>

          </div>

        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="pack-stats">

          <div className="pack-stat-card">
            <div className="pack-stat-top">
              <span className="pack-stat-number">
                {String(rounds.length).padStart(2, "0")}
              </span>

              <span className="pack-stat-icon">
                ↗
              </span>
            </div>

            <span className="pack-stat-label">
              Interview Rounds
            </span>

            <p>
              Know what to expect
            </p>
          </div>

          <div className="pack-stat-card">
            <div className="pack-stat-top">
              <span className="pack-stat-number">
                {String(questionCount).padStart(2, "0")}
              </span>

              <span className="pack-stat-icon">
                ?
              </span>
            </div>

            <span className="pack-stat-label">
              Questions
            </span>

            <p>
              Practice relevant questions
            </p>
          </div>

          <div className="pack-stat-card">
            <div className="pack-stat-top">
              <span className="pack-stat-number">
                {String(materialCount).padStart(2, "0")}
              </span>

              <span className="pack-stat-icon">
                +
              </span>
            </div>

            <span className="pack-stat-label">
              Materials
            </span>

            <p>
              Supporting preparation resources
            </p>
          </div>

        </section>

        {/* =====================================================
            PREPARATION
        ===================================================== */}

        {pack.preparation && (
          <section className="pack-content-section">

            <div className="pack-section-header">
              <div className="pack-section-number">
                01
              </div>

              <div>
                <span>PREPARATION</span>
                <h2>How to Prepare</h2>
              </div>
            </div>

            <div className="pack-preparation-card">

              <div className="pack-preparation-mark">
                "
              </div>

              <div className="pack-preparation-text">
                {pack.preparation
                  .split("\n")
                  .map((line, index) => (
                    <p key={index}>
                      {line || "\u00A0"}
                    </p>
                  ))}
              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            ROUNDS
        ===================================================== */}

        <section className="pack-content-section">

          <div className="pack-section-header">
            <div className="pack-section-number">
              02
            </div>

            <div>
              <span>PROCESS</span>
              <h2>Interview Rounds</h2>
            </div>
          </div>

          {rounds.length === 0 ? (
            <div className="pack-empty">
              <strong>
                Round details coming soon
              </strong>

              <span>
                Interview round information will be added here.
              </span>
            </div>
          ) : (
            <div className="pack-rounds">

              {rounds.map((round, index) => (
                <article
                  className="pack-round"
                  key={`${round.name}-${index}`}
                >

                  <div className="pack-round-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="pack-round-main">

                    <div className="pack-round-heading">
                      <h3>
                        {round.name}
                      </h3>

                      <span>
                        ROUND {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {round.description && (
                      <p>
                        {round.description}
                      </p>
                    )}

                  </div>

                  <div className="pack-round-arrow">
                    →
                  </div>

                </article>
              ))}

            </div>
          )}

        </section>

        {/* =====================================================
            INCLUDED
        ===================================================== */}

        <section className="pack-content-section">

          <div className="pack-section-header">
            <div className="pack-section-number">
              03
            </div>

            <div>
              <span>YOUR PACK</span>
              <h2>What's Included</h2>
            </div>
          </div>

          <div className="pack-included-grid">

            <div className="pack-included-card">
              <div className="pack-included-icon">
                01
              </div>

              <div>
                <h3>
                  Interview Questions
                </h3>

                <p>
                  {questionCount} company-specific{" "}
                  {questionCount === 1
                    ? "question"
                    : "questions"}{" "}
                  for practice.
                </p>
              </div>
            </div>

            <div className="pack-included-card">
              <div className="pack-included-icon">
                02
              </div>

              <div>
                <h3>
                  Preparation Materials
                </h3>

                <p>
                  {materialCount} preparation{" "}
                  {materialCount === 1
                    ? "material"
                    : "materials"}{" "}
                  included.
                </p>
              </div>
            </div>

            <div className="pack-included-card">
              <div className="pack-included-icon">
                03
              </div>

              <div>
                <h3>
                  Round-wise Preparation
                </h3>

                <p>
                  Preparation organized around
                  the interview process.
                </p>
              </div>
            </div>

            <div className="pack-included-card">
              <div className="pack-included-icon">
                04
              </div>

              <div>
                <h3>
                  Company-specific Content
                </h3>

                <p>
                  Content structured for this
                  company and role.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="pack-final-cta">

          <div>
            <span>
              READY WHEN YOU ARE
            </span>

            <h2>
              Start preparing for{" "}
              {companyName}.
            </h2>

            <p>
              Get access to the complete
              preparation pack.
            </p>
          </div>

          <div className="pack-final-action">

            <div className="pack-final-price">
              {formatPrice(pack.price)}
            </div>

            <button
              className="pack-primary-button"
              onClick={handleBuy}
            >
              {isFree ? "Get Pack" : "Buy & Unlock"}
              <span>→</span>
            </button>

          </div>

        </section>

      </div>
    </div>
  );
}