import React from "react";
import Frontend from "../assets/Frontend.svg";
import Redirect_Button from "../components/Redirect_Button.jsx"; // go up one folder
import Button1 from "../assets/react.svg";

function FrontPage() {
  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        backgroundImage: `url(${Frontend})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Redirect_Button
        svg={Button1}
        top="70%"
        left="80%"
        size={100}
        rotation={0}
        route="/whiteboard"
      />
    </div>
  );
}

export default FrontPage;
