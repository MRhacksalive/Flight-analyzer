import React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✈️ Custom airplane icon
const planeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/34/34627.png',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export default function FlightMap({ flights }) {
  const center = [20, 77]; // India center

  return (
    <div
      style={{
        marginTop: 20,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      }}
    >
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '450px', width: '100%' }}
      >
        {/* 🌍 Dark themed tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {flights.map((flight, index) => {
          if (!flight.latitude || !flight.longitude) return null;

          return (
            <Marker
              key={index}
              position={[flight.latitude, flight.longitude]}
              icon={planeIcon}
            >
              <Popup>
                <div style={{ color: '#111' }}>
                  <h3>✈️ {flight.callsign}</h3>
                  <p><b>Country:</b> {flight.country}</p>
                  <p><b>Altitude:</b> {Math.round(flight.altitude)}</p>
                  <p><b>Speed:</b> {Math.round(flight.velocity)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}