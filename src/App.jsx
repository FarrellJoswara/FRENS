import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginPage from "./pages/LoginPage";
import FrontPage from "./pages/FrontPage";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  if (!clientId) {
    console.warn("VITE_GOOGLE_CLIENT_ID is missing. Set it in your .env file.");
  }

  return (
    <GoogleOAuthProvider clientId={clientId || "missing-client-id"}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/front" element={<FrontPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
