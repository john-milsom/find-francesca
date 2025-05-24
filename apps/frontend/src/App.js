import React, { useState } from "react";
import Map from "./components/Map";
import "./App.css";
import ImportantInfo from "./components/ImportantInfo";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState("map");

  const handleNav = (screenName) => {
    setScreen(screenName);
    setMenuOpen(false);
  };

  return (
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
        </div>
      )}
      <h1>Where is Francesca?</h1>
      {screen === "map" && <Map />}
      {screen === "info" && <ImportantInfo />}
    </div>
  );
}

export default App;