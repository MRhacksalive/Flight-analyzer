const axios = require("axios");

const AVIATIONSTACK_KEY = process.env.AVIATIONSTACK_KEY;

// Smart cache to reduce API calls and respect rate limits
const flightCache = new Map();
const CACHE_DURATION = 25000; // 25 seconds - reduces API hits

// Realistic demo flight routes (fallback)
const demoFlightRoutes = {
  'BA112': {
    callsign: 'BA112',
    country: 'United Kingdom',
    start: { lat: 51.5074, lng: -0.1278 },
    end: { lat: 40.6413, lng: -73.7781 },
    cruise_altitude: 35000,
    cruise_speed: 460,
  },
  'QTR8964': {
    callsign: 'QTR8964',
    country: 'Qatar',
    start: { lat: 25.2048, lng: 55.2708 },
    end: { lat: 28.5355, lng: 77.1018 },
    cruise_altitude: 38000,
    cruise_speed: 480,
  },
  'AIC101': {
    callsign: 'AIC101',
    country: 'India',
    start: { lat: 19.0176, lng: 72.8479 },
    end: { lat: 28.5355, lng: 77.1018 },
    cruise_altitude: 32000,
    cruise_speed: 440,
  },
  'DLH462': {
    callsign: 'DLH462',
    country: 'Germany',
    start: { lat: 52.3667, lng: 13.5000 },
    end: { lat: 48.3519, lng: 11.7752 },
    cruise_altitude: 29000,
    cruise_speed: 450,
  },
  'THY456': {
    callsign: 'THY456',
    country: 'Turkey',
    start: { lat: 41.2619, lng: 28.7480 },
    end: { lat: 40.6413, lng: -73.7781 },
    cruise_altitude: 37000,
    cruise_speed: 465,
  },
  'KLM320': {
    callsign: 'KLM320',
    country: 'Netherlands',
    start: { lat: 52.3086, lng: 4.7639 },
    end: { lat: 51.5074, lng: -0.1278 },
    cruise_altitude: 31000,
    cruise_speed: 440,
  },
  // Short codes also work
  'BA': {
    callsign: 'BA112',
    country: 'United Kingdom',
    start: { lat: 51.5074, lng: -0.1278 },
    end: { lat: 40.6413, lng: -73.7781 },
    cruise_altitude: 35000,
    cruise_speed: 460,
  },
  'QTR': {
    callsign: 'QTR8964',
    country: 'Qatar',
    start: { lat: 25.2048, lng: 55.2708 },
    end: { lat: 28.5355, lng: 77.1018 },
    cruise_altitude: 38000,
    cruise_speed: 480,
  },
  'AIC': {
    callsign: 'AIC101',
    country: 'India',
    start: { lat: 19.0176, lng: 72.8479 },
    end: { lat: 28.5355, lng: 77.1018 },
    cruise_altitude: 32000,
    cruise_speed: 440,
  },
  'DLH': {
    callsign: 'DLH462',
    country: 'Germany',
    start: { lat: 52.3667, lng: 13.5000 },
    end: { lat: 48.3519, lng: 11.7752 },
    cruise_altitude: 29000,
    cruise_speed: 450,
  },
  'THY': {
    callsign: 'THY456',
    country: 'Turkey',
    start: { lat: 41.2619, lng: 28.7480 },
    end: { lat: 40.6413, lng: -73.7781 },
    cruise_altitude: 37000,
    cruise_speed: 465,
  },
  'KLM': {
    callsign: 'KLM320',
    country: 'Netherlands',
    start: { lat: 52.3086, lng: 4.7639 },
    end: { lat: 51.5074, lng: -0.1278 },
    cruise_altitude: 31000,
    cruise_speed: 440,
  },
};

