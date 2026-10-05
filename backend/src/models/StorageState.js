const mongoose = require('mongoose');

const StorageStateSchema = new mongoose.Schema({
  timestamp: { type: String, default: () => new Date().toISOString() },
  tankId: { type: String, default: 'TANK_PRIMARY_01' },
  capacityLiters: { type: Number, default: 1000.0 },
  currentLevelLiters: { type: Number, required: true },
  fillPercentage: { type: Number, required: true },
  temperatureC: { type: Number, default: 25.0 },
  storageAgeHours: { type: Number, default: 0.0 },
  deteriorationIndex: { type: Number, default: 0.0 },
  deteriorationStatus: { type: String, default: 'FRESH' },
  stagnationStatus: { type: String, default: 'NORMAL' },
  shelfLifeStatus: { type: String, default: 'FRESH' },
  recommendedAction: { type: String, default: 'CONTINUE_MONITORING' },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('StorageState', StorageStateSchema);
