
import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import axios from "axios";

const containerStyle = {
  width: "800px",
  height: "600px",
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

const API_URL = "https://find-francesca-12182840987.europe-west2.run.app"; // ⬅️ Replace with your function URL

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBjS5PxGc8Ga1HqY0VwtXIQdrqxOEtiWxE", // ⬅️ Replace this
  });

  const [markerPosition, setMarkerPosition] = useState(null);

  // Load stored location on page load
  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        const { lat, lng } = response.data;
        setMarkerPosition({ lat, lng });
      })
      .catch((error) => {
        console.error("Error fetching location:", error);
      });
  }, []);

  const handleUpdateLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Latitude:", latitude);
          console.log("Longitude:", longitude);
          const newLocation = { lat: latitude, lng: longitude };
          setMarkerPosition(newLocation);

          // Save to API
          axios
            .post(API_URL, newLocation)
            .then(() => console.log("Location saved to API"))
            .catch((error) => console.error("Error saving location:", error));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <h1>Where is Francesca?</h1>
      <button
        onClick={handleUpdateLocation}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Update with current location
      </button>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <GoogleMap mapContainerStyle={containerStyle} center={markerPosition || defaultCenter} zoom={markerPosition ? 12 : 4}>
          {markerPosition && <Marker position={markerPosition} />}
        </GoogleMap>
      </div>
    </div>
  );
}

export default App;
