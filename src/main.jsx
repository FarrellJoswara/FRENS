import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function MissingClientId() {
  return (
    <div style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#b00020" }}>Missing Google Client ID</h1>
      <p>
        The environment variable <code>VITE_GOOGLE_CLIENT_ID</code> is not set.
        The Google Sign-In flow requires a valid client ID.
      </p>
      <ol>
        <li>Open <code>.env.example</code> and copy it to <code>.env</code>.</li>
        <li>Replace the placeholder with your Google OAuth Client ID.</li>
        <li>Restart the dev server (stop and run <code>npm run dev</code>).</li>
      </ol>
      <p>
        For details see the README or the Google Cloud Console: https://console.cloud.google.com/apis/credentials
      </p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

if (!clientId) {
  root.render(
    <React.StrictMode>
      <MissingClientId />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={clientId}>
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}
