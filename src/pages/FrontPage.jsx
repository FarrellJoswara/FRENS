// src/pages/FrontPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLyfe } from "../lyfe/LyfeContext";

import Frontend from "../assets/Frontend.svg"; // background SVG
import Redirect_Button from "../components/Redirect_Button.jsx";
import Books from "../assets/books.png";
import Computer from "../assets/computer.png";
import Rachel from "../assets/rachel.png";
import Window from "../assets/window.png";
import Whiteboard from "../assets/whiteboard.png";

const BASE_W = 1920;
const BASE_H = 1080;

export default function FrontPage() {
  const nav = useNavigate();
  const { list, currentId } = useLyfe();
  const active = list.find(l => l.id === currentId);

  const routeFor = (base) => (currentId ? `${base}/${currentId}` : base);

  const [{ scale, offsetX, offsetY }, setStage] = useState({ scale: 1, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sx = vw / BASE_W;
      const sy = vh / BASE_H;
      const s = Math.max(sx, sy); // cover scaling
      const ox = (vw - BASE_W * s) / 2; // horizontal crop offset
      const oy = (vh - BASE_H * s) / 2; // vertical crop offset
      setStage({ scale: s, offsetX: ox, offsetY: oy });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${Frontend})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      {/* Active lyfe badge */}
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
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: 12, color: "#64748b" }}>Active lyfe</div>
        <div style={{ fontWeight: 800 }}>{active?.name || "—"}</div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          {active?.finance?.inputs?.goal || "No finance inputs yet"}
        </div>
      </div>

      {/* Buttons using % coordinates */}
      <Redirect_Button img={Whiteboard} top="33.8%" left="13.81%" rotation={0} route="/whiteboard" scale={63.4} hoverScale={1.08} />
      <Redirect_Button img={Computer} top="68.87%" left="24.7%" rotation={0} route={routeFor("/finance")} scale={63.45} hoverScale={1.08} />
      <Redirect_Button img={Window} top="37%" left="51.29%" rotation={0} route={routeFor("/health")} scale={63.4} hoverScale={1.032} />
      <Redirect_Button img={Books} top="87.1%" left="74.5%" rotation={0} route="/personal" scale={63.55} />
      <Redirect_Button img={Rachel} top="74%" left="54.95%" rotation={0} route="/lyfe" scale={63} hoverScale={1.1} />

      {/* Stage overlay with fixed design coordinates */}
      <div
        style={{
          position: "fixed",
          left: offsetX,
          top: offsetY,
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          backgroundImage: `url(${Frontend})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Buttons in design pixels */}
        <Redirect_Button img={Books} top="941px" left="1491px" rotation={0} route="/personal" scale={82} hoverScale={1.08} isDesignCoords />
        <Redirect_Button img={Whiteboard} top="365px" left="165px" rotation={0} route="/whiteboard" scale={82} hoverScale={1.04} isDesignCoords />
        <Redirect_Button img={Window} top="400px" left="986px" rotation={0} route="/social/map" scale={80} hoverScale={1.032} isDesignCoords />
        <Redirect_Button img={Computer} top="744px" left="404px" rotation={0} route="/finance" scale={82} hoverScale={1.05} isDesignCoords />
        <Redirect_Button img={Rachel} top="799px" left="1064px" rotation={0} route="/lyfe" scale={82} hoverScale={1.05} isDesignCoords />
      </div>
    </div>
  );
}
