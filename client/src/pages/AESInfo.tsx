import React from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../components/UserDropdown";
import "./home.css";

const AESInfo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <UserDropdown />
      
      <div className="info-shell">
        <button onClick={() => navigate("/home")} className="info-back">
          ← Back to AES Suite
        </button>

        <h1 className="info-title">Learn AES Encryption</h1>
        <p className="info-lead">
          A comprehensive guide to understanding the Advanced Encryption Standard (AES),
          its inner workings, block cipher modes, and practical applications.
        </p>

        <section className="info-section">
          <h2 className="info-heading">What is AES?</h2>
          <p className="info-text">
            AES (Advanced Encryption Standard) is a symmetric block cipher encryption
            algorithm adopted by the U.S. government in 2001. It encrypts data in fixed-size
            blocks of 128 bits using keys of 128, 192, or 256 bits. AES is widely used
            worldwide to secure sensitive data in banking, communications, military, and more.
          </p>
        </section>

        <section className="info-section">
          <h2 className="info-heading">Key Sizes</h2>
          <p className="info-text">
            AES supports three key sizes, each offering different security levels:
          </p>
          <ul className="info-list">
            <li>
              <strong>AES-128:</strong> 128-bit key, 10 rounds of encryption. Fast and secure
              for most applications.
            </li>
            <li>
              <strong>AES-192:</strong> 192-bit key, 12 rounds. More secure than AES-128, but
              less commonly used.
            </li>
            <li>
              <strong>AES-256:</strong> 256-bit key, 14 rounds. Maximum security, recommended
              for top-secret government data.
            </li>
          </ul>
        </section>

        <section className="info-section">
          <h2 className="info-heading">How AES Works (High-Level)</h2>
          <p className="info-text">
            AES operates on a 4×4 matrix of bytes called the <em>state</em>. Each encryption
            round (except the last) applies four transformations:
          </p>
          <ol className="info-list">
            <li>
              <strong>SubBytes:</strong> Non-linear substitution using an S-box to add confusion.
            </li>
            <li>
              <strong>ShiftRows:</strong> Cyclically shifts rows of the state for diffusion.
            </li>
            <li>
              <strong>MixColumns:</strong> Linear mixing of columns for further diffusion.
            </li>
            <li>
              <strong>AddRoundKey:</strong> XORs the state with a round key derived from the main key.
            </li>
          </ol>
          <p className="info-text">
            The final round omits MixColumns. These operations ensure that even a single-bit
            change in the plaintext or key results in a drastically different ciphertext.
          </p>
        </section>

        <section className="info-section">
          <h2 className="info-heading">Block Cipher Modes</h2>
          <p className="info-text">
            AES encrypts 16-byte blocks. For longer messages, we use <em>modes of operation</em>:
          </p>
          <ul className="info-list">
            <li>
              <strong>ECB (Electronic Codebook):</strong> Each block encrypted independently.
              Simple but insecure for repetitive data (patterns visible).
            </li>
            <li>
              <strong>CBC (Cipher Block Chaining):</strong> Each plaintext block is XORed with
              the previous ciphertext block before encryption. Requires an IV. More secure than ECB.
            </li>
            <li>
              <strong>CFB (Cipher Feedback):</strong> Turns AES into a stream cipher. Encrypts
              the IV/previous ciphertext, then XORs with plaintext.
            </li>
            <li>
              <strong>OFB (Output Feedback):</strong> Similar to CFB but feedback comes from
              the encryption output, not the ciphertext. Good for error-prone channels.
            </li>
            <li>
              <strong>CTR (Counter):</strong> Encrypts an incrementing counter and XORs with
              plaintext. Parallelizable and widely used in modern protocols.
            </li>
          </ul>
        </section>

        <section className="info-section">
          <h2 className="info-heading">Security Considerations</h2>
          <p className="info-text">
            AES is considered secure against brute-force attacks. However, proper implementation
            is crucial:
          </p>
          <ul className="info-list">
            <li>Use strong, random keys and never reuse them carelessly.</li>
            <li>Avoid ECB mode for anything beyond single-block encryption.</li>
            <li>
              Use authenticated encryption modes (like GCM) to prevent tampering and ensure
              integrity.
            </li>
            <li>Keep your encryption libraries up to date to avoid known vulnerabilities.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2 className="info-heading">Try It Yourself</h2>
          <p className="info-text">
            Use our interactive AES visualizers to see how the algorithm transforms plaintext
            into ciphertext step by step. Experiment with different key sizes and modes to
            deepen your understanding.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AESInfo;