import React from "react";
import { useNavigate } from "react-router-dom";
import { useLyfe } from "../lyfe/LyfeContext";

import Frontend from "../assets/Frontend.svg"; // background SVG
import Redirect_Button from "../components/Redirect_Button.jsx";
import Books from "../assets/books.png";
import Computer from "../assets/computer.png";
import Rachel from "../assets/rachel.png";
import Window from "../assets/window.png";
import Whiteboard from "../assets/whiteboard.png";

function FrontPage() {
  const nav = useNavigate();
  const { list = [], currentId } = useLyfe();           // provided by LyfeProvider
  const active = list.find((l) => l.id === currentId);  // current scenario

  return (
<div
  style={{
    position: "fixed",   // <— anchor to viewport
    inset: 0,            // top/right/bottom/left = 0
    width: "100%",
    height: "100%",
    backgroundImage: `url(${Frontend})`,
    backgroundSize: "cover",       // <— fill the screen
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  }}
>

      {/* Active lyfe chip */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          padding: "8px 10px",
          background: "#ffffffcc",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 10px rgba(0,0,0,.06)",
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: 12, color: "#64748b" }}>Active lyfe</div>
        <div style={{ fontWeight: 800 }}>{active?.name || "—"}</div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          {active?.finance?.inputs?.goal || "No finance inputs yet"}
        </div>
      </div>

      {/* Buttons placed against the background */}
      <Redirect_Button
        img={Books}
        top="87.1%"
        left="74.5%"
        rotation={0}
        route="/personal"
        scale={63.55}
      />

      <Redirect_Button
        img={Whiteboard}
        top="33.8%"
        left="13.81%"
        rotation={0}
        route="/whiteboard"
        scale={63.4}
        hoverScale={1.08}
      />

      {/* Tip: you can point this to `/finance/${currentId}` if you want to jump straight
          into the active lyfe’s Finance page. Your router currently redirects /finance → /lyfe. */}
      <Redirect_Button
        img={Computer}
        top="68.87%"
        left="24.7%"
        rotation={0}
        route="/finance"
        scale={63.45}
        hoverScale={1.08}
      />

      <Redirect_Button
        img={Window}
        top="37%"
        left="51.29%"
        rotation={0}
        route="/social"
        scale={63.4}
        hoverScale={1.032}
      />

      {/* Character → Lyfe selector */}
      <Redirect_Button
        img={Rachel}
        top="74%"
        left="54.95%"
        rotation={0}
        route="/lyfe"
        scale={63}
        hoverScale={1.1}
        // If you prefer a manual onClick instead of Redirect_Button:
        // onClick={() => nav("/lyfe")}
      />
    </div>
  );
}

export default FrontPage;
