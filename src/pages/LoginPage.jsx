import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
    // credentialResponse contains a JWT in credentialResponse.credential
    // Save it to sessionStorage and redirect to the front page.
    if (credentialResponse && credentialResponse.credential) {
      sessionStorage.setItem("google_token", credentialResponse.credential);
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
