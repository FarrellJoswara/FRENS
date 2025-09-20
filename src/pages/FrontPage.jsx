import React from "react";
import Frontend from "../assets/Frontend.svg";

function FrontPage() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundImage: `url(${Frontend})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    ></div>
  );
}

export default FrontPage;
