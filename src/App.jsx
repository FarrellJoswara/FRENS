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
import Social from "./pages/social/social";
import Whiteboard from "./pages/whiteboard";
import Map from "./pages/social/map";
import Split from "./pages/social/split";
import List from "./pages/social/list";
import Tutorial from "./pages/tutorial";

import { LyfeProvider, useLyfe } from "./lyfe/LyfeContext";

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

  return typeof children === "function" ? children(user) : React.cloneElement(children, { user });
}

/* ---------- WithLyfe ---------- */
function WithLyfe({ children, user }) {
  return <LyfeProvider userEmail={user?.email}>{children}</LyfeProvider>;
}

/* ---------- Route wrappers for :lyfeId ---------- */
function FinanceRoute() {
  const { lyfeId } = useParams();
  return <Finance lyfeId={lyfeId} />;
}
function HealthRoute() {
  const { lyfeId } = useParams();
  return <Health lyfeId={lyfeId} />;
}

/* ---------- Index redirects using Lyfe context ---------- */
function FinanceIndexRedirect() {
  const { currentId } = useLyfe();
  return currentId ? <Navigate to={`/finance/${currentId}`} replace /> : <Navigate to="/lyfe" replace />;
}
function HealthIndexRedirect() {
  const { currentId } = useLyfe();
  return currentId ? <Navigate to={`/health/${currentId}`} replace /> : <Navigate to="/lyfe" replace />;
}

export default function App() {
  if (!clientId) {
    console.warn("VITE_GOOGLE_CLIENT_ID is missing. Set it in your .env file.");
  }

  return (
    <GoogleOAuthProvider clientId={clientId || "missing-client-id"}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/front"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <FrontPage />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/lyfe"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <Lyfe />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />

          {/* Finance */}
          <Route
            path="/finance/:lyfeId"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <FinanceRoute />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <FinanceIndexRedirect />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />

          {/* Health */}
          <Route
            path="/health/:lyfeId"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <HealthRoute />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/health"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <HealthIndexRedirect />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />

          {/* Other protected pages */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <Calendar />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <Personal />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/whiteboard"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <Whiteboard />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />

          {/* Social shortcut goes straight to Map */}
          <Route
            path="/social"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <Map />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />

          {/* Social sub-pages */}
          <Route
            path="/social/map"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <Map />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/social/split"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <Split />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/social/list"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <List />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />

          {/* Tutorial */}
          <Route
            path="/tutorial"
            element={
              <ProtectedRoute>
                {(user) => (
                  <WithLyfe user={user}>
                    <Tutorial />
                  </WithLyfe>
                )}
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}
