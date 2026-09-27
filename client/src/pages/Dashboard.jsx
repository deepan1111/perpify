import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchPublicCompanies,
  fetchPublishedPacks,
} from "../lib/api";

import "../pages/UserUI.css";

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [packs, setPacks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // LOGOUT
  // ========================================

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  // ========================================
  // LOAD DASHBOARD
  // ========================================

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [companyData, packData] = await Promise.all([
        fetchPublicCompanies(),
        fetchPublishedPacks(),
      ]);

      setCompanies(
        Array.isArray(companyData?.companies)
          ? companyData.companies
          : []
      );

      setPacks(
        Array.isArray(packData?.packs)
          ? packData.packs
          : []
      );
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err?.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // ========================================
  // FIND PACKS FOR COMPANY
  // ========================================

  function getCompanyPacks(company) {
    if (!company) return [];

    const companyId = String(
      company.id ||
      company._id ||
      ""
    );

    const companySlug = String(
      company.slug || ""
    )
      .trim()
      .toLowerCase();

    const companyName = String(
      company.name || ""
    )
      .trim()
      .toLowerCase();

    return packs.filter((pack) => {
      // ------------------------------------
      // COMPANY ID
      // ------------------------------------

      const packCompanyId = String(
        pack.companyId ||
        pack.company?._id ||
        pack.company?.id ||
        ""
      );

      if (
        companyId &&
        packCompanyId &&
        companyId === packCompanyId
      ) {
        return true;
      }

      // ------------------------------------
      // COMPANY SLUG
      // ------------------------------------

      const packCompanySlug = String(
        pack.companySlug ||
        pack.company?.slug ||
        ""
      )
        .trim()
        .toLowerCase();

      if (
        companySlug &&
        packCompanySlug &&
        companySlug === packCompanySlug
      ) {
        return true;
      }

      // ------------------------------------
      // COMPANY NAME
      // ------------------------------------

      const packCompanyName =
        typeof pack.company === "object"
          ? pack.company?.name
          : pack.company;

      if (
        companyName &&
        packCompanyName &&
        String(packCompanyName)
          .trim()
          .toLowerCase() === companyName
      ) {
        return true;
      }

      return false;
    });
  }

  // ========================================
  // GET FIRST NAME
  // ========================================

  const firstName =
    user?.name?.split(" ")[0] || "there";

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="user-dashboard">

      {/* ====================================
          HEADER
      ==================================== */}

      <header className="user-dashboard-header">

        <div className="dashboard-brand">

          <div className="brand-mark">P</div>

          <div>
            <h2>Prepify</h2>
            <span>Interview Preparation</span>
          </div>

        </div>

        <div className="dashboard-user-area">

          <div className="user-info">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email || ""}</span>
          </div>

          <button
            className="dashboard-logout"
            onClick={handleLogout}
          >
            Log out
          </button>

        </div>

      </header>


      {/* ====================================
          MAIN
      ==================================== */}

      <main className="user-dashboard-main">

        {/* ==================================
            WELCOME
        ================================== */}

        <section className="dashboard-welcome">

          <div>
            <p className="dashboard-eyebrow">Your prep desk</p>
            <h1>Hey, {firstName}</h1>
            <p className="dashboard-subtitle">
              Prepare smarter with company-specific interview packs,
              built round by round.
            </p>
          </div>

          <div className="credits-widget">
            <div className="credits-icon">✦</div>
            <div>
              <span>AVAILABLE CREDITS</span>
              <strong>{user?.credits ?? 0}</strong>
            </div>
          </div>

        </section>


        {/* ==================================
            STATS
        ================================== */}

        <section className="dashboard-stats">

          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <div>
              <strong>{packs.length}</strong>
              <span>Available packs</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🏢</span>
            <div>
              <strong>{companies.length}</strong>
              <span>Companies</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <div>
              <strong>{user?.credits ?? 0}</strong>
              <span>Credits remaining</span>
            </div>
          </div>

        </section>


        {/* ==================================
            PACK SECTION
        ================================== */}

        <section className="packs-section">

          <div className="section-heading">
            <p className="dashboard-eyebrow">Explore</p>
            <h2>Interview Prep Packs</h2>
            <p>Choose a company and start preparing.</p>
          </div>


          {/* LOADING */}

          {loading && (
            <div className="dashboard-loading">
              <div className="loading-spinner" />
              <p>Loading preparation packs...</p>
            </div>
          )}


          {/* ERROR */}

          {!loading && error && (
            <div className="dashboard-error">
              <div>⚠️</div>
              <div>
                <strong>Unable to load dashboard</strong>
                <p>{error}</p>
                <button onClick={loadDashboard}>Try again</button>
              </div>
            </div>
          )}


          {/* NO COMPANIES */}

          {!loading && !error && companies.length === 0 && (
            <div className="empty-packs">
              <div className="empty-icon">🏢</div>
              <h3>No companies available yet</h3>
              <p>New company preparation material will appear here soon.</p>
            </div>
          )}


          {/* COMPANIES */}

          {!loading && !error && companies.length > 0 && (
            <div>

              {companies.map((company) => {

                const companyPacks = getCompanyPacks(company);

                const companySlug =
                  company.slug ||
                  company.name
                    ?.toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-");

                return (

                  <div
                    className="company-section"
                    key={company.id || company._id || companySlug}
                  >

                    {/* CLICKABLE COMPANY HEADER */}

                    <button
                      type="button"
                      className="company-heading"
                      onClick={() => navigate(`/company/${companySlug}`)}
                      aria-label={`Open ${company.name}`}
                    >

                      <div className="company-logo">
                        {company.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div>
                        <h3>{company.name}</h3>
                        <span>
                          {companyPacks.length}{" "}
                          {companyPacks.length === 1 ? "prep pack" : "prep packs"}
                        </span>
                      </div>

                      <span className="company-heading-arrow">→</span>

                    </button>


                    {/* PACKS */}

                    {companyPacks.length > 0 ? (

                      <div className="pack-grid">

                        {companyPacks.map((pack) => {

                          const roleName =
                            typeof pack.role === "object"
                              ? pack.role?.name
                              : pack.role;

                          const roundCount =
                            pack.roundCount ?? pack.rounds?.length ?? 0;

                          const questionCount =
                            pack.questionCount ?? pack.questions?.length ?? 0;

                          const materialCount =
                            pack.materialCount ??
                            pack.materials?.length ??
                            pack.fileCount ??
                            0;

                          return (

                            <article
                              className="prep-pack-card"
                              key={pack.id || pack._id || pack.slug}
                            >

                              <div className="pack-card-top">
                                <div className="pack-icon">📘</div>
                                <span className="pack-status">Available</span>
                              </div>

                              <h4>{pack.title}</h4>

                              {roleName && (
                                <div className="pack-role-tag">{roleName}</div>
                              )}

                              <p className="pack-description">
                                {pack.preparation ||
                                  pack.description ||
                                  "Company-specific interview preparation material."}
                              </p>

                              <div className="pack-meta">
                                <span>
                                  🎯 {roundCount} {roundCount === 1 ? "round" : "rounds"}
                                </span>
                                <span>
                                  ❓ {questionCount}{" "}
                                  {questionCount === 1 ? "question" : "questions"}
                                </span>
                                <span>
                                  📚 {materialCount}{" "}
                                  {materialCount === 1 ? "material" : "materials"}
                                </span>
                              </div>

                              <div className="pack-card-footer">

                                <div className="pack-price">
                                  <span>Unlock</span>
                                  <strong>
                                    {Number(pack.price) > 0
                                      ? `₹${Number(pack.price).toLocaleString("en-IN")}`
                                      : "Free"}
                                  </strong>
                                </div>

                                <button
                                  type="button"
                                  className="pack-view-button"
                                  onClick={() => navigate(`/pack/${pack.slug}`)}
                                >
                                  View Pack
                                  <span>→</span>
                                </button>

                              </div>

                            </article>

                          );
                        })}

                      </div>

                    ) : (

                      <div className="company-no-packs">
                        <span>📚</span>
                        <div>
                          <strong>Preparation packs coming soon</strong>
                          <p>
                            Interview material for {company.name} hasn't been
                            published yet.
                          </p>
                        </div>
                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}