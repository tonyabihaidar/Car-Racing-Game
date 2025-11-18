// client/src/pages/Signup.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";

const API_URL = "http://localhost:8080";

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!email.includes("@") || !email.includes(".")) {
      return setError("Please enter a valid email address.");
    }
    if (pw1.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (pw1 !== pw2) {
      return setError("Passwords do not match.");
    }

    setIsSubmitting(true);

    try {
      // Call backend API
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password: pw1,
      });

      console.log("Signup successful:", response.data);
      setSuccess("Account created successfully! Redirecting...");
      
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      console.error("Signup error:", err);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-overlay" />

      <div className="auth-shell">
        <section className="auth-side">
          <div className="auth-side-pill">AES Suite</div>
          <h1 className="auth-side-title">Create an Account</h1>
          <p className="auth-side-text">
            Sign up to unlock AES workspace features and save your encryption sessions.
          </p>
        </section>

        <section className="auth-card">
          <div className="auth-toggle">
            <button
              className="auth-toggle-btn"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
            <button className="auth-toggle-btn auth-toggle-btn--active">
              Sign up
            </button>
          </div>

          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">It's fast and secure.</p>

          {error && <div className="auth-alert auth-alert--error">{error}</div>}
          {success && (
            <div className="auth-alert auth-alert--success">{success}</div>
          )}

          <form className="auth-form" onSubmit={handleSignup}>
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="•••••••"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="•••••••"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                required
              />
            </div>

            <button 
              className="auth-submit" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?
              <button
                className="auth-link-button auth-footer-link"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;