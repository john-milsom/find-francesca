import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import axios from "axios";
import './Map.css';
import { useAuth } from "./AuthContext"; // <-- Import the Auth context

const containerStyle = {
  width: "800px",
  height: "600px",
};

const defaultCenter = {
  lat: 51.5473,
  lng: -0.0131,
};

const API_URL = "https://find-francesca-12182840987.europe-west2.run.app";

function Map() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBjS5PxGc8Ga1HqY0VwtXIQdrqxOEtiWxE",
  });

  const { idToken } = useAuth(); // <-- Get the token from context

  const [markerPosition, setMarkerPosition] = useState(null);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load stored location on page load
  useEffect(() => {
    if (!idToken) return; // Wait for token
    axios
      .get(API_URL, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
      .then((response) => {
        const { lat, lng, timestamp } = response.data;
        setMarkerPosition({ lat, lng });
        setLastUpdated(timestamp);
      })
      .catch((error) => {
        console.error("Error fetching location:", error);
      });
  }, [idToken]);

  // Shared function to update location and save to API
  const updateLocationFromClicked = useCallback(
    (location) => {
      setMarkerPosition(location);

      // Save to API
      axios
        .post(API_URL, location, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        .then((response) => {
          console.log("Location saved to API");
          if (response.data && response.data.timestamp) {
            setLastUpdated(response.data.timestamp);
          }
          setClickedPosition(null); // Clear clicked position after saving
        })
        .catch((error) => console.error("Error saving location:", error));
    },
    [idToken]
  );

  const updateLocationFromCurrent = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Latitude:", latitude);
          console.log("Longitude:", longitude);
          const newLocation = { lat: latitude, lng: longitude };
          updateLocationFromClicked(newLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [updateLocationFromClicked]);

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never";
    try {
      const date = new Date(lastUpdated?._seconds * 1000 + lastUpdated?._nanoseconds);
      return date.toISOString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return timestamp; // Return the raw timestamp if formatting fails
    }
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="map-container">
      <button
        onClick={updateLocationFromCurrent}
        className="default-btn"
      >
        Update with current location
      </button>
      {clickedPosition && (
        <button
          onClick={() => updateLocationFromClicked(clickedPosition)}
          className="default-btn"
        >
          Set location to clicked marker
        </button>
      )}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={markerPosition || defaultCenter}
          zoom={markerPosition ? 16 : 4}
          onClick={(e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setClickedPosition({ lat, lng });
            console.log("Map clicked at:", { lat, lng });
          }}
        >
          {markerPosition && (
            <Marker position={markerPosition}
              icon={{
                url: "/car.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }} />
          )}
          {clickedPosition && (
            <Marker position={clickedPosition} />
          )}
        </GoogleMap>
      </div>
      <div className="last-updated">
        Last updated at: {formatTimestamp(lastUpdated)}
      </div>
    </div>
  );
}

export default Map;