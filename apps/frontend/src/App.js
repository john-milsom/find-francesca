import React, { useState } from "react";
import Map from "./components/Map";
import ImportantInfo from "./components/ImportantInfo";
import Calendar from "./components/Calendar";
import { AuthProvider } from "./components/AuthContext";
import AuthGate from "./components/AuthGate";
import "./App.css";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState("map");

  const handleNav = (screenName) => {
    setScreen(screenName);
    setMenuOpen(false);
  };

  return (
    <AuthProvider>
      <AuthGate>
        <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}>
          {/* Hamburger menu icon */}
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <div />
            <div />
            <div />
          </div>
          {/* Side menu */}
          {menuOpen && (
            <div className="side-menu">
              <button onClick={() => handleNav("map")}>Map</button>
              <button onClick={() => handleNav("info")}>Information</button>
              <button onClick={() => handleNav("calendar")}>Calendar</button>
            </div>
          )}
          <h1>Where is Francesca?</h1>
          {screen === "map" && <Map />}
          {screen === "info" && <ImportantInfo />}
          {screen === "calendar" && <Calendar />}
        </div>
      </AuthGate>
    </AuthProvider>
  );
}

export default App;