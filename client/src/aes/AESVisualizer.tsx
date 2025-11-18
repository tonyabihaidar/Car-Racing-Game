import React, { useState } from "react";
import {
  aesEncrypt,
  hexToBytes,
  bytesToHex,
  type AESEncryptionResult,
  type AESState,
} from "./aesEngine";

type KeySize = 128 | 192 | 256;

const defaultPlaintext = "3243f6a8885a308d313198a2e0370734";
const defaultKey128 = "2b7e151628aed2a6abf7158809cf4f3c";

const AESVisualizer: React.FC = () => {
  const [keySize, setKeySize] = useState<KeySize>(128);
  const [keyHex, setKeyHex] = useState(defaultKey128);
  const [msgHex, setMsgHex] = useState(defaultPlaintext);
  const [result, setResult] = useState<AESEncryptionResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const expectedKeyBytes = keySize / 8;
  const expectedKeyHexLen = expectedKeyBytes * 2;
  const roundCount = keySize === 128 ? 10 : keySize === 192 ? 12 : 14;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
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

    const random = generateRandomHex(value / 8);
    setKeyHex(random);
    setResult(null);
    setCurrentStepIndex(0);
    setError(null);
  };

  const randomizeKey = () => {
    setKeyHex(generateRandomHex(expectedKeyBytes));
  };

  const randomizeMsg = () => {
    // AES block is always 16 bytes
    setMsgHex(generateRandomHex(16));
  };

  const handleEncrypt = () => {
    try {
      setError(null);

      const keyBytes = hexToBytes(keyHex);
      const msgBytes = hexToBytes(msgHex);

      if (keyBytes.length !== expectedKeyBytes) {
        throw new Error(
          `Key must be ${expectedKeyBytes} bytes (${expectedKeyHexLen} hex characters)`
        );
      }
      if (msgBytes.length !== 16) {
        throw new Error("Message must be 16 bytes (32 hex characters)");
      }

      const res = aesEncrypt(msgBytes, keyBytes);
      setResult(res);
      setCurrentStepIndex(0);
      showToast("Encryption completed");
    } catch (err: any) {
      setError(err.message ?? "Encryption failed");
      setResult(null);
    }
  };

  const hasSteps = !!result && result.steps.length > 0;
  const currentStep = hasSteps ? result!.steps[currentStepIndex] : null;
  const totalSteps = result?.steps.length ?? 0;
  const ciphertextHex = result
    ? bytesToHex(result.ciphertext).toUpperCase()
    : "";

  const goPrev = () => {
    if (!hasSteps) return;
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  };

  const goNext = () => {
    if (!hasSteps) return;
    setCurrentStepIndex((i) =>
      Math.min((result?.steps.length ?? 1) - 1, i + 1)
    );
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

  return (
    <div className="aes-root">
      <header className="aes-header">
        <div className="aes-title-icon">🔐</div>
        <div>
          <h1 className="aes-title">AES Encryption Visualizer</h1>
          <p className="aes-subtitle">
            Step-by-step visualization of AES-{keySize} rounds, state matrices,
            and round keys.
          </p>
        </div>
      </header>

      {toast && <div className="aes-toast">{toast}</div>}

      <main className="aes-layout">
        {/* LEFT: configuration & inputs */}
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
              <div className="aes-stat-label">Block Size</div>
              <div className="aes-stat-value">128-bit</div>
            </div>
          </div>

          <div className="aes-form-grid">
            <div className="aes-form-group">
              <label className="aes-label">
                Key Size
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
                Plaintext (hex, 32 characters)
                <div className="aes-input-row">
                  <input
                    type="text"
                    value={msgHex}
                    onChange={(e) => setMsgHex(e.target.value)}
                    className="aes-input"
                    placeholder="e.g. 3243f6a8..."
                  />
                  <button
                    type="button"
                    onClick={randomizeMsg}
                    className="aes-button aes-button--ghost"
                  >
                    Random
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(msgHex, "Plaintext")}
                    className="aes-button aes-button--ghost"
                  >
                    Copy
                  </button>
                </div>
              </label>
            </div>
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
                  onClick={randomizeKey}
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

          {error && <div className="aes-error">{error}</div>}

          <button
            className="aes-button aes-button--primary"
            type="button"
            onClick={handleEncrypt}
          >
            Encrypt & Visualize
          </button>

          <p className="aes-footnote">
            Inputs must be valid hexadecimal. AES always operates on a single
            128-bit block (16 bytes).
          </p>
        </section>

        {/* RIGHT: result & round visualizer */}
        <section className="aes-panel aes-panel--right">
          <div className="aes-steps-header">
            <div>
              <h2 className="aes-panel-title">Result & Round Explorer</h2>
              {result ? (
                <p className="aes-steps-subtitle">
                  {hasSteps
                    ? `Step ${currentStepIndex + 1} of ${totalSteps} — Round ${
                        currentStep?.round
                      }: ${currentStep?.step}`
                    : "Run an encryption to inspect each round."}
                </p>
              ) : (
                <p className="aes-steps-subtitle">
                  Encrypt a block to see each AES transformation visualized.
                </p>
              )}
            </div>

            {hasSteps && (
              <div className="aes-steps-nav">
                <button
                  onClick={goPrev}
                  disabled={currentStepIndex === 0}
                  className="aes-button aes-button--ghost"
                >
                  ◀ Prev
                </button>
                <button
                  onClick={goNext}
                  disabled={currentStepIndex === totalSteps - 1}
                  className="aes-button aes-button--ghost"
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>

          <div className="aes-cipher-section">
            <div className="aes-cipher-header">
              <span className="aes-result-label">Ciphertext (hex)</span>
              <div className="aes-cipher-actions">
                <button
                  type="button"
                  disabled={!ciphertextHex}
                  onClick={() => handleCopy(ciphertextHex, "Ciphertext")}
                  className="aes-button aes-button--ghost"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="aes-cipher-value">
              {ciphertextHex || "No ciphertext yet — run encryption first."}
            </div>
          </div>

          {hasSteps && currentStep && (
            <div className="aes-grids">
              <div className="aes-grid-card">
                <div className="aes-grid-header">
                  <h3 className="aes-grid-title">State Matrix</h3>
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
                  <h3 className="aes-grid-title">Round Key</h3>
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
          )}
        </section>
      </main>
    </div>
  );
};

export default AESVisualizer;
