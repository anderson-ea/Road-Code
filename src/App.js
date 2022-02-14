import React, { useState, useRef, useCallback } from 'react'
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { nanoid } from "nanoid";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

const libraries = ["places"];

export default function App() {

  const weatherAPIKey = process.env.REACT_APP_WEATHER_API_KEY
  const [markers, setMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const mapRef = useRef()
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);
 
  const [center, setCenter] = useState({
    lat: 39.7392, 
    lng: -104.9903
  }); 
  
  // Places markers on map and fetches weather data based on marker lat/lng
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

  // Pan to selected location
  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(11);
  }, []);

  const theseAreMarkers = markers.map(marker => (
    <Marker
      key={marker.id} 
      position={{ lat: marker.lat, lng: marker.lng}}
      onClick={() => setSelectedMarker(marker)}
    /> 
    ))

  // Hook/Script to load API key and libraries used in API
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
      <Navbar panTo={panTo} />
      <GoogleMap
        id="map"
        zoom={7}
        mapContainerStyle={mapContainerStyle}
        center={center}
        options={options}
        onClick={placeMarker}
        onLoad={onMapLoad}
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

function Navbar({ panTo }) {

  const { 
    ready, 
    value, 
    suggestions: { status, data }, 
    setValue, 
    clearSuggestions
  } = usePlacesAutocomplete()

  function handleInput(event) {
    setValue(event.target.value)
  }

  async function handleSelect(address) {
    setValue(address, false)
    clearSuggestions()

    try {
      const results = await getGeocode({ address })
      const { lat, lng } = await getLatLng(results[0])
      panTo({ lat, lng })
    } catch(error) {
      alert(error)
    }
  }

  return (
    <nav className='nav--container'>
      <h2>Weather Where</h2>
      <div className='nav--start'>
        <Combobox onSelect={handleSelect}>
          <ComboboxInput 
            value={value} 
            onChange={handleInput} 
            placeholder="search"
            disabled={!ready}
          >
          </ComboboxInput>
          <ComboboxPopover>
            {status === "OK" && 
              data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
                ))}
          </ComboboxPopover>
        </Combobox>
      </div>
    </nav>
  )
}
