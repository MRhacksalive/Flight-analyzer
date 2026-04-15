import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

export default function PlaneMarker({ position, flightData }) {
  if (!position || isNaN(position[0]) || isNaN(position[1])) return null;
  if (!flightData) return null;

  const rotation = flightData.heading || 0;

  const icon = L.divIcon({
    html: `<div style="
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 42, 42, 0.9);
      border: 2px solid #ff0000;
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(255, 42, 42, 0.8);
      transform: rotate(${rotation}deg);
      transition: transform 0.5s linear;
    ">
      <span style="font-size: 20px;">✈️</span>
    </div>`,
    className: "plane-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });

  const altitudeKm = (flightData.altitude / 1000).toFixed(2);
  const speedKmh = Math.round(flightData.velocity);
  const lat = flightData.latitude.toFixed(4);
  const lon = flightData.longitude.toFixed(4);

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div style={{ color: "#000", fontWeight: "bold", fontSize: "12px", minWidth: "200px" }}>
          <div style={{ fontSize: "14px", marginBottom: "8px", color: "#ff2a2a" }}>
            ✈️ {flightData.callsign}
          </div>
          <div style={{ marginBottom: "6px", paddingBottom: "6px", borderBottom: "1px solid #ccc" }}>
            <strong>Country:</strong> {flightData.country}
          </div>
          <div style={{ marginBottom: "6px" }}>
            <strong>Altitude:</strong> {altitudeKm} km ({Math.round(flightData.altitude)} m)
          </div>
          <div style={{ marginBottom: "6px" }}>
            <strong>Speed:</strong> {speedKmh} km/h
          </div>
          <div style={{ marginBottom: "6px" }}>
            <strong>Heading:</strong> {Math.round(flightData.heading || 0)}°
          </div>
          <div style={{ marginBottom: "6px", paddingBottom: "6px", borderBottom: "1px solid #ccc" }}>
            <strong>Location:</strong> {lat}° N, {lon}° E
          </div>
          <div style={{ fontSize: "11px", color: "#666", marginTop: "6px" }}>
            ICAO: {flightData.icao24}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}