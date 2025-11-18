import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../components/UserDropdown";
import axios from "axios";
import "../aes/aes.css";
import { useTheme } from "../contexts/ThemeContext";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface EncryptionRecord {
  id: string;
  algorithm: string;
  mode: string | null;
  plaintext: string;
  ciphertext: string;
  keyUsed: string;
  blockCount: number;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [history, setHistory] = useState<EncryptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory(response.data);
    } catch (err: any) {
      console.error("Failed to fetch history:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
      } else {
        setError("Failed to load encryption history");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_URL}/api/history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory(history.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete item");
    }
  };

  const deleteAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL encryption history? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_URL}/api/history/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory([]);
    } catch (err: any) {
      console.error("Failed to delete all:", err);
      alert("Failed to delete history");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const truncate = (str: string, length: number) => {
    if (str.length <= length) return str;
    return str.substring(0, length) + "...";
  };

  return (
    <div className={`aes-root ${theme === "dark" ? "aes-root--dark" : "aes-root--light"}`}>
      <UserDropdown />

      <div className="aes-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
        <button
          onClick={() => navigate("/home")}
          className="back-button"
        >
          ← Back to AES Suite
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", width: "100%" }}>
          <div className="aes-title-icon">📊</div>
          <div>
            <h1 className="aes-title">Dashboard</h1>
            <p className="aes-subtitle">
              Review your AES encryption history and saved sessions.
            </p>
          </div>
        </div>
      </div>

      <main className="aes-panel" style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 className="aes-panel-title">Encryption History</h2>
          {history.length > 0 && (
            <button onClick={deleteAll} className="aes-button aes-button--ghost" style={{ background: "rgba(239, 68, 68, 0.12)", borderColor: "rgba(248, 113, 113, 0.6)" }}>
              Delete All
            </button>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            Loading...
          </div>
        )}

        {error && (
          <div className="aes-error" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>No encryption history yet.</p>
            <p style={{ fontSize: "0.9rem" }}>
              Start encrypting data to populate your history.
            </p>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {history.map((record) => (
              <div
                key={record.id}
                className="aes-grid-card"
                style={{ padding: "16px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>
                      {record.algorithm}
                      {record.mode && ` - ${record.mode}`}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {formatDate(record.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(record.id)}
                    className="aes-button aes-button--ghost"
                    style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                  >
                    Delete
                  </button>
                </div>

                <div style={{ display: "grid", gap: "8px", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Plaintext: </span>
                    <span style={{ fontFamily: "monospace", color: "var(--text-main)" }}>
                      {truncate(record.plaintext, 100)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Ciphertext: </span>
                    <span style={{ fontFamily: "monospace", color: "var(--text-main)" }}>
                      {truncate(record.ciphertext, 100)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Key: </span>
                    <span style={{ fontFamily: "monospace", color: "var(--text-main)" }}>{record.keyUsed}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Blocks: </span>
                    <span style={{ color: "var(--text-main)" }}>{record.blockCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}