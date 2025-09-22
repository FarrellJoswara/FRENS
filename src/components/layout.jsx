// src/components/Layout.jsx
import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import HomeIcon from "../assets/home-button.png"; // adjust path
import BackIcon from "../assets/back-button.png"; // adjust path

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Floating buttons overlay */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          display: "flex",
          gap: "10px",
          zIndex: 1000,
          pointerEvents: "auto", // ensures buttons are clickable
        }}
      >
        {/* Back Button */}
        <img
          src={BackIcon}
          alt="Back"
          onClick={() => navigate(-1)}
          style={{
            width: "40px",
            height: "40px",
            cursor: "pointer",
            userSelect: "none",
            pointerEvents: "auto",
          }}
        />

        {/* Home Button (forces full reload) */}
        <img
          src={HomeIcon}
          alt="Home"
          onClick={() => window.location.href = "/front"} // full page reload
          style={{
            width: "40px",
            height: "40px",
            cursor: "pointer",
            userSelect: "none",
            pointerEvents: "auto",
          }}
        />
      </div>

      {/* Page content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
