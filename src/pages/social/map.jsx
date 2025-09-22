// src/pages/maps.jsx
import React, { useEffect, useRef, useState } from "react";
import mapRachIcon from "../../assets/map_rach.png"; 
const GOOGLE_MAPS_API_KEY = "AIzaSyA5NNDc-R37Cm3wjPXlzNL8TXyUqS4avO8";

function Maps() {
  const mapRef = useRef(null);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState({ name: "", time: "", location: "" });
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  // Initialize map and user location
  const initMap = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLatLng = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(userLatLng);

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: userLatLng,
          zoom: 14,
        });

        // User marker with custom icon
        const userMarker = new window.google.maps.Marker({
          position: userLatLng,
          map: mapInstance,
          title: "You are here",
          icon: {
            url: mapRachIcon,
            scaledSize: new window.google.maps.Size(30, 70),
          },
        });

        // Zoom in when user marker is clicked
        userMarker.addListener("click", () => {
          mapInstance.setZoom(18);
          mapInstance.panTo(userMarker.getPosition());
        });

        setMap(mapInstance);
      },
      (err) => {
        console.error(err);
        const defaultLocation = { lat: 39.0119, lng: -95.675 };
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 14,
        });
        setMap(mapInstance);
      }
    );
  };

  // Initialize Autocomplete when form is shown
  useEffect(() => {
    if (showEventForm && window.google && locationInputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(locationInputRef.current, {
        fields: ["geometry", "name", "formatted_address"],
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry) {
          alert("No details available for input: '" + place.name + "'");
          return;
        }
        setSelectedPlace(place);
        setEventData((prev) => ({ ...prev, location: place.formatted_address || place.name }));
      });
    }
  }, [showEventForm]);

  // Handle event creation
  const handleCreateEvent = (e) => {
    e.preventDefault();

    if (!selectedPlace || !selectedPlace.geometry) {
      alert("Please select a valid location from the dropdown.");
      return;
    }

    const locationLatLng = selectedPlace.geometry.location;

    const marker = new window.google.maps.Marker({
      position: locationLatLng,
      map: map,
      title: `${eventData.name} - ${eventData.time}`,
    });

    // Zoom in when event marker is clicked
    marker.addListener("click", () => {
      map.setZoom(18);
      map.panTo(marker.getPosition());
    });

    setMarkers((prev) => [...prev, marker]);
    setShowEventForm(false);
    setEventData({ name: "", time: "", location: "" });
    setSelectedPlace(null);
    map.panTo(locationLatLng);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* Create Event Button */}
      <button
        onClick={() => setShowEventForm(true)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 5,
          padding: "10px 20px",
          backgroundColor: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Create Event
      </button>

      {/* Event Form */}
      {showEventForm && (
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 20,
            backgroundColor: "white",
            padding: 20,
            zIndex: 10,
            borderRadius: 10,
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            width: 300,
          }}
        >
          <h3>Create Event</h3>
          <form onSubmit={handleCreateEvent}>
            <div style={{ marginBottom: 10 }}>
              <label>Event Name:</label>
              <input
                type="text"
                value={eventData.name}
                onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                required
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Time:</label>
              <input
                type="datetime-local"
                value={eventData.time}
                onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                required
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Location:</label>
              <input
                ref={locationInputRef}
                type="text"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                placeholder="Enter address or place"
                required
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                type="submit"
                style={{ backgroundColor: "#34A853", color: "white", padding: "5px 10px", border: "none", borderRadius: 5 }}
              >
                Add Event
              </button>
              <button
                type="button"
                onClick={() => setShowEventForm(false)}
                style={{ backgroundColor: "#EA4335", color: "white", padding: "5px 10px", border: "none", borderRadius: 5 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Maps;
