import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./auth.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError("Invalid reset link. Please request a new password reset.");
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const validate = () => {
    if (!newPassword) {
      return "Please enter a new password.";
    }
    if (newPassword.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (newPassword !== confirmPassword) {
      return "Passwords do not match.";
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

    if (!token) {
      setError("Invalid reset link.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword
      });

      if (response.data.success) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to reset password");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.message || 
        "Failed to reset password. Please try again."
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

        <h2 className="auth-title">Create new password</h2>
        <p className="auth-subtitle">
          Enter your new password below.
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
            <label htmlFor="newPassword" className="auth-label">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword" className="auth-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ResetPassword;