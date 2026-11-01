const express = require('express');
const router = express.Router();
const { getLatestWeather } = require('../controllers/weatherController');

router.get('/latest', getLatestWeather);

module.exports = router;
