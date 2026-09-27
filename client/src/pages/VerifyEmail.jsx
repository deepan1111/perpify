
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmail, resendOTP } from "../lib/api.js";

export default function VerifyEmail({ onAuthed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await verifyEmail({
        email,
        otp,
      });

      onAuthed(data);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");

    try {
      const data = await resendOTP(email);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Verify your email</h1>

        <p className="sub">
          We sent a 6-digit verification code to:
        </p>

        <strong>{email}</strong>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {message && (
          <div className="form-success">
            {message}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="field">
            <label htmlFor="otp">
              Verification code
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          className="btn"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}