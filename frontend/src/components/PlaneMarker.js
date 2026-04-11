import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const planeIcon = new L.Icon({
  iconUrl: "/plane.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export default function PlaneMarker({ position, flightData }) {
  return (
    <Marker position={position} icon={planeIcon}>
      <Popup>
        {flightData ? (
          <div>
            ✈️ <strong>{flightData.callsign}</strong> <br />
            Speed: {Math.round(flightData.speed || 0)} km/h <br />
            Altitude: {Math.round(flightData.altitude || 0)} m
          </div>
        ) : (
          "No flight data"
        )}
      </Popup>
    </Marker>
  );
}