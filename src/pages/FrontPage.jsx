import React from "react";
import Frontend from "../assets/Frontend.svg"; // background SVG
import Redirect_Button from "../components/Redirect_Button.jsx";
import Books from "../assets/books.png";
import Computer from "../assets/computer.png";
import Rachel from "../assets/rachel.png";
import Window from "../assets/window.png";
import Whiteboard from "../assets/whiteboard.png";

function FrontPage() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${Frontend})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Place the buttons using original image size */}
      
      
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
        hoverScale={1.032} // 30% bigger on hover

      />
      <Redirect_Button
        img={Rachel}
        top="74%"
        left="54.95%"
        rotation={0}
        route="/lyfe"
        scale={63}
        hoverScale={1.1} // 30% bigger on hover

      />
    </div>
  );
}

export default FrontPage;
