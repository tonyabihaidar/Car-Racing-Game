import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../components/UserDropdown";
import { useTheme } from "../contexts/ThemeContext";
// ---- value imports ----
import {
  encryptTextMultiBlock,
  hexToBytes,
  bytesToHex,
  bytesToBinary,
  bytesToDecimal,
} from "../aes/aesEngine";


// ---- type imports ----
import type {
  AesBlockMode,
  MultiBlockEncryptionResult,
  AESEncryptionResult,
  AESState,
} from "../aes/aesEngine";

import "../aes/aes.css";

type KeySize = 128 | 192 | 256;
type OutputFormat = "hex" | "binary" | "decimal";

const defaultKey128 = "2b7e151628aed2a6abf7158809cf4f3c";

const AESFullText: React.FC = () => {
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
  const [keyHex, setKeyHex] = useState(defaultKey128);
  const [mode, setMode] = useState<AesBlockMode>("ECB");
  const [ctrCounterHex, setCtrCounterHex] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("hex");

  /* -------------------- plaintext & result -------------------- */
  const [fullPlaintext, setFullPlaintext] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [multiError, setMultiError] = useState<string | null>(null);
  const [multiResult, setMultiResult] =
    useState<MultiBlockEncryptionResult | null>(null);

  /* -------------------- visualization state -------------------- */
  const [visualResult, setVisualResult] = useState<AESEncryptionResult | null>(
    null
  );
  const [visualLabel, setVisualLabel] = useState<string>(
    "No block visualized yet."
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);

  /* -------------------- derived values -------------------- */
  const expectedKeyBytes = keySize / 8;
  const expectedKeyHexLen = expectedKeyBytes * 2;
  const roundCount = keySize === 128 ? 10 : keySize === 192 ? 12 : 14;

  const hasVisualSteps = !!visualResult && visualResult.steps.length > 0;
  const currentStep = hasVisualSteps
    ? visualResult!.steps[currentStepIndex]
    : null;
  const totalSteps = visualResult?.steps.length ?? 0;

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
    setMultiError(null);
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
    if (!visualResult || !multiResult) return;

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(`AES Full Text Encryption - ${multiResult.mode} Mode`, pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Algorithm: AES-${keySize}`, 20, yPos);
      yPos += 6;
      doc.text(`Mode: ${multiResult.mode}`, 20, yPos);
      yPos += 6;
      doc.text(`Total Blocks: ${multiResult.blockResults.length}`, 20, yPos);
      yPos += 6;
      if (uploadedFileName) {
        doc.text(`Source File: ${uploadedFileName}`, 20, yPos);
        yPos += 6;
      }
      doc.text(`Currently viewing: Block ${selectedBlockIndex + 1}`, 20, yPos);
      yPos += 12;

      visualResult.steps.forEach((step) => {
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

      doc.save(`AES-${keySize}_${multiResult.mode}_encryption_block-${selectedBlockIndex + 1}.pdf`);
      showToast("PDF exported successfully");
    } catch (err) {
      console.error("PDF export failed:", err);
      showToast("PDF export failed");
    }
  };

  /* -------------------- FILE UPLOAD -------------------- */

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setMultiError("File is too large. Maximum size is 10MB.");
      return;
    }

    try {
      const text = await file.text();
      setFullPlaintext(text);
      setUploadedFileName(file.name);
      setMultiError(null);
      showToast(`File "${file.name}" loaded successfully`);
    } catch (err) {
      setMultiError("Failed to read file. Please try again.");
      console.error("File upload error:", err);
    }

    e.target.value = "";
  };

  const handleClearFile = () => {
    setFullPlaintext("");
    setUploadedFileName(null);
    setMultiResult(null);
    setVisualResult(null);
    showToast("Plaintext cleared");
  };

  const downloadEncryptedFile = () => {
    if (!multiResult) return;

    try {
      const ciphertext = multiResult.ciphertextHex;
      const blob = new Blob([ciphertext], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `encrypted_${uploadedFileName || "text"}_${mode}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Encrypted file downloaded");
    } catch (err) {
      console.error("Download failed:", err);
      showToast("Download failed");
    }
  };

  /* -------------------- full TEXT encryption -------------------- */

  const handleEncryptFullText = () => {
    try {
      setMultiError(null);

      if (!fullPlaintext.trim()) {
        throw new Error("Plaintext is empty.");
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

      if (mode === "CTR" && ctrCounterHex && !hexOnlyRegex.test(ctrCounterHex)) {
        throw new Error("CTR counter must be hexadecimal (0–9, A–F) only.");
      }

      const result = encryptTextMultiBlock(
        fullPlaintext,
        keyHex,
        mode,
        mode === "CTR" ? (ctrCounterHex || undefined) : undefined
      );

      setMultiResult(result);
      setSelectedBlockIndex(0);

      const firstBlock = result.blockResults[0];
      setVisualResult(firstBlock.aesResult);
      setVisualLabel(
        `${result.mode} mode — block 1 of ${result.blockResults.length}`
      );
      setCurrentStepIndex(0);
      showToast("Text encrypted.");
    } catch (err: any) {
      setMultiError(err.message ?? "Full-text encryption failed.");
      setMultiResult(null);
      setVisualResult(null);
    }
  };

  const handleChangeSelectedBlock = (indexStr: string) => {
    if (!multiResult) return;
    const idx = parseInt(indexStr, 10);
    if (Number.isNaN(idx)) return;
    if (idx < 0 || idx >= multiResult.blockResults.length) return;

    setSelectedBlockIndex(idx);
    const blk = multiResult.blockResults[idx];
    setVisualResult(blk.aesResult);
    setVisualLabel(
      `${multiResult.mode} mode — block ${idx + 1} of ${
        multiResult.blockResults.length
      }`
    );
    setCurrentStepIndex(0);
  };

  /* -------------------- step navigation -------------------- */

  const goPrevStep = () => {
    if (!hasVisualSteps) return;
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  };

  const goNextStep = () => {
    if (!hasVisualSteps) return;
    setCurrentStepIndex((i) =>
      Math.min((visualResult?.steps.length ?? 1) - 1, i + 1)
    );
  };

  const handleStepClick = (index: number) => {
    if (!visualResult) return;
    if (index < 0 || index >= visualResult.steps.length) return;
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
          <div className="aes-title-icon">📝</div>
          <div>
            <h1 className="aes-title">Full Text AES Encryption</h1>
            <p className="aes-subtitle">
              Encrypt any text using AES-128/192/256 in 5 modes,
              with block-level visualization.
            </p>
          </div>
        </div>
      </header>

      {toast && <div className="aes-toast">{toast}</div>}

      <main className="aes-layout">
        {/* LEFT PANEL */}
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

          <div className="aes-section">
            <h3 className="aes-section-title">
              Full TEXT encryption (5 modes)
            </h3>

            <div className="aes-form-grid">
              <div className="aes-form-group">
                <label className="aes-label">
                  Mode
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as AesBlockMode)}
                    className="aes-select"
                  >
                    <option value="ECB">AES-ECB</option>
                    <option value="CBC">AES-CBC</option>
                    <option value="CFB">AES-CFB</option>
                    <option value="OFB">AES-OFB</option>
                    <option value="CTR">AES-CTR (counter)</option>
                  </select>
                </label>
                <p className="aes-help">
                  IV is fixed to zero for CBC/CFB/OFB/CTR as required.
                </p>
              </div>

              {mode === "CTR" && (
                <div className="aes-form-group">
                  <label className="aes-label">
                    Initial counter (hex, optional)
                    <input
                      className="aes-input"
                      type="text"
                      value={ctrCounterHex}
                      onChange={(e) => setCtrCounterHex(e.target.value)}
                      placeholder="If empty, counter = all zeroes"
                    />
                  </label>
                  <p className="aes-help">
                    If longer than 16 bytes, last 16 bytes are used.
                  </p>
                </div>
              )}
            </div>

            <div className="aes-form-group">
              <label className="aes-label">
                Upload file (optional)
                <div className="aes-input-row">
                  <input
                    type="file"
                    accept=".txt,.text"
                    onChange={handleFileUpload}
                    className="aes-file-input"
                    id="file-upload"
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="aes-button aes-button--ghost"
                    style={{ cursor: "pointer", flex: 1, textAlign: "center" }}
                  >
                    📁 Choose File
                  </label>
                  {uploadedFileName && (
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="aes-button aes-button--ghost"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </label>
              {uploadedFileName && (
                <p className="aes-help" style={{ color: "#34d399" }}>
                  ✓ Loaded: {uploadedFileName}
                </p>
              )}
            </div>

            <div className="aes-form-group">
              <label className="aes-label">
                Plaintext (any length)
                <textarea
                  className="aes-textarea"
                  rows={4}
                  value={fullPlaintext}
                  onChange={(e) => setFullPlaintext(e.target.value)}
                  placeholder="Type or paste your text here, or upload a file..."
                />
              </label>
              <p className="aes-help">
                Characters: {fullPlaintext.length} | 
                Estimated blocks: {Math.ceil(fullPlaintext.length / 16) || 0}
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

            {multiError && <div className="aes-error">{multiError}</div>}

            <button
              className="aes-button aes-button--primary"
              type="button"
              onClick={handleEncryptFullText}
            >
              Encrypt text
            </button>

            {multiResult && (
              <div className="aes-full-summary">
                <p>
                  Encrypted{" "}
                  <strong>{multiResult.blockResults.length}</strong> block
                  {multiResult.blockResults.length > 1 ? "s" : ""} (16 bytes
                  each) in <strong>{multiResult.mode}</strong> mode.
                </p>
                <p>{multiResult.paddingDescription}</p>
                <button
                  type="button"
                  onClick={downloadEncryptedFile}
                  className="aes-button aes-button--ghost"
                  style={{ marginTop: "8px" }}
                >
                  💾 Download Encrypted File
                </button>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="aes-panel aes-panel--right">
          <div className="aes-steps-header">
            <div>
              <h2 className="aes-panel-title">Result &amp; Round Explorer</h2>
              {hasVisualSteps && currentStep ? (
                <p className="aes-steps-subtitle">
                  {visualLabel} — round <strong>{currentStep.round}</strong>,
                  step {currentStepIndex + 1} of {totalSteps}:{" "}
                  <span className="aes-steps-stepname">
                    {currentStep.step}
                  </span>
                </p>
              ) : (
                <p className="aes-steps-subtitle">
                  Encrypt text to visualize a block.
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

          {hasVisualSteps && visualResult && (
            <div className="aes-timeline">
              {visualResult.steps.map((s, idx) => (
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
                  disabled={!visualResult}
                  onClick={exportToPDF}
                  className="aes-button aes-button--ghost"
                >
                  Export PDF
                </button>
                <button
                  type="button"
                  disabled={!visualResult}
                  onClick={() =>
                    visualResult &&
                    handleCopy(
                      formatOutput(visualResult.ciphertext),
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
              {visualResult
                ? formatOutput(visualResult.ciphertext)
                : "No ciphertext yet — run encryption first."}
            </div>
          </div>

          {multiResult && multiResult.blockResults.length > 1 && (
            <div className="aes-block-selector">
              <label className="aes-label">
                Block to visualize
                <select
                  className="aes-select"
                  value={selectedBlockIndex}
                  onChange={(e) => handleChangeSelectedBlock(e.target.value)}
                >
                  {multiResult.blockResults.map((blk) => (
                    <option key={blk.blockIndex} value={blk.blockIndex}>
                      Block {blk.blockIndex + 1} — plaintext hex{" "}
                      {blk.plaintextBlockHex.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

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

export default AESFullText;