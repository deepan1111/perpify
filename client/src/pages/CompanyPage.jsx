import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchPublicCompanies,
  fetchPublishedPacks,
} from "../lib/api";

import "./UserUI.css";

export default function CompanyPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [company, setCompany] = useState(null);
  const [packs, setPacks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompany();
  }, [slug]);

  async function loadCompany() {
    try {
      setLoading(true);
      setError("");

      const [companyResponse, packResponse] =
        await Promise.all([
          fetchPublicCompanies(),
          fetchPublishedPacks(),
        ]);

      const companies = companyResponse?.companies || [];
      const allPacks = packResponse?.packs || [];

      // ----------------------------------------
      // FIND COMPANY
      // ----------------------------------------

      const foundCompany = companies.find(
        (item) =>
          String(item.slug).toLowerCase() === String(slug).toLowerCase()
      );

      if (!foundCompany) {
        setError("Company not found.");
        return;
      }

      setCompany(foundCompany);

      // ----------------------------------------
      // MATCH PACKS
      // ----------------------------------------

      const companyId = String(foundCompany.id || foundCompany._id || "");
      const companySlug = String(foundCompany.slug || "").toLowerCase();
      const companyName = String(foundCompany.name || "").trim().toLowerCase();

      const companyPacks = allPacks.filter((pack) => {
        // 1. companyId
        if (companyId && String(pack.companyId || "") === companyId) {
          return true;
        }

        // 2. companySlug
        if (
          companySlug &&
          String(pack.companySlug || "").toLowerCase() === companySlug
        ) {
          return true;
        }

        // 3. company name
        if (
          companyName &&
          String(pack.company || "").trim().toLowerCase() === companyName
        ) {
          return true;
        }

        return false;
      });

      setPacks(companyPacks);

    } catch (err) {
      console.error("Company page error:", err);
      setError(err.message || "Failed to load company");
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="user-dashboard">
        <main className="user-dashboard-main">
          <div className="dashboard-loading">
            <div className="loading-spinner" />
            <p>Loading company...</p>
          </div>
        </main>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !company) {
    return (
      <div className="user-dashboard">
        <main className="user-dashboard-main">

          <button
            type="button"
            className="company-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <div className="empty-packs">
            <div className="empty-icon">⚠️</div>
            <h3>{error || "Company not found"}</h3>
            <p>We couldn't load this company.</p>
          </div>

        </main>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="user-dashboard">

      {/* HEADER */}

      <header className="user-dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark">P</div>
          <div>
            <h2>Prepify</h2>
            <span>Interview Preparation</span>
          </div>
        </div>
      </header>


      {/* MAIN */}

      <main className="user-dashboard-main">

        <button
          type="button"
          className="company-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>


        {/* COMPANY DOSSIER HEADER */}

        <section className="company-dossier">

          <div className="company-dossier-mark">
            {company.name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <p className="dashboard-eyebrow">Company preparation</p>
            <h1>{company.name}</h1>
            <p>
              {company.description || `Prepare for ${company.name} interviews.`}
            </p>
          </div>

        </section>


        {/* ROLES */}

        <section>

          <div className="section-heading">
            <p className="dashboard-eyebrow">Available roles</p>
            <h2>Choose your role</h2>
            <p>Select the preparation pack you want to explore.</p>
          </div>


          {/* NO PACKS */}

          {packs.length === 0 ? (

            <div className="empty-packs">
              <div className="empty-icon">📚</div>
              <h3>No published preparation packs</h3>
              <p>
                Preparation material for <strong>{company.name}</strong> hasn't
                been published yet.
              </p>
            </div>

          ) : (

            <div className="pack-grid">

              {packs.map((pack) => {

                const roleName =
                  typeof pack.role === "object" ? pack.role?.name : pack.role;

                const roundCount = pack.roundCount ?? pack.rounds?.length ?? 0;

                const questionCount =
                  pack.questionCount ?? pack.questions?.length ?? 0;

                const materialCount =
                  pack.materialCount ?? pack.materials?.length ?? 0;

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
                        "Company-specific interview preparation."}
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

          )}

        </section>

      </main>

    </div>
  );
}