import { Polyline } from "react-leaflet";

function getCurve(start, end) {
  const midLat = (start[0] + end[0]) / 2 + 3;
  const midLng = (start[1] + end[1]) / 2;

  return [start, [midLat, midLng], end];
}

export default function FlightPath({ start, end }) {
  const path = getCurve(start, end);

  return (
    <Polyline
      positions={path}
      pathOptions={{
        color: "#00f7ff",
        weight: 4,
        opacity: 0.9,
      }}
    />
  );
}