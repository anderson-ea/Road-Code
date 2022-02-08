import React, { useState } from 'react'
import Navbar from './components/Navbar'
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow
} from '@react-google-maps/api';
import { nanoid } from "nanoid";
// import usePlacesAutocomplete, {
//   getGeocode,
//   getLatLng,
// } from 'use-places-autocomplete';
// import {
  
// }

const libraries = ["places"];

export default function App() {

  const weatherAPIKey = process.env.REACT_APP_WEATHER_API_KEY
  const [markers, setMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [center, setCenter] = useState({
    lat: 39.7392, 
    lng: -104.9903
  });  
  
  function placeMarker(event) {
    const lat = event.latLng.lat()
    const lon = event.latLng.lng()
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherAPIKey}&units=imperial`)
      .then(res => res.json())
      .then(data => setMarkers(prevMarkers => 
        [...prevMarkers, {
        id: nanoid(),
        lat: lat,
        lng: lon,
        data: data
      }]))
  }

  const theseAreMarkers = markers.map(marker => (
    <Marker
      key={marker.id} 
      position={{ lat: marker.lat, lng: marker.lng}}
      onClick={() => setSelectedMarker(marker)}
    /> 
    ))

  // Script to load API key and libraries used in API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
 
  if (loadError) return "Error loading";
  if (!isLoaded) return "Loading Map";
  
  // Map styling and settings
  const mapContainerStyle = {
    width: '840px',
    height: '100vh'
  };

  const options = {
    disableDefaultUI : true,
    zoomControl: true
  };

  return (
    <div className="container">
      <Navbar />
      <GoogleMap
        name="map"
        zoom={5}
        mapContainerStyle={mapContainerStyle}
        center={center}
        options={options}
        onClick={placeMarker}
      >
        {theseAreMarkers}
        {selectedMarker === null ? 
          null : 
          <InfoWindow 
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng}}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className='info--window'>
              <div className='info--top'>
                <h4>{selectedMarker.data.main.temp}°F</h4>
                <span role="img" aria-label="weather">🌤️</span>
              </div>
              <h4>{selectedMarker.data.weather[0].description}</h4>
            </div>
          </InfoWindow>}
      </GoogleMap>
    </div>
  );
}

// function Search() {
//   const { 
//     ready, 
//     value, 
//     suggestions: { status, data }, 
//     setValue, 
//     clearSuggestions
//   } = usePlacesAutocomplete()

//   return (
//     <input value={} onChange={}></input>
//   )
// };