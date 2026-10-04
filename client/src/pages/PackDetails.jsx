import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPublicPack } from "../lib/api.js";
import {
  createPaymentOrder,
  verifyPayment,
} from "../lib/api.js";
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
  if (!Number.isFinite(value) || value <= 0) return "Free";
  return `₹${value}`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/*
 * Normalises the material of a round.
 * Works when material is a URL string or an object,
 * and returns null when there is no file.
 */
function getMaterial(round) {
  const raw =
    round?.material ??
    round?.materialUrl ??
    round?.fileUrl ??
    round?.questionFile ??
    null;

  if (!raw) return null;

  const url =
    typeof raw === "string"
      ? raw
      : raw.url || raw.secure_url || raw.fileUrl || raw.link || "";

  const explicitName =
    typeof raw === "string"
      ? ""
      : raw.name || raw.originalName || raw.filename || "";

  if (!url && !explicitName) return null;

  const cleanUrl = url.split("?")[0];

  let lastPart = "";
  try {
    lastPart = decodeURIComponent(cleanUrl.split("/").pop() || "");
  } catch {
    lastPart = cleanUrl.split("/").pop() || "";
  }

  const ext = lastPart.includes(".") ? lastPart.split(".").pop() : "";

  return {
    name: explicitName || lastPart || "Interview Material",
    type: (typeof raw === "object" && raw.type) || ext || "PDF",
  };
}

