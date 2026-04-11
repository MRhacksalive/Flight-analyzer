import React, { useState } from 'react';
import axios from 'axios';
import FlightMap from '../components/FlightMap';
import './Dashboard.css';

export default function Dashboard() {
  const [flightNumber, setFlightNumber] = useState('');
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/flights/${flightNumber}`
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching flight data');
    }
  };

  return (
    <div className="container">
      <h1 className="title">✈️ Flight Tracker</h1>

      <div className="search-box">
        <input
          placeholder="Enter Flight (e.g. AI)"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
        />
        <button onClick={fetchData}>Track</button>
      </div>

      {data.length > 0 && <FlightMap flights={data} />}

      <div className="cards">
        {data.map((flight, index) => (
          <div key={index} className="card">
            <p><b>{flight.callsign}</b></p>
            <p>{flight.country}</p>
            <p>📍 {flight.latitude}, {flight.longitude}</p>
            <p>🛫 Alt: {Math.round(flight.altitude)}</p>
            <p>⚡ Speed: {Math.round(flight.velocity)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}