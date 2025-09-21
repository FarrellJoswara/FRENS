import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginPage from "./pages/LoginPage";
import FrontPage from "./pages/FrontPage";
import Calendar from "./pages/calendar";
import Finance from "./pages/finance";
import Lyfe from "./pages/lyfe";
import Personal from "./pages/personal";
import Social from "./pages/social/social";
import Whiteboard from "./pages/whiteboard";
import Map from "./pages/social/map";
import Split from "./pages/social/split";
import List from "./pages/social/list";


const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// ProtectedRoute wrapper
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("google_token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  let user = {};
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      user = { name: payload.name, email: payload.email };
    }
  } catch (e) {
    console.error("Failed to decode token:", e);
  }

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
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          <Route path="/lyfe" element={<ProtectedRoute><Lyfe /></ProtectedRoute>} />
          <Route path="/personal" element={<ProtectedRoute><Personal /></ProtectedRoute>} />
          <Route path="/whiteboard" element={<ProtectedRoute><Whiteboard /></ProtectedRoute>} />
          <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
          <Route path="/social/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
          <Route path="/social/split" element={<ProtectedRoute><Split /></ProtectedRoute>} />
          <Route path="/social/list" element={<ProtectedRoute><List /></ProtectedRoute>} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
