const express = require('express');
const router = express.Router();
const { getFlightData } = require('../controllers/flightController');

router.get('/:flightNumber', getFlightData);

module.exports = router;