export default function PackDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- LOAD PACK ---------- */
  useEffect(() => {
    let cancelled = false;

    async function loadPack() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchPublicPack(slug);
        if (!cancelled) setPack(data.pack || data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load preparation pack");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPack();
    return () => {
      cancelled = true;
    };
  }, [slug]);



  useEffect(() => {
  if (window.Razorpay) return;

  const script = document.createElement("script");

  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;

  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);

  /* ---------- DERIVED DATA ---------- */
  const roleName = useMemo(() => getRoleName(pack?.role), [pack]);
  const companyName = useMemo(() => getCompanyName(pack?.company), [pack]);

  const rounds = useMemo(
    () =>
      Array.isArray(pack?.rounds)
        ? [...pack.rounds].sort(
            (a, b) => Number(a.order || 0) - Number(b.order || 0)
          )
        : [],
    [pack]
  );

  const materialCount = useMemo(
    () => rounds.filter((r) => getMaterial(r)).length,
    [rounds]
  );

  const isFree =
    !Number.isFinite(Number(pack?.price)) || Number(pack?.price) <= 0;

  /* ---------- ACTIONS ---------- */
 async function handleBuy() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to purchase this preparation pack.");
      return;
    }

    if (!pack?._id && !pack?.id) {
      alert("Pack information is unavailable.");
      return;
    }

    if (isFree) {
      alert("This pack is free.");
      return;
    }

    if (!window.Razorpay) {
      alert("Payment system is still loading. Please try again.");
      return;
    }

    const packId = pack._id || pack.id;

    const data = await createPaymentOrder(
      token,
      packId
    );

   const options = {
  key: data.keyId,

  amount: data.order.amount,

  currency: data.order.currency,

  name: "Prepify",

  description: data.pack.title,

  order_id: data.order.id,

  handler: async function (response) {
    try {
      console.log(
        "Razorpay response:",
        response
      );

      const verification = await verifyPayment(
        token,
        {
          razorpay_order_id:
            response.razorpay_order_id,

          razorpay_payment_id:
            response.razorpay_payment_id,

          razorpay_signature:
            response.razorpay_signature,
        }
      );

      if (!verification.success) {
        throw new Error(
          verification.error ||
          "Payment verification failed"
        );
      }

      console.log(
        "✅ Payment verified:",
        verification
      );

      alert(
        "Payment verified successfully."
      );

    } catch (error) {
      console.error(
        "❌ Payment verification failed:",
        error
      );

      alert(
        error.message ||
        "Payment verification failed."
      );
    }
  },

  modal: {
    ondismiss: function () {
      console.log(
        "Razorpay checkout closed."
      );
    },
  },

  theme: {
    color: "#111111",
  },
};

    const razorpay = new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      function (response) {
        console.error(
          "Razorpay payment failed:",
          response.error
        );

        alert(
          response.error?.description ||
          "Payment failed."
        );
      }
    );

    razorpay.open();
  } catch (error) {
    console.error(
      "Razorpay checkout error:",
      error
    );

    alert(
      error.message ||
      "Unable to start payment."
    );
  }
}

  // Do NOT open material.url here. The backend must verify the
  // purchase before returning the actual file.
  function handleOpenMaterial(round) {
    if (!round?._id) return;
    alert(
      "Please purchase this preparation pack to access the material / question file."
    );
  }

  /* ---------- LOADING ---------- */
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

  /* ---------- ERROR ---------- */
  if (error || !pack) {
    return (
      <div className="user-page pack-page">
        <div className="pack-shell">
          <button className="pack-back-button" onClick={() => navigate(-1)}>
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

  /* ---------- PAGE ---------- */
  return (
    <div className="user-page pack-page">
      <div className="pack-shell">
        {/* BACK */}
        <button className="pack-back-button" onClick={() => navigate(-1)}>
          <span>←</span>
          Back to preparation packs
        </button>

        {/* HERO */}
        <section className="pack-main-card">
          <div className="pack-hero-left">
            <div className="pack-company-row">
              <div className="pack-company-logo">
                {companyName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="pack-company-name">{companyName}</div>
                <div className="pack-pack-label">INTERVIEW PREPARATION</div>
              </div>
            </div>

            <h1 className="pack-main-title">{pack.title}</h1>

            {roleName && <div className="pack-main-role">{roleName}</div>}

            <p className="pack-main-description">
              Company-specific interview preparation for
              {roleName ? ` the ${roleName} role.` : " your interview."}
            </p>

            <div className="pack-hero-divider"></div>

            <div className="pack-hero-bottom">
              <div className="pack-price-block">
                <span>PACK PRICE</span>
                <strong>{formatPrice(pack.price)}</strong>
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
            <div className="pack-hero-number">01</div>
            <div className="pack-hero-pattern">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="pack-stats">
          <div className="pack-stat-card">
            <div className="pack-stat-top">
              <span className="pack-stat-number">{pad(rounds.length)}</span>
              <span className="pack-stat-icon">↗</span>
            </div>
            <span className="pack-stat-label">Interview Rounds</span>
            <p>Know what to expect</p>
          </div>

          <div className="pack-stat-card">
            <div className="pack-stat-top">
              <span className="pack-stat-number">{pad(materialCount)}</span>
              <span className="pack-stat-icon">📄</span>
            </div>
            <span className="pack-stat-label">Material Files</span>
            <p>Question files per round</p>
          </div>

          <div className="pack-stat-card">
            <div className="pack-stat-top">
              <span className="pack-stat-number">
                {isFree ? "Free" : "Paid"}
              </span>
              <span className="pack-stat-icon">{isFree ? "✓" : "🔒"}</span>
            </div>
            <span className="pack-stat-label">Access</span>
            <p>{isFree ? "Open to everyone" : "Unlocked after purchase"}</p>
          </div>
        </section>

        {/* HOW TO PREPARE */}
        {pack.preparation && (
          <section className="pack-content-section">
            <div className="pack-section-header">
              <div className="pack-section-number">01</div>
              <div>
                <span>PREPARATION</span>
                <h2>How to Prepare</h2>
              </div>
            </div>

            <div className="pack-preparation-card">
              <div className="pack-preparation-mark">"</div>
              <div className="pack-preparation-text">
                {pack.preparation.split("\n").map((line, index) => (
                  <p key={index}>{line || "\u00A0"}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* INTERVIEW ROUNDS */}
        <section className="pack-content-section">
          <div className="pack-section-header">
            <div className="pack-section-number">02</div>
            <div>
              <span>INTERVIEW PROCESS</span>
              <h2>Interview Rounds</h2>
            </div>
          </div>

          {rounds.length === 0 ? (
            <div className="pack-empty">
              <strong>Round details coming soon</strong>
              <span>Interview round information will be added here.</span>
            </div>
          ) : (
            <div className="pack-rounds">
              {rounds.map((round, index) => {
                const material = getMaterial(round);
                const preparation = round?.howToPrepare || "";

                return (
                  <article
                    className="pack-round"
                    key={round?._id || `${round.name}-${index}`}
                  >
                    <div className="pack-round-index">{pad(index + 1)}</div>

                    <div className="pack-round-main">
                      <div className="pack-round-heading">
                        <h3>{round.name}</h3>
                        <span>ROUND {pad(index + 1)}</span>
                      </div>

                      {preparation && (
                        <div className="pack-round-preparation">
                          <div className="pack-round-subtitle">
                            <span className="pack-round-subtitle-icon">✓</span>
                            <strong>How to Prepare</strong>
                          </div>
                          <p>{preparation}</p>
                        </div>
                      )}

                      {/* Only rendered when a file exists */}
                      {material && (
                        <div className="pack-round-material">
                          <div className="pack-round-subtitle">
                            <span className="pack-round-subtitle-icon">
                              📄
                            </span>
                            <strong>Material / Question File</strong>
                          </div>

                          <div className="pack-round-file">
                            <div className="pack-round-file-icon">🔒</div>

                            <div className="pack-round-file-info">
                              <strong>{material.name}</strong>
                              <span>
                                {String(material.type).toUpperCase()} ·
                                Available after purchase
                              </span>
                            </div>

                            <button
                              type="button"
                              className="pack-round-file-button"
                              onClick={() => handleOpenMaterial(round)}
                            >
                              🔒 Locked
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* INCLUDED */}
        <section className="pack-content-section">
          <div className="pack-section-header">
            <div className="pack-section-number">03</div>
            <div>
              <span>YOUR PACK</span>
              <h2>What's Included</h2>
            </div>
          </div>

          <div className="pack-included-grid">
            <div className="pack-included-card">
              <div className="pack-included-icon">01</div>
              <div>
                <h3>Interview Rounds</h3>
                <p>
                  {rounds.length} interview{" "}
                  {rounds.length === 1 ? "round" : "rounds"} with structured
                  preparation.
                </p>
              </div>
            </div>

            <div className="pack-included-card">
              <div className="pack-included-icon">02</div>
              <div>
                <h3>Round-wise Preparation</h3>
                <p>How to prepare for each interview round.</p>
              </div>
            </div>

            <div className="pack-included-card">
              <div className="pack-included-icon">03</div>
              <div>
                <h3>Material / Question Files</h3>
                <p>Protected files attached directly to the relevant round.</p>
              </div>
            </div>

            <div className="pack-included-card">
              <div className="pack-included-icon">04</div>
              <div>
                <h3>Company-specific Content</h3>
                <p>Content structured for this company and role.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="pack-final-cta">
          <div>
            <span>READY WHEN YOU ARE</span>
            <h2>{isFree ? "Get this pack for free" : "Unlock this pack"}</h2>
            <p>
              {rounds.length} {rounds.length === 1 ? "round" : "rounds"} ·{" "}
              {materialCount} material {materialCount === 1 ? "file" : "files"}
            </p>
          </div>

          <div className="pack-final-action">
            <div className="pack-final-price">{formatPrice(pack.price)}</div>
            <button className="pack-primary-button" onClick={handleBuy}>
              {isFree ? "Get Pack" : "Buy & Unlock"}
              <span>→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}