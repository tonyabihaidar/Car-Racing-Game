// client/src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email.includes("@") || !email.includes(".")) {
      return setError("Please enter a valid email address.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setIsSubmitting(true);

    try {
      // Call your backend API
      const response = await axios.post("http://localhost:8080/auth/login",  {
        email,
        password,
      });

      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      
      // Store user data if needed
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Success - redirect to home
      console.log("Login successful:", response.data);
      navigate("/home");

    } catch (err: any) {
      console.error("Login error:", err);
      
      // Display error message from backend
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-overlay" />

      <div className="auth-shell">
        {/* LEFT PANEL */}
        <section className="auth-side">
          <div className="auth-side-pill">AES Suite</div>
          <h1 className="auth-side-title">AES Encryption Visualizer</h1>
          <p className="auth-side-text">
            Explore AES rounds, view internal state transformations, and encrypt
            full messages.
          </p>

          <div className="auth-side-foot">
            <p className="auth-side-foot-title">Highlights</p>
            <ul className="auth-side-list">
              <li>Full AES-128/192/256 support.</li>
              <li>Round-by-round visualization.</li>
              <li>ECB / CBC / CFB / OFB / CTR modes.</li>
            </ul>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="auth-card">
          <div className="auth-toggle">
            <button className="auth-toggle-btn auth-toggle-btn--active">
              Log in
            </button>
            <button
              className="auth-toggle-btn"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </button>
          </div>

          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Enter your credentials to continue.</p>

          {error && (
            <div className="auth-alert auth-alert--error">{error}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="auth-row">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <button
                className="auth-link-button"
                type="button"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <button className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?
              <button
                className="auth-link-button auth-footer-link"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;