import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import FrontPage from "./pages/FrontPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/front" element={<FrontPage />} />
      </Routes>
    </Router>
  );
}

export default App;
