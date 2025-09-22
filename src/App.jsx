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

import { LyfeProvider, useLyfe } from "./lyfe/LyfeContext"; // ⬅️ added useLyfe

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/* ---------- Auth gate that injects {user} ---------- */
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
  return React.cloneElement(children, { user });
}

/* ---------- Wrap any subtree with LyfeProvider using the user from ProtectedRoute ---------- */
function WithLyfe({ children, user }) {
  return <LyfeProvider userEmail={user?.email}>{children}</LyfeProvider>;
}

/* ---------- Route helpers to pass :lyfeId down as a prop if your pages expect it ---------- */
function FinanceRoute() {
  const { lyfeId } = useParams();
  return <Finance lyfeId={lyfeId} />;
}
function HealthRoute() {
  const { lyfeId } = useParams();
  return <Health lyfeId={lyfeId} />;
}

/* ---------- Index redirects that jump to the active lyfe if present ---------- */
function FinanceIndexRedirect() {
  const { currentId } = useLyfe();
  return currentId ? <Navigate to={`/finance/${currentId}`} replace /> : <Navigate to="/lyfe" replace />;
}
function HealthIndexRedirect() {
  const { currentId } = useLyfe();
  return currentId ? <Navigate to={`/health/${currentId}`} replace /> : <Navigate to="/lyfe" replace />;
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
                <WithLyfe>
                  <FrontPage />
                </WithLyfe>
              </ProtectedRoute>
            }
          />

          {/* Lyfe selector hub */}
          <Route
            path="/lyfe"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <Lyfe />
                </WithLyfe>
              </ProtectedRoute>
            }
          />

          {/* Finance & Health tied to a specific lyfe */}
          <Route
            path="/finance/:lyfeId"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <FinanceRoute />
                </WithLyfe>
              </ProtectedRoute>
            }
          />
          <Route
            path="/health/:lyfeId"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <HealthRoute />
                </WithLyfe>
              </ProtectedRoute>
            }
          />

          {/* Base paths → auto-jump to current lyfe (or /lyfe if none) */}
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <FinanceIndexRedirect />
                </WithLyfe>
              </ProtectedRoute>
            }
          />
          <Route
            path="/health"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <HealthIndexRedirect />
                </WithLyfe>
              </ProtectedRoute>
            }
          />

          {/* other pages (kept inside WithLyfe so the active-lyfe badge can work) */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <Calendar />
                </WithLyfe>
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <Personal />
                </WithLyfe>
              </ProtectedRoute>
            }
          />
          <Route
            path="/whiteboard"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <Whiteboard />
                </WithLyfe>
              </ProtectedRoute>
            }
          />
          <Route
            path="/social"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <Social />
                </WithLyfe>
              </ProtectedRoute>
            }
          />
          <Route
            path="/social/map"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <Map />
                </WithLyfe>
              </ProtectedRoute>
            }
          />
          <Route
            path="/social/split"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <Split />
                </WithLyfe>
              </ProtectedRoute>
            }
          />
          <Route
            path="/social/list"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <List />
                </WithLyfe>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutorial"
            element={
              <ProtectedRoute>
                <WithLyfe>
                  <Tutorial />
                </WithLyfe>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
