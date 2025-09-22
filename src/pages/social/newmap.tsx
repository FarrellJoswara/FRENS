// src/pages/social/map.jsx
import React, { useEffect, useState } from "react";
import { APIProvider, Map as VisMap, Marker } from "@vis.gl/react-google-maps";
import mapRachIcon from "../../assets/map_rach.png"; 

const MapPage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [showCard, setShowCard] = useState(false); // controls card visibility

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => setUserLocation({ lat: 38.9717, lng: -95.2353 }) // fallback: Lawrence, KS
      );
    } else {
      setUserLocation({ lat: 38.9717, lng: -95.2353 }); // fallback
    }
  }, []);

  if (!userLocation) {
    return <div>Loading map...</div>;
  }

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <VisMap
        defaultZoom={13}
        defaultCenter={userLocation}
        onCameraChanged={(ev) =>
          console.log("camera changed:", ev.detail.center, "zoom:", ev.detail.zoom)
        }
        style={{ width: "100vw", height: "100vh", position: "relative" }}
      >
        <Marker
          position={userLocation}
          icon={{
            url: mapRachIcon,
            scaledSize: { width: 30, height: 70 },
          }}
          onClick={() => setShowCard(!showCard)} // toggle card
        />

        {/* Info Card */}
        {showCard && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              padding: "1rem",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              zIndex: 10,
            }}
          >
            <h3>Your Location</h3>
            <p>
              Latitude: {userLocation.lat.toFixed(4)} <br />
              Longitude: {userLocation.lng.toFixed(4)}
            </p>
          </div>
        )}
      </VisMap>
    </APIProvider>
  );
};

export default MapPage;
