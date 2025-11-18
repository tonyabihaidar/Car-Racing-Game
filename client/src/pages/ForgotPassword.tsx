import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) {
      return "Please enter your email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: email.trim()
      });

      if (response.data.success) {
        setSuccess(response.data.message);
      } else {
        setError(response.data.message || "Failed to send reset link");
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(
        err.response?.data?.message || 
        "An error occurred. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="auth-root"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      <section className="auth-card fp-card">
        <button
          type="button"
          className="auth-link-button"
          onClick={() => navigate("/login")}
          style={{ marginBottom: "12px" }}
        >
          ← Back to login
        </button>

        <h2 className="auth-title">Reset your password</h2>
        <p className="auth-subtitle">
          Enter your email to receive password recovery instructions.
        </p>

        {error && (
          <div className="auth-alert auth-alert--error">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert auth-alert--success">
            <span>{success}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending link..." : "Send reset link"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ForgotPassword;