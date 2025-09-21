import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

// Example center coordinates (latitude, longitude)
const center = {
  lat: 39.0119, // example: Kansas coordinates
  lng: -95.675,
};

function Map() {
  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
        {/* Example marker */}
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;
