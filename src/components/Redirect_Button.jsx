import React from "react";
import { useNavigate } from "react-router-dom";

function Redirect_Button({
  svg,           // path to SVG
  top = "50%",   // position top
  left = "50%",  // position left
  size = 80,     // width/height in px
  rotation = 0,  // rotation in degrees
  route = "/",   // where to navigate
}) {
  const navigate = useNavigate();

  if (!svg) {
    console.warn("SvgButton: No SVG provided");
    return null;
  }

  return (
    <img
      src={svg}
      alt="Button"
      onClick={() => navigate(route)}
      style={{
        position: "absolute",
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        cursor: "pointer",
      }}
    />
  );
}

export default Redirect_Button;
