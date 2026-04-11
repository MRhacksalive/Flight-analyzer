import { MapContainer, TileLayer } from "react-leaflet";
import { useState } from "react";
import PlaneMarker from "../components/PlaneMarker";
import "leaflet/dist/leaflet.css";
import "./Dashboard.css";

export default function Dashboard() {
  const [flightNo, setFlightNo] = useState("");
  const [position, setPosition] = useState([20, 77]);
  const [flightData, setFlightData] = useState(null);

  // 🔑 PUT YOUR API KEY HERE
  const API_KEY = "91e3efea2cb047fc37276c702ea01cda";

  const fetchFlight = async () => {
  try {
    const res = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${flightNo}`
    );

    const data = await res.json();
    console.log("API DATA:", data);

    if (!data.data || data.data.length === 0) {
      alert("Flight not found ❌ Try EK431, AI202, 6E202");
      return;
    }

    const flight = data.data.find((f) => f.live !== null);

    if (!flight) {
      alert("No live tracking available for this flight ❌");
      return;
    }

    const lat = flight.live.latitude;
    const lng = flight.live.longitude;

    setPosition([lat, lng]);

    setFlightData({
      callsign: flight.flight.iata,
      altitude: flight.live.altitude,
      speed: flight.live.speed_horizontal,
    });
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="dashboard">
      {/* PANEL */}
      <div className="panel">
         Flight Tracker

        <input
          type="text"
          value={flightNo}
          onChange={(e) => setFlightNo(e.target.value)}
          placeholder="Enter Flight (AI202)"
        />

        <button onClick={fetchFlight}>Track</button>

        <p>
          {flightData
            ? `Tracking: ${flightData.callsign}`
            : "Enter flight number"}
        </p>
      </div>

      {/* MAP */}
      <MapContainer center={position} zoom={5} className="map">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        <PlaneMarker position={position} flightData={flightData} />
      </MapContainer>
    </div>
  );
}