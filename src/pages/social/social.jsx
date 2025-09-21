import React from "react";
import Redirect_Button from "../../components/Redirect_Button"; // go up 2 levels into components
import Button1 from "../../assets/react.svg"; // adjust path to your svg asset

function Social() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "3rem",
      fontWeight: "bold"
    }}>
      hello chat  
      <Redirect_Button
        svg={Button1}         // SVG for the button
        top="10%"             // percent from top of container
        left="50%"            // percent from left of container
        size={80}             // size in pixels
        rotation={0}          // rotation in degrees
        route="/social/map"   // where it navigates on click
      />
      <Redirect_Button
        svg={Button1}         // SVG for the button
        top="10%"             // percent from top of container
        left="20%"            // percent from left of container
        size={80}             // size in pixels
        rotation={0}          // rotation in degrees
        route="/social/split"   // where it navigates on click
      />
      <Redirect_Button
        svg={Button1}         // SVG for the button
        top="10%"             // percent from top of container
        left="80%"            // percent from left of container
        size={80}             // size in pixels
        rotation={0}          // rotation in degrees
        route="/social/list"   // where it navigates on click
      />
    </div>
    
  );
}

export default Social;
