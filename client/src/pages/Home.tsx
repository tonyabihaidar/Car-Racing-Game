import React from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../components/UserDropdown";
import "./home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <UserDropdown />
      
      <div className="home-container">
        <div className="home-hero">
          <h1 className="home-hero-title">AES Suite</h1>
          <p className="home-hero-subtitle">
            Comprehensive AES encryption visualization, learning platform, and security analysis tools
          </p>
        </div>

        <div className="home-grid">
          {/* Dashboard */}
          <button
            type="button"
            className="home-card"
            onClick={() => navigate("/dashboard")}
          >
            <div className="home-card-icon">📊</div>
            <div className="home-card-content">
              <h3 className="home-card-title">Dashboard</h3>
              <p className="home-card-description">
                Review your encryption history and saved sessions
              </p>
            </div>
          </button>

          {/* Learn AES */}
          <button
            type="button"
            className="home-card"
            onClick={() => navigate("/aes-info")}
          >
            <div className="home-card-icon">📚</div>
            <div className="home-card-content">
              <h3 className="home-card-title">Learn AES</h3>
              <p className="home-card-description">
                Understand AES encryption, block modes, and key sizes
              </p>
            </div>
          </button>

          {/* Single Block Encryption */}
          <button
            type="button"
            className="home-card"
            onClick={() => navigate("/aes")}
          >
            <div className="home-card-icon">🔐</div>
            <div className="home-card-content">
              <h3 className="home-card-title">Single-Block Encryption</h3>
              <p className="home-card-description">
                Encrypt one block and visualize AES rounds step-by-step
              </p>
            </div>
          </button>

          {/* Full Text Encryption */}
          <button
            type="button"
            className="home-card"
            onClick={() => navigate("/aes/full-text")}
          >
            <div className="home-card-icon">📝</div>
            <div className="home-card-content">
              <h3 className="home-card-title">Full-Text Encryption</h3>
              <p className="home-card-description">
                Encrypt messages using ECB, CBC, CFB, OFB, or CTR modes
              </p>
            </div>
          </button>

          {/* Single Block Decryption */}
          <button
            type="button"
            className="home-card"
            onClick={() => navigate("/aes/decrypt")}
          >
            <div className="home-card-icon">🔓</div>
            <div className="home-card-content">
              <h3 className="home-card-title">Single-Block Decryption</h3>
              <p className="home-card-description">
                Decrypt one block and visualize inverse AES operations
              </p>
            </div>
          </button>

          {/* Full Text Decryption */}
          <button
            type="button"
            className="home-card"
            onClick={() => navigate("/aes/decrypt/full-text")}
          >
            <div className="home-card-icon">🔑</div>
            <div className="home-card-content">
              <h3 className="home-card-title">Full-Text Decryption</h3>
              <p className="home-card-description">
                Decrypt ciphertext in all 5 modes with block visualization
              </p>
            </div>
          </button>

          {/* Security Analysis */}
          <button
            type="button"
            className="home-card"
            onClick={() => navigate("/security")}
          >
            <div className="home-card-icon">🛡️</div>
            <div className="home-card-content">
              <h3 className="home-card-title">Security & Attacks</h3>
              <p className="home-card-description">
                Learn about AES security, vulnerabilities, and attack vectors
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;