import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../components/UserDropdown";
import { useTheme } from "../contexts/ThemeContext";

// ---- value imports ----
import {
  aesEncrypt,
  hexToBytes,
  bytesToHex,
  bytesToBinary,
  bytesToDecimal,
} from "../aes/aesEngine";

// ---- type imports ----
import type {
  AESEncryptionResult,
  AESState,
} from "../aes/aesEngine";

import "../aes/aes.css";

type KeySize = 128 | 192 | 256;
type OutputFormat = "hex" | "binary" | "decimal";

const AESVisualizer: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  /* -------------------- toast -------------------- */
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  /* -------------------- key / config -------------------- */
  const [keySize, setKeySize] = useState<KeySize>(128);
  const [keyHex, setKeyHex] = useState("2b7e151628aed2a6abf7158809cf4f3c");
  const [plaintext, setPlaintext] = useState("00112233445566778899aabbccddeeff");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("hex");

  /* -------------------- result -------------------- */
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AESEncryptionResult | null>(null);

  /* -------------------- visualization state -------------------- */
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  /* -------------------- derived values -------------------- */
  const expectedKeyBytes = keySize / 8;
  const expectedKeyHexLen = expectedKeyBytes * 2;
  const roundCount = keySize === 128 ? 10 : keySize === 192 ? 12 : 14;

  const hasVisualSteps = !!result && result.steps.length > 0;
  const currentStep = hasVisualSteps
    ? result!.steps[currentStepIndex]
    : null;
  const totalSteps = result?.steps.length ?? 0;

  const hexOnlyRegex = useMemo(() => /^[0-9a-fA-F\s]*$/, []);

  /* -------------------- helpers -------------------- */

  const generateRandomHex = (bytes: number) => {
    const arr: number[] = [];
    for (let i = 0; i < bytes; i++) {
      arr.push(Math.floor(Math.random() * 256));
    }
    return bytesToHex(arr);
  };

  const handleKeySizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value) as KeySize;
    setKeySize(value);
    setKeyHex(generateRandomHex(value / 8));
    setError(null);
  };

  const formatOutput = (bytes: number[]): string => {
    switch (outputFormat) {
      case "binary":
        return bytesToBinary(bytes);
      case "decimal":
        return bytesToDecimal(bytes);
      case "hex":
      default:
        return bytesToHex(bytes).toUpperCase();
    }
  };

  const matrixToHexString = (matrix: AESState | null): string => {
    if (!matrix) return "";
    const rows: string[] = [];
    for (let row = 0; row < 4; row++) {
      const rowVals: string[] = [];
      for (let col = 0; col < 4; col++) {
        rowVals.push(matrix[col][row].toString(16).padStart(2, "0"));
      }
      rows.push(rowVals.join(" "));
    }
    return rows.join("\n");
  };

  const handleCopy = async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} copied to clipboard`);
    } catch {
      showToast(`Could not copy ${label}`);
    }
  };

  const renderMatrix = (
    matrix: AESState | null,
    variant: "state" | "key"
  ) => {
    if (!matrix) return null;
    return (
      <div className="aes-matrix">
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 4 }).map((__, col) => {
            const value = matrix[col][row]
              .toString(16)
              .padStart(2, "0")
              .toUpperCase();
            return (
              <div
                key={`${row}-${col}`}
                className={`aes-cell ${
                  variant === "state" ? "aes-cell--state" : "aes-cell--key"
                }`}
              >
                {value}
              </div>
            );
          })
        )}
      </div>
    );
  };

  const exportToPDF = async () => {
    if (!result) return;

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("AES Single-Block Encryption - Round Keys & States", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Algorithm: AES-${keySize}`, 20, yPos);
      yPos += 6;
      doc.text(`Rounds: ${roundCount}`, 20, yPos);
      yPos += 6;
      doc.text(`Ciphertext: ${formatOutput(result.ciphertext)}`, 20, yPos);
      yPos += 12;

      result.steps.forEach((step) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Round ${step.round} - ${step.step}`, 20, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        if (step.state) {
          doc.setFont("helvetica", "bold");
          doc.text("State Matrix:", 20, yPos);
          doc.setFont("helvetica", "normal");
          yPos += 5;

          for (let row = 0; row < 4; row++) {
            let rowText = "";
            for (let col = 0; col < 4; col++) {
              rowText += step.state[col][row].toString(16).padStart(2, "0").toUpperCase() + "  ";
            }
            doc.text(rowText, 25, yPos);
            yPos += 5;
          }
          yPos += 3;
        }

        if (step.roundKey) {
          doc.setFont("helvetica", "bold");
          doc.text("Round Key:", 20, yPos);
          doc.setFont("helvetica", "normal");
          yPos += 5;

          for (let row = 0; row < 4; row++) {
            let rowText = "";
            for (let col = 0; col < 4; col++) {
              rowText += step.roundKey[col][row].toString(16).padStart(2, "0").toUpperCase() + "  ";
            }
            doc.text(rowText, 25, yPos);
            yPos += 5;
          }
          yPos += 8;
        }
      });

      doc.save(`AES-${keySize}_single-block-encryption_rounds.pdf`);
      showToast("PDF exported successfully");
    } catch (err) {
      console.error("PDF export failed:", err);
      showToast("PDF export failed");
    }
  };

  /* -------------------- encryption -------------------- */

  const handleEncrypt = () => {
    try {
      setError(null);

      if (!hexOnlyRegex.test(plaintext.replace(/\s+/g, "")) || plaintext.replace(/\s+/g, "").length !== 32) {
        throw new Error("Plaintext must be exactly 32 hex characters.");
      }

      if (!hexOnlyRegex.test(keyHex)) {
        throw new Error("Key must be hexadecimal (0–9, A–F) only.");
      }

      const keyBytes = hexToBytes(keyHex.replace(/\s+/g, ""));
      if (keyBytes.length !== expectedKeyBytes) {
        throw new Error(
          `Key must be ${expectedKeyBytes} bytes (${expectedKeyHexLen} hex characters) for AES-${keySize}.`
        );
      }

      const ptBytes = hexToBytes(plaintext.replace(/\s+/g, ""));
      
      const encryptResult = aesEncrypt(ptBytes, keyBytes);

      setResult(encryptResult);
      setCurrentStepIndex(0);
      showToast("Block encrypted.");
    } catch (err: any) {
      setError(err.message ?? "Encryption failed.");
      setResult(null);
    }
  };

  /* -------------------- step navigation -------------------- */

  const goPrevStep = () => {
    if (!hasVisualSteps) return;
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  };

  const goNextStep = () => {
    if (!hasVisualSteps) return;
    setCurrentStepIndex((i) =>
      Math.min((result?.steps.length ?? 1) - 1, i + 1)
    );
  };

  const handleStepClick = (index: number) => {
    if (!result) return;
    if (index < 0 || index >= result.steps.length) return;
    setCurrentStepIndex(index);
  };

  /* -------------------- render -------------------- */

  return (
    <div className={`aes-root ${theme === "dark" ? "aes-root--dark" : "aes-root--light"}`}>
      <UserDropdown />
      
      <header className="aes-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
        <button
          onClick={() => navigate("/home")}
          className="back-button"
        >
          ← Back to AES Suite
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", width: "100%" }}>
          <div className="aes-title-icon">🔐</div>
          <div>
            <h1 className="aes-title">Single-Block AES Encryption</h1>
            <p className="aes-subtitle">
              Encrypt a single 16-byte block with step-by-step round visualization.
            </p>
          </div>
        </div>
      </header>

      {toast && <div className="aes-toast">{toast}</div>}

      <main className="aes-layout">
        {/* LEFT PANEL ------------------------------------------------ */}
        <section className="aes-panel aes-panel--left">
          <h2 className="aes-panel-title">Configuration</h2>

          <div className="aes-stats">
            <div className="aes-stat-card">
              <div className="aes-stat-label">Algorithm</div>
              <div className="aes-stat-value">AES-{keySize}</div>
            </div>
            <div className="aes-stat-card">
              <div className="aes-stat-label">Rounds</div>
              <div className="aes-stat-value">{roundCount}</div>
            </div>
            <div className="aes-stat-card">
              <div className="aes-stat-label">Block size</div>
              <div className="aes-stat-value">128-bit</div>
            </div>
          </div>

          <div className="aes-form-group">
            <label className="aes-label">
              Key size
              <select
                value={keySize}
                onChange={handleKeySizeChange}
                className="aes-select"
              >
                <option value={128}>AES-128 (16 bytes)</option>
                <option value={192}>AES-192 (24 bytes)</option>
                <option value={256}>AES-256 (32 bytes)</option>
              </select>
            </label>
            <p className="aes-help">
              Expected key length: {expectedKeyHexLen} hex characters.
            </p>
          </div>

          <div className="aes-form-group">
            <label className="aes-label">
              Key (hex, {expectedKeyHexLen} characters)
              <div className="aes-input-row">
                <input
                  type="text"
                  value={keyHex}
                  onChange={(e) => setKeyHex(e.target.value)}
                  className="aes-input"
                  placeholder={`Enter ${expectedKeyHexLen} hex characters`}
                />
                <button
                  type="button"
                  onClick={() => setKeyHex(generateRandomHex(expectedKeyBytes))}
                  className="aes-button aes-button--ghost"
                >
                  Random
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(keyHex, "Key")}
                  className="aes-button aes-button--ghost"
                >
                  Copy
                </button>
              </div>
            </label>
          </div>

          <div className="aes-form-group">
            <label className="aes-label">
              Plaintext (hex, 32 characters)
              <textarea
                className="aes-textarea"
                rows={3}
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                placeholder="Enter 32 hex characters to encrypt..."
              />
            </label>
            <p className="aes-help">
              The data you want to encrypt (16 bytes = 32 hex characters).
            </p>
          </div>

          <div className="aes-form-group">
            <label className="aes-label">
              Output format
              <select
                className="aes-select"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              >
                <option value="hex">Hexadecimal</option>
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
              </select>
            </label>
          </div>

          {error && <div className="aes-error">{error}</div>}

          <button
            className="aes-button aes-button--primary"
            type="button"
            onClick={handleEncrypt}
          >
            Encrypt block
          </button>
        </section>

        {/* RIGHT PANEL ------------------------------------------------ */}
        <section className="aes-panel aes-panel--right">
          <div className="aes-steps-header">
            <div>
              <h2 className="aes-panel-title">Result &amp; Round Explorer</h2>
              {hasVisualSteps && currentStep ? (
                <p className="aes-steps-subtitle">
                  Round <strong>{currentStep.round}</strong>, step{" "}
                  {currentStepIndex + 1} of {totalSteps}:{" "}
                  <span className="aes-steps-stepname">
                    {currentStep.step}
                  </span>
                </p>
              ) : (
                <p className="aes-steps-subtitle">
                  Encrypt a block to visualize the process.
                </p>
              )}
            </div>

            {hasVisualSteps && (
              <div className="aes-steps-nav">
                <button
                  onClick={goPrevStep}
                  disabled={currentStepIndex === 0}
                  className="aes-button aes-button--ghost"
                >
                  ◀ Prev
                </button>
                <button
                  onClick={goNextStep}
                  disabled={currentStepIndex === totalSteps - 1}
                  className="aes-button aes-button--ghost"
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>

          {hasVisualSteps && result && (
            <div className="aes-timeline">
              {result.steps.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStepClick(idx)}
                  className={
                    "aes-timeline-step" +
                    (idx === currentStepIndex
                      ? " aes-timeline-step--active"
                      : "")
                  }
                >
                  <span className="aes-timeline-round">R{s.round}</span>
                  <span className="aes-timeline-label">{s.step}</span>
                </button>
              ))}
            </div>
          )}

          <div className="aes-cipher-section">
            <div className="aes-cipher-header">
              <span className="aes-result-label">Ciphertext ({outputFormat})</span>
              <div className="aes-cipher-actions">
                <button
                  type="button"
                  disabled={!result}
                  onClick={exportToPDF}
                  className="aes-button aes-button--ghost"
                >
                  Export PDF
                </button>
                <button
                  type="button"
                  disabled={!result}
                  onClick={() =>
                    result &&
                    handleCopy(
                      formatOutput(result.ciphertext),
                      "Ciphertext"
                    )
                  }
                  className="aes-button aes-button--ghost"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="aes-cipher-value" style={{ wordBreak: "break-all" }}>
              {result
                ? formatOutput(result.ciphertext)
                : "No ciphertext yet — run encryption first."}
            </div>
          </div>

          {hasVisualSteps && currentStep && (
            <>
              <div className="aes-grids">
                <div className="aes-grid-card">
                  <div className="aes-grid-header">
                    <h3 className="aes-grid-title">State matrix</h3>
                    <button
                      type="button"
                      className="aes-button aes-button--ghost"
                      onClick={() =>
                        handleCopy(
                          matrixToHexString(currentStep.state),
                          "State matrix"
                        )
                      }
                    >
                      Copy matrix
                    </button>
                  </div>
                  {renderMatrix(currentStep.state ?? null, "state")}
                </div>

                <div className="aes-grid-card">
                  <div className="aes-grid-header">
                    <h3 className="aes-grid-title">Round key</h3>
                    <button
                      type="button"
                      className="aes-button aes-button--ghost"
                      onClick={() =>
                        handleCopy(
                          matrixToHexString(currentStep.roundKey),
                          "Round key matrix"
                        )
                      }
                    >
                      Copy matrix
                    </button>
                  </div>
                  {renderMatrix(currentStep.roundKey ?? null, "key")}
                </div>
              </div>

              <div className="aes-legend">
                <div className="aes-legend-item aes-legend-item--state">
                  <span className="aes-legend-dot aes-legend-dot--state" />
                  <div>
                    <div className="aes-legend-title">State matrix</div>
                    <div className="aes-legend-text">
                      4×4 bytes representing the internal AES state during encryption.
                    </div>
                  </div>
                </div>
                <div className="aes-legend-item aes-legend-item--key">
                  <span className="aes-legend-dot aes-legend-dot--key" />
                  <div>
                    <div className="aes-legend-title">Round key</div>
                    <div className="aes-legend-text">
                      4×4 bytes from the expanded key used in this round.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default AESVisualizer;