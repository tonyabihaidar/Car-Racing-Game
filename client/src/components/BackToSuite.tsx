import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackToSuite() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/home")}
      style={{
        padding: "6px 14px",
        background: "rgba(15, 23, 42, 0.7)",
        border: "1px solid rgba(148,163,184,0.5)",
        borderRadius: "999px",
        color: "#f1f5f9",
        fontSize: "0.8rem",
        cursor: "pointer",
        marginBottom: "12px",
        transition: "0.15s ease",
        alignSelf: "flex-start",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.background = "rgba(30, 41, 59, 0.9)";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.background = "rgba(15, 23, 42, 0.7)";
      }}
    >
      ← Back to AES Suite
    </button>
  );
}