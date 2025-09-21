// src/pages/FrontPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLyfe } from "../lyfe/LyfeContext";

import Frontend from "../assets/Frontend.svg";
import Redirect_Button from "../components/Redirect_Button.jsx";
import Books from "../assets/books.png";
import Computer from "../assets/computer.png";
import Rachel from "../assets/rachel.png";
import Window from "../assets/window.png";
import Whiteboard from "../assets/whiteboard.png";

function FrontPage() {
  const nav = useNavigate();
  const { list, currentId } = useLyfe();
  const active = list.find(l => l.id === currentId);

  const routeFor = (base) => (currentId ? `${base}/${currentId}` : base);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${Frontend})`,
        backgroundSize: "cover",      // keep it truly fullscreen
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      {/* Active lyfe badge (inside the canvas, pinned top-left) */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          padding: "8px 10px",
          background: "#ffffffcc",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          backdropFilter: "blur(4px)",
          zIndex: 10
        }}
      >
        <div style={{ fontSize: 12, color: "#64748b" }}>Active lyfe</div>
        <div style={{ fontWeight: 800 }}>{active?.name || "—"}</div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          {active?.finance?.inputs?.goal || "No finance inputs yet"}
        </div>
      </div>

      {/* Buttons */}
      <Redirect_Button
        img={Whiteboard}
        top="33.8%"
        left="13.81%"
        rotation={0}
        route="/whiteboard"
        scale={63.4}
        hoverScale={1.08}
      />

      {/* Computer -> Finance (go straight into current lyfe if present) */}
      <Redirect_Button
        img={Computer}
        top="68.87%"
        left="24.7%"
        rotation={0}
        route={routeFor("/finance")}
        scale={63.45}
        hoverScale={1.08}
      />

      {/* Window -> Health */}
      <Redirect_Button
        img={Window}
        top="37%"
        left="51.29%"
        rotation={0}
        route={routeFor("/health")}
        scale={63.4}
        hoverScale={1.032}
      />

      {/* Books / Personal (unchanged) */}
      <Redirect_Button
        img={Books}
        top="87.1%"
        left="74.5%"
        rotation={0}
        route="/personal"
        scale={63.55}
      />

      {/* Rachel -> Lyfe selector */}
      <Redirect_Button
        img={Rachel}
        top="74%"
        left="54.95%"
        rotation={0}
        route="/lyfe"
        scale={63}
        hoverScale={1.1}
      />
    </div>
  );
}

export default FrontPage;
