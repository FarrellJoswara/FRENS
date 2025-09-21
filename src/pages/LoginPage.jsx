// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import LoginBg from "../assets/LoginPage.svg"; // background image

// --- SVG design canvas size (native size of the artwork) ---
const BASE_W = 1440;
const BASE_H = 900;

// --- Login card placement on the SVG (design pixels) ---
const PANEL_LEFT = 378;      // left edge of the frosted card
const PANEL_TOP = 260;       // top of the frosted card
const PANEL_WIDTH = 500;     // width of the card
const PANEL_PAD = 20;

// --- Form sizing inside the card (design pixels) ---
const FIELD_H = 48;
const GAP = 12;

// --- "or" divider anchored by width/left/top (optional tweak) ---
const OR_LEFT = PANEL_LEFT + (PANEL_WIDTH - 380) / 2;
const OR_TOP  = PANEL_TOP + 480;      // adjust if needed
const OR_WIDTH = 380;

// --- GOOGLE BUTTON: lock ALL FOUR CORNERS (design pixels) ---
const G_LEFT   = 463;   // exact x of the button's LEFT edge
const G_TOP    = 600;   // exact y of the button's TOP edge
const G_WIDTH  = 380;   // exact WIDTH
const G_HEIGHT = 44;    // exact HEIGHT (visual height of the GIS button)

// ----------------------------------------------------------------

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Same COVER scale + crop offsets as the background
  const [{ scale, offsetX, offsetY }, setStage] = useState({ scale: 1, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const sx = vw / BASE_W, sy = vh / BASE_H;
      const s = Math.max(sx, sy);             // cover
      const ox = (vw - BASE_W * s) / 2;       // crop offset X
      const oy = (vh - BASE_H * s) / 2;       // crop offset Y
      setStage({ scale: s, offsetX: ox, offsetY: oy });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Google flow
  const handleSuccess = (credentialResponse) => {
    if (credentialResponse?.credential) {
      sessionStorage.setItem("google_token", credentialResponse.credential);
      navigate("/front", { replace: true });
    } else {
      console.warn("Google login succeeded but no credential present", credentialResponse);
    }
  };
  const handleError = () => alert("Google login failed. Please try again.");

  // Tiny local auth (demo only)
  const onSubmit = (e) => {
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
    navigate("/front", { replace: true });
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${LoginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
      {/* Stage aligned to the background's scaled & cropped image */}
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
        {/* Login card (absolute in design pixels) */}
        <div
          style={{
            position: "absolute",
            left: PANEL_LEFT,
            top: PANEL_TOP,
            width: PANEL_WIDTH,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
            padding: PANEL_PAD,
          }}
        >
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
            <label style={{ fontWeight: 700, fontSize: 18, color: "#25323B" }}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. obama"
              autoComplete="username"
              style={{
                height: FIELD_H,
                borderRadius: 12,
                border: "1px solid #D9DEE3",
                padding: "0 12px",
                fontSize: 16,
                outline: "none",
                background: "rgba(255,255,255,0.95)",
              }}
            />

            <label style={{ fontWeight: 700, fontSize: 18, color: "#25323B" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
              style={{
                height: FIELD_H,
                borderRadius: 12,
                border: "1px solid #D9DEE3",
                padding: "0 12px",
                fontSize: 16,
                outline: "none",
                background: "rgba(255,255,255,0.95)",
              }}
            />

            <button
              type="submit"
              style={{
                marginTop: 6,
                height: FIELD_H,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: "#2E7D6F",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
                boxShadow: "0 6px 18px rgba(46,125,111,0.35)",
              }}
            >
              Sign In
            </button>
          </form>
        </div>

        {/* "or" divider (optional; anchored in design pixels) */}
        <div
          style={{
            position: "absolute",
            left: OR_LEFT,
            top: OR_TOP,
            width: OR_WIDTH,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
          <span style={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
        </div>

        {/* GOOGLE BUTTON: all four edges fixed in design pixels */}
        <div
          style={{
            position: "absolute",
            left: G_LEFT,
            top: G_TOP,
            width: G_WIDTH,
            height: G_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Google widget width matches container; height is controlled by container box */}
          <GoogleLogin
            size="large"
            text="signin_with"
            shape="rectangular"
            width={String(G_WIDTH)}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}