// Generate realistic demo data based on current time (updates every few seconds)
function getDemoFlightData(flightCode) {
  const route = demoFlightRoutes[flightCode];
  if (!route) return null;

  const now = Date.now();
  const cycleTime = 180000; // 3 minute cycle for demo
  const progress = (now % cycleTime) / cycleTime;

  // Smooth sine wave interpolation
  const easeProgress = Math.sin(progress * Math.PI);

  // Position calculation
  const lat = route.start.lat + (route.end.lat - route.start.lat) * easeProgress;
  const lng = route.start.lng + (route.end.lng - route.start.lng) * easeProgress;

  // Altitude simulation
  let altitude;
  if (progress < 0.15) {
    altitude = 2000 + (route.cruise_altitude - 2000) * (progress / 0.15);
  } else if (progress > 0.85) {
    altitude = route.cruise_altitude - (route.cruise_altitude - 2000) * ((progress - 0.85) / 0.15);
  } else {
    altitude = route.cruise_altitude;
  }

  const speed = route.cruise_speed + Math.sin(progress * Math.PI * 4) * 25;
  const heading = Math.atan2(route.end.lng - route.start.lng, route.end.lat - route.start.lat) * (180 / Math.PI);

  return {
    callsign: route.callsign,
    country: route.country,
    latitude: lat,
    longitude: lng,
    altitude: Math.round(altitude),
    velocity: Math.round(speed),
    heading: (heading + 360) % 360,
    icao24: flightCode.padEnd(6, '0'),
    _isDemoData: true, // Mark as demo
  };
}

if (!AVIATIONSTACK_KEY) {
  console.warn("⚠️ WARNING: AVIATIONSTACK_KEY not found in .env file!");
}

exports.getFlightData = async (req, res) => {
  try {
    const query = req.params.flightNumber.toUpperCase().trim();

    if (!query) {
      return res.status(400).json({ error: "Flight number required" });
    }

    console.log(`🔍 Searching for flight: ${query}`);

    // Check cache first
    const cached = flightCache.get(query);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 Cache hit: ${query}`);
      return res.json(cached.data);
    }

    // Try REAL API first
    try {
      console.log(`🌐 Trying AviationStack API...`);
      
      const response = await axios.get(
        "https://api.aviationstack.com/v1/flights",
        {
          timeout: 8000,
          params: {
            access_key: AVIATIONSTACK_KEY,
            flight_iata: query,
          },
        }
      );

      const flights = response.data.data || [];

      // Find a flight with valid live data
      for (const flight of flights) {
        if (
          flight.live &&
          flight.live.latitude &&
          flight.live.longitude &&
          flight.live.latitude !== 0 &&
          flight.live.longitude !== 0
        ) {
          const flightData = {
            callsign: flight.flight?.iata || flight.flight?.icao || query,
            country: flight.airline?.country_name || flight.airline?.name || "Unknown",
            latitude: parseFloat(flight.live.latitude),
            longitude: parseFloat(flight.live.longitude),
            altitude: flight.live.altitude || 0,
            velocity: flight.live.speed_horizontal || 0,
            heading: flight.live.direction || 0,
            icao24: flight.aircraft?.icao24 || "UNKNOWN",
            _isDemoData: false, // Real data
          };

          // Cache it
          flightCache.set(query, {
            data: flightData,
            timestamp: Date.now(),
          });

          console.log(`✅ REAL DATA: ${flightData.callsign} at [${flightData.latitude.toFixed(4)}, ${flightData.longitude.toFixed(4)}]`);
          return res.json(flightData);
        }
      }

      // API succeeded but no flight data found
      console.log(`⚠️ API OK but no live data for ${query} - trying demo...`);
      const demoData = getDemoFlightData(query);
      if (demoData) {
        console.log(`📺 DEMO DATA: ${demoData.callsign} (API had no matches)`);
        return res.json(demoData);
      }

      return res.json({
        error: `Flight "${query}" not found. Try: BA, BA112, QTR, QTR8964, AIC, AIC101, DLH, DLH462, THY, THY456, KLM, KLM320`,
      });
    } catch (apiErr) {
      console.error(`❌ API Error: ${apiErr.code || apiErr.status} - Rate Limited or Offline`);

      // API failed (rate limited, offline, etc) - use demo data as fallback
      console.log(`⏸️ FALLBACK TO DEMO DATA (API unavailable)`);
      const demoData = getDemoFlightData(query);
      
      if (demoData) {
        // Mark it as demo data so frontend can show warning
        demoData._isDemoData = true;
        demoData._demoReason = "Real-time API not available - showing simulated flight path";
        console.log(`📺 DEMO: ${demoData.callsign} (updating every 3 minutes)`);
        return res.json(demoData);
      }

      return res.json({
        error: `Flight "${query}" not found. Demo flights: BA, QTR, AIC, DLH, THY, KLM (+ full codes like BA112)`,
      });
    }
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};