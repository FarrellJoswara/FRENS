// src/pages/maps.jsx
import React, { useEffect, useRef, useState } from "react";
import mapRachIcon from "../../assets/map_rach.png";


// TODO: Move this to environment variables for production
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
     script.onerror = () => {
       console.error("Failed to load Google Maps script");
       alert("Failed to load Google Maps. Please check your API key and internet connection.");
     };
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
       console.error("Geolocation error:", err);
       const defaultLocation = { lat: 39.0119, lng: -95.675 }; // Lawrence, KS
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
   if (showEventForm && window.google && window.google.maps && window.google.maps.places && locationInputRef.current && !autocompleteRef.current) {
     try {
       autocompleteRef.current = new window.google.maps.places.Autocomplete(locationInputRef.current, {
         fields: ["geometry", "name", "formatted_address", "place_id"],
         types: ['establishment', 'geocode'] // Allow both businesses and addresses
       });


       autocompleteRef.current.addListener("place_changed", () => {
         const place = autocompleteRef.current.getPlace();
         console.log("Selected place:", place);
        
         if (!place.geometry) {
           console.error("No geometry for place:", place);
           alert("Please select a location from the dropdown suggestions.");
           return;
         }
        
         setSelectedPlace(place);
         setEventData((prev) => ({
           ...prev,
           location: place.formatted_address || place.name
         }));
       });
     } catch (error) {
       console.error("Error initializing autocomplete:", error);
       alert("Error setting up location search. Please try refreshing the page.");
     }
   }


   // Cleanup autocomplete when form is hidden
   return () => {
     if (!showEventForm && autocompleteRef.current) {
       window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
       autocompleteRef.current = null;
     }
   };
 }, [showEventForm]);


 // Handle event creation
 const handleCreateEvent = (e) => {
   e.preventDefault();


   if (!eventData.name || !eventData.time) {
     alert("Please fill in event name and time.");
     return;
   }


   if (!selectedPlace || !selectedPlace.geometry) {
     alert("Please select a valid location from the dropdown suggestions.");
     return;
   }


   try {
     const locationLatLng = {
       lat: selectedPlace.geometry.location.lat(),
       lng: selectedPlace.geometry.location.lng()
     };


     const marker = new window.google.maps.Marker({
       position: locationLatLng,
       map: map,
       title: `${eventData.name} - ${eventData.time}`,
       animation: window.google.maps.Animation.DROP // Add a nice drop animation
     });


     // Create info window for the event
     const infoWindow = new window.google.maps.InfoWindow({
       content: `
         <div>
           <h4>${eventData.name}</h4>
           <p><strong>Time:</strong> ${new Date(eventData.time).toLocaleString()}</p>
           <p><strong>Location:</strong> ${eventData.location}</p>
         </div>
       `
     });


     // Show info window when marker is clicked
     marker.addListener("click", () => {
       infoWindow.open(map, marker);
       map.setZoom(16);
       map.panTo(marker.getPosition());
     });


     setMarkers((prev) => [...prev, { marker, infoWindow }]);
     setShowEventForm(false);
     setEventData({ name: "", time: "", location: "" });
     setSelectedPlace(null);
    
     // Pan to the new event location
     map.panTo(locationLatLng);
     map.setZoom(15);
    
     alert("Event created successfully!");
   } catch (error) {
     console.error("Error creating event:", error);
     alert("Error creating event. Please try again.");
   }
 };


 // Handle form cancellation
 const handleCancelForm = () => {
   setShowEventForm(false);
   setEventData({ name: "", time: "", location: "" });
   setSelectedPlace(null);
 };


 // Handle location input change
 const handleLocationChange = (e) => {
   setEventData({ ...eventData, location: e.target.value });
   // Clear selected place if user manually types
   if (selectedPlace && e.target.value !== (selectedPlace.formatted_address || selectedPlace.name)) {
     setSelectedPlace(null);
   }
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
         padding: "12px 24px",
         backgroundColor: "#4285F4",
         color: "white",
         border: "none",
         borderRadius: 8,
         cursor: "pointer",
         fontSize: "14px",
         fontWeight: "500",
         boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
         transition: "background-color 0.2s"
       }}
       onMouseOver={(e) => e.target.style.backgroundColor = "#3367D6"}
       onMouseOut={(e) => e.target.style.backgroundColor = "#4285F4"}
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
           padding: 24,
           zIndex: 10,
           borderRadius: 12,
           boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
           width: 320,
           maxWidth: "calc(100vw - 40px)"
         }}
       >
         <h3 style={{ margin: "0 0 16px 0", color: "#333", fontSize: "18px" }}>Create Event</h3>
         <form onSubmit={handleCreateEvent}>
           <div style={{ marginBottom: 16 }}>
             <label style={{ display: "block", marginBottom: 4, fontSize: "14px", fontWeight: "500" }}>
               Event Name:
             </label>
             <input
               type="text"
               value={eventData.name}
               onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
               required
               style={{
                 width: "100%",
                 padding: "8px 12px",
                 border: "1px solid #ddd",
                 borderRadius: 4,
                 fontSize: "14px"
               }}
               placeholder="Enter event name"
             />
           </div>
          
           <div style={{ marginBottom: 16 }}>
             <label style={{ display: "block", marginBottom: 4, fontSize: "14px", fontWeight: "500" }}>
               Time:
             </label>
             <input
               type="datetime-local"
               value={eventData.time}
               onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
               required
               style={{
                 width: "100%",
                 padding: "8px 12px",
                 border: "1px solid #ddd",
                 borderRadius: 4,
                 fontSize: "14px"
               }}
             />
           </div>
          
           <div style={{ marginBottom: 20 }}>
             <label style={{ display: "block", marginBottom: 4, fontSize: "14px", fontWeight: "500" }}>
               Location:
             </label>
             <input
               ref={locationInputRef}
               type="text"
               value={eventData.location}
               onChange={handleLocationChange}
               placeholder="Start typing an address or place name..."
               required
               style={{
                 width: "100%",
                 padding: "8px 12px",
                 border: "1px solid #ddd",
                 borderRadius: 4,
                 fontSize: "14px"
               }}
             />
             <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: 4 }}>
               Select from dropdown suggestions for best results
             </small>
           </div>
          
           <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
             <button
               type="button"
               onClick={handleCancelForm}
               style={{
                 backgroundColor: "#f1f3f4",
                 color: "#5f6368",
                 padding: "8px 16px",
                 border: "none",
                 borderRadius: 4,
                 cursor: "pointer",
                 fontSize: "14px"
               }}
             >
               Cancel
             </button>
             <button
               type="submit"
               style={{
                 backgroundColor: "#34A853",
                 color: "white",
                 padding: "8px 16px",
                 border: "none",
                 borderRadius: 4,
                 cursor: "pointer",
                 fontSize: "14px",
                 fontWeight: "500"
               }}
             >
               Create Event
             </button>
           </div>
         </form>
       </div>
     )}
   </div>
 );
}


export default Maps;

