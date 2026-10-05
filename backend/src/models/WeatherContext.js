const mongoose = require('mongoose');

const WeatherContextSchema = new mongoose.Schema({
  timestamp: { type: String, default: () => new Date().toISOString() },
  temperatureC: { type: Number, default: 25.0 },
  humidityPercent: { type: Number, default: 55.0 },
  rainfallMm: { type: Number, default: 0.0 },
  precipitationProbability: { type: Number, default: 0.0 },
  weatherCondition: { type: String, default: 'Clear' },
  weatherStatus: { type: String, default: 'LIVE' },
  irrigationAction: { type: String, default: 'ALLOW_ROUTE' },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('WeatherContext', WeatherContextSchema);
