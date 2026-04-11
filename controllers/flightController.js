const axios = require('axios');

exports.getFlightData = async (req, res) => {
  try {
    const { flightNumber } = req.params;

    const response = await axios.get(
      'https://opensky-network.org/api/states/all'
    );

    const states = response.data.states || [];

    // Filter flights by callsign (flight number)
    const filtered = states
      .filter((flight) =>
        flight[1] && flight[1].trim().includes(flightNumber.toUpperCase())
      )
      .map((flight) => ({
        icao24: flight[0],
        callsign: flight[1]?.trim(),
        country: flight[2],
        longitude: flight[5],
        latitude: flight[6],
        altitude: flight[7],
        velocity: flight[9],
      }));

    res.json(filtered);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch OpenSky data' });
  }
};
