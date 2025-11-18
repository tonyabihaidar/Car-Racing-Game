import React from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../components/UserDropdown";
import "../aes/aes.css";
import "./security.css";

const SecurityAnalysis: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="security-root">
      <UserDropdown />
      
      <div className="security-container">
        <button
          onClick={() => navigate("/home")}
          className="back-button"
        >
          ← Back to AES Suite
        </button>

        <div className="security-hero">
          <div className="security-icon">🛡️</div>
          <h1 className="security-title">AES Security & Attack Vectors</h1>
          <p className="security-subtitle">
            Understanding the security properties of AES encryption and known attack methods
          </p>
        </div>

        <div className="security-content">
          {/* Security Overview */}
          <section className="security-section">
            <h2 className="security-heading">Security Overview</h2>
            <p className="security-text">
              AES (Advanced Encryption Standard) is considered one of the most secure encryption algorithms available today. 
              It has been extensively analyzed by cryptographers worldwide since its adoption in 2001, and no practical 
              attacks against properly implemented AES have been discovered.
            </p>
            <div className="security-highlight">
              <strong>Key Fact:</strong> Breaking AES-256 by brute force would require 2^256 operations, which is 
              computationally infeasible with current and foreseeable technology. Even if you could check a trillion 
              keys per second, it would take billions of times the age of the universe to crack.
            </div>
          </section>

          {/* Key Sizes */}
          <section className="security-section">
            <h2 className="security-heading">Key Size Comparison</h2>
            <div className="security-grid">
              <div className="security-card">
                <div className="security-card-header">
                  <h3>AES-128</h3>
                  <span className="security-badge security-badge--high">High Security</span>
                </div>
                <ul className="security-list">
                  <li>128-bit key (16 bytes)</li>
                  <li>10 rounds of encryption</li>
                  <li>2^128 possible keys</li>
                  <li>Sufficient for most applications</li>
                  <li>Faster than larger key sizes</li>
                </ul>
              </div>

              <div className="security-card">
                <div className="security-card-header">
                  <h3>AES-192</h3>
                  <span className="security-badge security-badge--higher">Higher Security</span>
                </div>
                <ul className="security-list">
                  <li>192-bit key (24 bytes)</li>
                  <li>12 rounds of encryption</li>
                  <li>2^192 possible keys</li>
                  <li>Rarely used in practice</li>
                  <li>Balance between 128 and 256</li>
                </ul>
              </div>

              <div className="security-card">
                <div className="security-card-header">
                  <h3>AES-256</h3>
                  <span className="security-badge security-badge--maximum">Maximum Security</span>
                </div>
                <ul className="security-list">
                  <li>256-bit key (32 bytes)</li>
                  <li>14 rounds of encryption</li>
                  <li>2^256 possible keys</li>
                  <li>Required for TOP SECRET data</li>
                  <li>Slowest but most secure</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Known Attacks */}
          <section className="security-section">
            <h2 className="security-heading">Known Attack Vectors</h2>
            
            <div className="attack-card">
              <h3 className="attack-title">1. Brute Force Attack</h3>
              <div className="attack-content">
                <div className="attack-description">
                  <p><strong>Method:</strong> Trying every possible key until the correct one is found.</p>
                  <p><strong>Practicality:</strong> Completely impractical for AES. Even AES-128 would take 
                  billions of years with all computers on Earth working together.</p>
                  <p><strong>Defense:</strong> Use of sufficient key length (128-bit minimum).</p>
                </div>
                <div className="attack-stats">
                  <div className="stat-item">
                    <div className="stat-label">AES-128</div>
                    <div className="stat-value">2^128 keys</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Time to crack</div>
                    <div className="stat-value">~10^21 years</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="attack-card">
              <h3 className="attack-title">2. Biclique Attack (Theoretical)</h3>
              <div className="attack-content">
                <div className="attack-description">
                  <p><strong>Method:</strong> Advanced mathematical attack that is slightly faster than brute force.</p>
                  <p><strong>Discovered:</strong> 2011 by researchers</p>
                  <p><strong>Practicality:</strong> Still computationally infeasible. Only reduces complexity by a factor 
                  of 4 for AES-128, which is negligible.</p>
                  <p><strong>Impact:</strong> Purely theoretical; does not threaten practical AES security.</p>
                </div>
                <div className="attack-stats">
                  <div className="stat-item">
                    <div className="stat-label">Complexity</div>
                    <div className="stat-value">2^126 for AES-128</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Threat Level</div>
                    <div className="stat-value">None</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="attack-card">
              <h3 className="attack-title">3. Related-Key Attack</h3>
              <div className="attack-content">
                <div className="attack-description">
                  <p><strong>Method:</strong> Exploits relationships between encryption keys.</p>
                  <p><strong>Requirements:</strong> Attacker needs access to encryptions under related keys.</p>
                  <p><strong>Practicality:</strong> Not applicable in real-world scenarios where keys are randomly generated.</p>
                  <p><strong>Defense:</strong> Use proper key derivation and never use related keys.</p>
                </div>
              </div>
            </div>

            <div className="attack-card">
              <h3 className="attack-title">4. Side-Channel Attacks</h3>
              <div className="attack-content">
                <div className="attack-description">
                  <p><strong>Method:</strong> Analyzing physical implementation characteristics like timing, power consumption, 
                  or electromagnetic emissions.</p>
                  <p><strong>Types:</strong></p>
                  <ul className="attack-list">
                    <li><strong>Timing attacks:</strong> Measuring execution time variations</li>
                    <li><strong>Power analysis:</strong> Monitoring power consumption during encryption</li>
                    <li><strong>Cache attacks:</strong> Exploiting CPU cache behavior</li>
                  </ul>
                  <p><strong>Defense:</strong> Constant-time implementations, masking, physical shielding.</p>
                </div>
              </div>
            </div>

            <div className="attack-card">
              <h3 className="attack-title">5. Weak Implementation Attacks</h3>
              <div className="attack-content">
                <div className="attack-description">
                  <p><strong>Common Weaknesses:</strong></p>
                  <ul className="attack-list">
                    <li><strong>ECB Mode:</strong> Identical plaintexts produce identical ciphertexts (see ECB penguin)</li>
                    <li><strong>Weak keys:</strong> Using predictable or short keys</li>
                    <li><strong>Poor randomness:</strong> Weak IV or nonce generation</li>
                    <li><strong>Key reuse:</strong> Using the same key/IV combination</li>
                  </ul>
                  <p><strong>Defense:</strong> Use authenticated encryption modes (GCM), proper key management, 
                  cryptographic RNGs.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="security-section">
            <h2 className="security-heading">Security Best Practices</h2>
            <div className="best-practices-grid">
              <div className="practice-card">
                <div className="practice-icon">🔑</div>
                <h3 className="practice-title">Key Management</h3>
                <ul className="practice-list">
                  <li>Use cryptographically secure random number generators</li>
                  <li>Never hardcode keys in source code</li>
                  <li>Rotate keys periodically</li>
                  <li>Store keys securely (HSM, key management systems)</li>
                  <li>Use key derivation functions (KDF) when needed</li>
                </ul>
              </div>

              <div className="practice-card">
                <div className="practice-icon">🔐</div>
                <h3 className="practice-title">Mode Selection</h3>
                <ul className="practice-list">
                  <li>Never use ECB mode for anything beyond single blocks</li>
                  <li>Prefer authenticated encryption (GCM, CCM)</li>
                  <li>Use CBC with HMAC for authentication</li>
                  <li>Generate unique IVs for each encryption</li>
                  <li>Understand mode-specific requirements</li>
                </ul>
              </div>

              <div className="practice-card">
                <div className="practice-icon">⚡</div>
                <h3 className="practice-title">Implementation</h3>
                <ul className="practice-list">
                  <li>Use vetted cryptographic libraries</li>
                  <li>Implement constant-time operations</li>
                  <li>Protect against side-channel attacks</li>
                  <li>Validate all inputs</li>
                  <li>Keep software updated with security patches</li>
                </ul>
              </div>

              <div className="practice-card">
                <div className="practice-icon">🔍</div>
                <h3 className="practice-title">Testing & Auditing</h3>
                <ul className="practice-list">
                  <li>Use test vectors to verify correctness</li>
                  <li>Conduct security audits regularly</li>
                  <li>Perform penetration testing</li>
                  <li>Monitor for anomalous behavior</li>
                  <li>Follow security standards (FIPS 140-2)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Real-World Applications */}
          <section className="security-section">
            <h2 className="security-heading">Real-World Applications</h2>
            <div className="applications-grid">
              <div className="app-card">
                <h3>🌐 HTTPS/TLS</h3>
                <p>Secures web traffic using AES for symmetric encryption after key exchange.</p>
              </div>
              <div className="app-card">
                <h3>📱 Mobile Security</h3>
                <p>iOS and Android use AES to encrypt device storage and app data.</p>
              </div>
              <div className="app-card">
                <h3>💾 Disk Encryption</h3>
                <p>BitLocker, FileVault, and LUKS use AES to protect entire disk volumes.</p>
              </div>
              <div className="app-card">
                <h3>📡 VPNs</h3>
                <p>Virtual private networks use AES to create secure tunnels over the internet.</p>
              </div>
              <div className="app-card">
                <h3>💬 Messaging</h3>
                <p>Signal, WhatsApp, and Telegram use AES as part of end-to-end encryption.</p>
              </div>
              <div className="app-card">
                <h3>🏦 Banking</h3>
                <p>Financial transactions and ATM communications are secured with AES.</p>
              </div>
            </div>
          </section>

          {/* Quantum Computing */}
          <section className="security-section">
            <h2 className="security-heading">Quantum Computing Threat</h2>
            <p className="security-text">
              Quantum computers pose a theoretical threat to many cryptographic algorithms. However, AES is 
              relatively resistant to quantum attacks compared to asymmetric algorithms like RSA.
            </p>
            <div className="quantum-grid">
              <div className="quantum-card">
                <h3>Grover's Algorithm</h3>
                <p>Quantum algorithm that can search unsorted databases in O(√N) time.</p>
                <p><strong>Impact on AES:</strong> Reduces effective security by half.</p>
                <ul className="security-list">
                  <li>AES-128 → 64-bit security (still strong)</li>
                  <li>AES-256 → 128-bit security (very strong)</li>
                </ul>
              </div>
              <div className="quantum-card">
                <h3>Post-Quantum AES</h3>
                <p>AES-256 is considered quantum-resistant and recommended for long-term security.</p>
                <p><strong>Recommendation:</strong> Use AES-256 for data that must remain secure for decades.</p>
              </div>
            </div>
          </section>

          {/* Conclusion */}
          <section className="security-section">
            <h2 className="security-heading">Conclusion</h2>
            <div className="conclusion-box">
              <p className="security-text">
                AES remains secure when implemented correctly. The biggest vulnerabilities come not from the 
                algorithm itself, but from poor implementation practices, weak key management, and side-channel 
                attacks on physical devices.
              </p>
              <p className="security-text">
                For most applications, AES-128 with a proper mode (like GCM) provides excellent security. 
                For highly sensitive data or long-term protection, AES-256 is recommended.
              </p>
              <div className="security-highlight">
                <strong>Remember:</strong> Security is only as strong as its weakest link. Even the best 
                encryption algorithm cannot protect against poor password choices, social engineering, or 
                compromised systems.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SecurityAnalysis;