// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import LoginBg from "../assets/LoginPage.svg";

// Native background size of the design
const BASE_W = 1920;
const BASE_H = 1080;

// Design positions (visuals from first version)
const CARD = { left: 561, top: 345, width: 600 };
const INPUT_HEIGHT = 50;
const INPUT_GAP = 30;
const CARD_PADDING = 20;

// Google button design
const GOOGLE = { left: 270, top: 640, width: 1000 };
const GOOGLE_SCALE = 1.2;

// Divider design
const DIVIDER = { left: CARD.left, top: CARD.top + 2 * INPUT_HEIGHT + 3 * INPUT_GAP + 10, width: CARD.width };

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [{ scale, offsetX, offsetY }, setStage] = useState({ scale: 1, offsetX: 0, offsetY: 0 });

  // Compute cover scale and crop offsets
  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sx = vw / BASE_W;
      const sy = vh / BASE_H;
      const s = Math.max(sx, sy); // cover
      const ox = (vw - BASE_W * s) / 2;
      const oy = (vh - BASE_H * s) / 2;
      setStage({ scale: s, offsetX: ox, offsetY: oy });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Proper Google login (second version)
  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse?.credential) {
      sessionStorage.setItem("google_token", credentialResponse.credential);
      navigate("/tutorial", { replace: true });
    } else {
      console.warn("Google login succeeded but no credential present", credentialResponse);
    }
  };
  const handleGoogleError = () => alert("Google login failed. Please try again.");

  // Proper local login (second version)
  const handleLocalLogin = (e) => {
    e.preventDefault();
    const u = String(username).trim();
    const p = String(password).trim();
    if (!u || !p) return alert("Enter username and password.");

    const USERS_KEY = "demo_users_v1";
    const SESSION_KEY = "demo_session_v1";
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");

    if (!users[u]) {
      users[u] = { username: u, password: p, name: u, provider: "local", createdAt: Date.now() };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    if (users[u].password !== p) return alert("Invalid username or password.");

    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: u, name: users[u].name, provider: "local" }));
    navigate("/tutorial", { replace: true });
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${LoginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      {/* Stage overlay */}
      <div
        style={{
          position: "fixed",
          left: offsetX,
          top: offsetY,
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Login card */}
        <div
          style={{
            position: "absolute",
            left: CARD.left,
            top: CARD.top,
            width: CARD.width,
            padding: CARD_PADDING,
            borderRadius: 16,
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            gap: INPUT_GAP,
          }}
        >
          <form
            onSubmit={handleLocalLogin}
            style={{ display: "flex", flexDirection: "column", gap: INPUT_GAP }}
          >
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ height: INPUT_HEIGHT, borderRadius: 8, padding: "0 12px", fontSize: 16 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ height: INPUT_HEIGHT, borderRadius: 8, padding: "0 12px", fontSize: 16 }}
            />
            <button
              type="submit"
              style={{
                height: INPUT_HEIGHT,
                borderRadius: 8,
                border: "none",
                background: "#2E7D6F",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </form>
        </div>

        {/* Divider */}
        <div
          style={{
            position: "absolute",
            left: CARD.left,
            top: GOOGLE.top - 30,
            width: CARD.width,
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 1,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
          <span style={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
        </div>

        {/* Google button */}
        <div
          style={{
            position: "absolute",
            left: GOOGLE.left,
            top: GOOGLE.top,
            width: GOOGLE.width,
            transform: `scale(${GOOGLE_SCALE})`,
            transformOrigin: "top left",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GoogleLogin
            size="large"
            text="signin_with"
            shape="rectangular"
            width={String(GOOGLE.width)}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>
      </div>
    </div>
  );
}
