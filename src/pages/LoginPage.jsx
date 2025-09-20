import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
    if (credentialResponse?.credential) {
      sessionStorage.setItem("google_token", credentialResponse.credential);

      // decode the JWT to get user info
      try {
        const payload = JSON.parse(
          atob(credentialResponse.credential.split(".")[1])
        );
        console.log("User email:", payload.email);
        console.log("User name:", payload.name);
      } catch (e) {
        console.error("Could not decode token:", e);
      }

      navigate("/front");
    } else {
      console.warn("Google login succeeded but no credential present", credentialResponse);
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
    alert("Google login failed. Please try again.");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "#a0c4ff",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Welcome! Login</h1>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}

export default LoginPage;
