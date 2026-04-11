import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function FlightChart({ data }) {
  return (
    <div style={{ marginTop: 40 }}>
      <h2>Delay Trend</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="delay" stroke="#38bdf8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}