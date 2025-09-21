import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginPage from "./pages/LoginPage";
import FrontPage from "./pages/FrontPage";
import Calendar from "./pages/calendar";
import Finance from "./pages/Finance";
import Health from "./pages/Health";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// ProtectedRoute wrapper
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("google_token");

  if (!token) {
    return <Navigate to="/" replace />; // redirect to login if not logged in
  }

  // decode token to get user info
  let user = {};
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    user = {
      name: payload.name,
      email: payload.email,
    };
  } catch (e) {
    console.error("Failed to decode token:", e);
  }

  // clone children and pass user as prop
  return React.cloneElement(children, { user });
}

function App() {
  if (!clientId) {
    console.warn("VITE_GOOGLE_CLIENT_ID is missing. Set it in your .env file.");
  }

  return (
    <GoogleOAuthProvider clientId={clientId || "missing-client-id"}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/front"
            element={
              <ProtectedRoute>
                <FrontPage />
              </ProtectedRoute>
            }
          />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/finance" element={<Finance />} /> {/* ← NEW: direct access */}
          <Route path="/health" element={<Health />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
