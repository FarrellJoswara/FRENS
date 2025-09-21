import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Redirect_Button({
  img,            // path to PNG or SVG
  top = "20%",    // position top
  left = "50%",   // position left
  rotation = 0,   // rotation in degrees
  route = "/",    // where to navigate
  scale = 100,    // percent of original size (100 = original)
  hoverScale = 1.2, // multiplier applied when hovered
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  if (!img) {
    console.warn("Redirect_Button: No image provided");
    return null;
  }

  const baseScale = scale / 100;
  const finalScale = hovered ? baseScale * hoverScale : baseScale;

  return (
    <img
      src={img}
      alt="Button"
      onClick={() => navigate(route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        top,
        left,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${finalScale})`,
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        width: "auto",
        height: "auto",
      }}
    />
  );
}

export default Redirect_Button;
