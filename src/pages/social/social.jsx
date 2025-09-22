// middle man
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
        img={Button1}
        top="50%"
        left="10%"
        rotation={0}
        scale={100}
        hoverScale={1.08}
        route="/social/map"   // where it navigates on click
      />
      <Redirect_Button
        img={Button1}
        top="50%"
        left="20%"
        rotation={0}
        scale={100}
        hoverScale={1.08}          // rotation in degrees
        route="/social/split"   // where it navigates on click
      />
      <Redirect_Button
        img={Button1}
        top="50%"
        left="30%"
        rotation={0}
        scale={100}
        hoverScale={1.08}        // rotation in degrees
        route="/social/list"   // where it navigates on click
      />
    </div>
    
  );
}

export default Social;
