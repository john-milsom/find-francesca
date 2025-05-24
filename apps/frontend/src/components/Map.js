import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import axios from "axios";
import './Map.css';

const containerStyle = {
  width: "800px",
  height: "600px",
};

const defaultCenter = {
  lat: 51.5473,
  lng: -0.0131,
};

const API_URL = "https://find-francesca-12182840987.europe-west2.run.app"; // ⬅️ Replace with your function URL

function Map() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBjS5PxGc8Ga1HqY0VwtXIQdrqxOEtiWxE", // ⬅️ Replace this
  });

  const [markerPosition, setMarkerPosition] = useState(null); // API marker
  const [clickedPosition, setClickedPosition] = useState(null); // Clicked marker
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load stored location on page load
  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        const { lat, lng, timestamp } = response.data;
        setMarkerPosition({ lat, lng });
        setLastUpdated(timestamp);
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
          const newLocation = { lat: latitude, lng: longitude};
          setMarkerPosition(newLocation);

          // Save to API
          axios
            .post(API_URL, newLocation)
            .then((response) => {
              console.log("Location saved to API");
              // Update the timestamp if returned from the API
              if (response.data && response.data.timestamp) {
                setLastUpdated(response.data.timestamp);
              }
            })
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

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never";
    
    try {
      const date = new Date(lastUpdated?._seconds*1000+lastUpdated?._nanoseconds);
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
        onClick={handleUpdateLocation}
        className="default-btn"
      >
        Update with current location
      </button>
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
            <Marker position={clickedPosition}/>
          )}
        </GoogleMap>
      </div>
      <div className="last-updated">
        Last updated at: { formatTimestamp(lastUpdated)}
      </div>
      {clickedPosition && (
        <button
          onClick={() => {
            // Use handleUpdateLocation logic, but set location to clicked marker
            setMarkerPosition(clickedPosition);

            // Save to API
            axios
              .post(API_URL, clickedPosition)
              .then((response) => {
                console.log("Clicked location saved to API (second button)");
                if (response.data && response.data.timestamp) {
                  setLastUpdated(response.data.timestamp);
                }
                setClickedPosition(null); // Clear clicked position after saving
              })
              .catch((error) => console.error("Error saving clicked location:", error));
          }}
          className="default-btn"
        >
          Set location to clicked marker
        </button>
      )}
    </div>
  );
}

export default Map;