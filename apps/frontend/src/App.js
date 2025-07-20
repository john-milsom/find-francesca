import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Map from "./components/Map";
import ImportantInfo from "./components/ImportantInfo";
import Calendar from "./components/Calendar";
import { AuthProvider, useAuth } from "./components/AuthContext";
import AuthGate from "./components/AuthGate";
import "./App.css";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

function Menu({ setMenuOpen }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="side-menu">
      <button onClick={() => { navigate("/map"); setMenuOpen(false); }}>Map</button>
      <button onClick={() => { navigate("/info"); setMenuOpen(false); }}>Information</button>
      <button onClick={() => { navigate("/calendar"); setMenuOpen(false); }}>Calendar</button>

      {user && (
        <div style={{ marginBottom: 24, fontSize: 14, color: "#1976d2" }}>
          Signed in as {user.email}
          <button
            style={{
              background: "none",
              color: "#1976d2",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              marginLeft: "8px"
            }}
            onClick={async () => {
              await signOut(auth);
              window.location.reload();
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

function MainApp() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      {/* Hamburger menu icon */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <div />
        <div />
        <div />
      </div>
      {/* Side menu */}
      {menuOpen && <Menu setMenuOpen={setMenuOpen} />}
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/map" element={<Map />} />
        <Route path="/info" element={<ImportantInfo />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <Router>
          <MainApp />
        </Router>
      </AuthGate>
    </AuthProvider>
  );
}

export default App;