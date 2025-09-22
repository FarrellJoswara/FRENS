// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import LoginPage from "./pages/LoginPage";
import FrontPage from "./pages/FrontPage";
import Calendar from "./pages/calendar";
import Finance from "./pages/Finance";
import Health from "./pages/Health";
import Lyfe from "./pages/lyfe";
import Personal from "./pages/personal";
import Goals from "./pages/Goals"; // new Goals page
import Whiteboard from "./pages/whiteboard";
import Map from "./pages/social/map";
import Split from "./pages/social/split";
import List from "./pages/social/list";
import Tutorial from "./pages/tutorial";

import { LyfeProvider, useLyfe } from "./lyfe/LyfeContext";
import Layout from "./components/Layout";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/* ---------- ProtectedRoute ---------- */
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("google_token");
  if (!token) return <Navigate to="/" replace />;

  let user = {};
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    user = { name: payload.name, email: payload.email };
  } catch (e) {
    console.error("Failed to decode token:", e);
  }

  return typeof children === "function"
    ? children(user)
    : React.cloneElement(children, { user });
}

/* ---------- WithLyfe ---------- */
function WithLyfe({ children, user }) {
  return <LyfeProvider userEmail={user?.email}>{children}</LyfeProvider>;
}

/* ---------- Route wrappers ---------- */
function FinanceRoute() {
  const { lyfeId } = useParams();
  return <Finance lyfeId={lyfeId} />;
}
function HealthRoute() {
  const { lyfeId } = useParams();
  return <Health lyfeId={lyfeId} />;
}

/* ---------- Index redirects ---------- */
function FinanceIndexRedirect() {
  const { currentId } = useLyfe();
  return currentId
    ? <Navigate to={`/finance/${currentId}`} replace />
    : <Navigate to="/lyfe" replace />;
}
function HealthIndexRedirect() {
  const { currentId } = useLyfe();
  return currentId
    ? <Navigate to={`/health/${currentId}`} replace />
    : <Navigate to="/lyfe" replace />;
}

export default function App() {
  if (!clientId) {
    console.warn("VITE_GOOGLE_CLIENT_ID is missing. Set it in your .env file.");
  }

  return (
    <GoogleOAuthProvider clientId={clientId || "missing-client-id"}>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected with Layout */}
          <Route
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <Layout />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          >
            <Route path="/front" element={<FrontPage />} />
            <Route path="/lyfe" element={<Lyfe />} />
            <Route path="/calendar" element={<Calendar />} />

            {/* Personal and nested routes */}
            <Route path="/personal" element={<Personal />} />
            <Route path="/personal/health" element={<HealthIndexRedirect />} />
            <Route path="/personal/goals" element={<Goals />} />

            {/* Standalone Goals route */}
            <Route path="/goals" element={<Goals />} />

            <Route path="/whiteboard" element={<Whiteboard />} />

            {/* Finance */}
            <Route path="/finance/:lyfeId" element={<FinanceRoute />} />
            <Route path="/finance" element={<FinanceIndexRedirect />} />

            {/* Health */}
            <Route path="/health/:lyfeId" element={<HealthRoute />} />
            <Route path="/health" element={<HealthIndexRedirect />} />

            {/* Social */}
            <Route path="/social" element={<Map />} />
            <Route path="/social/map" element={<Map />} />
            <Route path="/social/split" element={<Split />} />
            <Route path="/social/list" element={<List />} />

            {/* Tutorial */}
            <Route path="/tutorial" element={<Tutorial />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}
