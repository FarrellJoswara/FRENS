// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import Healthbg from "../assets/Health.svg";   // background image
import Rachel from "../assets/Rachel.png";     // button image
import Redirect_Button from "../components/Redirect_Button";

// native background size (the size your SVG was designed for)
const BASE_W = 1440;
const BASE_H = 1080;

export default function Personal() {
  const [{ scale, offsetX, offsetY }, setStage] = useState({ scale: 1, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const sx = vw / BASE_W, sy = vh / BASE_H;
      const s = Math.max(sx, sy);             // cover scaling
      const ox = (vw - BASE_W * s) / 2;       // horizontal crop offset
      const oy = (vh - BASE_H * s) / 2;       // vertical crop offset
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
        backgroundImage: `url(${Healthbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
      {/* Stage overlay — scales with the background */}
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
        {/* Button placed in design pixels relative to original background */}
        <Redirect_Button
          img={Rachel}
          top="666px"    // <== Y in design pixels (74% of 900 ≈ 666)
          left="1000px"   // <== X in design pixels (54.95% of 1440 ≈ 791)
          rotation={0}
          route="/lyfe"
          scale={63}
          hoverScale={1.1}
          isDesignCoords   // optional flag so we know these are design pixels
        />
      </div>
    </div>
  );
}
