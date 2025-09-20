import React from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "#a0c4ff",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Welcome! Login</h1>
      <button
        style={{
          padding: "0.8rem 2rem",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#ff6b6b",
          color: "white",
          cursor: "pointer",
        }}
        onClick={() => navigate("/front")}
      >
        Go to Front Page
      </button>
    </div>
  );
}

export default LoginPage;
