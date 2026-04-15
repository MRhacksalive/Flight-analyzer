import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import { useState, useEffect } from "react";
import PlaneMarker from "../components/PlaneMarker";
import "leaflet/dist/leaflet.css";
import "./Dashboard.css";

function FixMap() {
  const map = useMap();
  setTimeout(() => map.invalidateSize(), 100);
  return null;
}

export default function Dashboard() {
  const [flightNo, setFlightNo] = useState("");
  const [position, setPosition] = useState([20, 77]);
  const [flightData, setFlightData] = useState(null);
  const [trail, setTrail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasPosition, setHasPosition] = useState(false);
  const [error, setError] = useState(null);

  const fetchFlight = async () => {
    try {
      if (!flightNo.trim()) return;

      setLoading(true);
      setHasSearched(true);
      setError(null);

      const res = await fetch(
        `http://localhost:5000/api/flights/${flightNo}`
      );
      const data = await res.json();

      // Check if API returned an error
      if (data.error) {
        setError(data.error);
        setFlightData(null);
        setTrail([]);
        return;
      }

      // Check if we have valid data
      if (!data.callsign || !data.latitude || !data.longitude || isNaN(data.latitude) || isNaN(data.longitude)) {
        setError("Invalid flight data received");
        setFlightData(null);
        setTrail([]);
        return;
      }

      const { latitude, longitude } = data;

      if (!hasPosition) {
        setPosition([latitude, longitude]);
        setHasPosition(true);
      } else {
        setPosition((prev) => [
          prev[0] + (latitude - prev[0]) * 0.3,
          prev[1] + (longitude - prev[1]) * 0.3,
        ]);
      }

      setFlightData(data);
      setError(null);

      setTrail((prev) => {
        const updated = [...prev, [latitude, longitude]];
        return updated.slice(-20);
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch flight data. Check server connection.");
      setFlightData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!flightData) return;
    const interval = setInterval(fetchFlight, 5000);
    return () => clearInterval(interval);
  }, [flightData, flightNo]);

  return (
    <div className="dashboard">
      {/* PANEL */}
      <div className="panel">
        <h1 className="title">Flight Tracker</h1>

        <div className="search-box">
          <input
            value={flightNo}
            onChange={(e) => setFlightNo(e.target.value)}
            placeholder="Enter callsign (QTR8964)"
          />

          <button onClick={fetchFlight}>
            {loading ? <span className="dots">Tracking</span> : "Track"}
          </button>
        </div>

        {!flightData && hasSearched && !loading && (
          <p className={error ? "status error" : "status"}>{error || "No live tracking"}</p>
        )}

        {!hasSearched && (
          <p className="hint">Try: AIC • QTR • UAE • BAW</p>
        )}

        {flightData && (
          <div className="info">
            <h2>{flightData.callsign}</h2>
            <p className="country-text">{flightData.country}</p>
            
            {/* Show demo data warning */}
            {flightData._isDemoData && (
              <div className="demo-warning">
                <span className="demo-icon">📺</span>
                <span className="demo-text">{flightData._demoReason}</span>
              </div>
            )}
            
            <div className="data-section">
              <div className="data-row">
                <span className="data-label">Altitude:</span>
                <span className="data-value">{(flightData.altitude / 1000).toFixed(2)} km</span>
              </div>
              <div className="data-row">
                <span className="data-label">Speed:</span>
                <span className="data-value">{Math.round(flightData.velocity)} km/h</span>
              </div>
              <div className="data-row">
                <span className="data-label">Heading:</span>
                <span className="data-value">{Math.round(flightData.heading || 0)}°</span>
              </div>
              <div className="data-row">
                <span className="data-label">Position:</span>
                <span className="data-value">{flightData.latitude.toFixed(4)}° N</span>
              </div>
              <div className="data-row">
                <span className="data-label"></span>
                <span className="data-value">{flightData.longitude.toFixed(4)}° E</span>
              </div>
              <div className="data-row">
                <span className="data-label">ICAO24:</span>
                <span className="data-value" style={{ fontSize: '11px' }}>{flightData.icao24}</span>
              </div>
            </div>

            <div className="trail-info">
              <span>🛫 Trail Points: {trail.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* MAP */}
      <MapContainer
        center={position}
        zoom={5}
        className="map"
      >
        <FixMap />

        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        <PlaneMarker position={position} flightData={flightData} />

        {trail.length > 1 && (
          <Polyline
            positions={trail}
            pathOptions={{
              color: "#ff2a2a",
              weight: 3,
              opacity: 0.9,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}