const Telemetry = require('../models/Telemetry');
const memoryStore = require('../services/storageFallback');
const mlClient = require('../services/mlClient');
const { isDBConnected } = require('../config/db');

exports.getLatestTelemetry = async (req, res) => {
  try {
    let latest = null;
    if (isDBConnected()) {
      try {
        latest = await Telemetry.findOne().sort({ createdAt: -1 });
      } catch (e) {
        latest = null;
      }
    }
    if (!latest) {
      latest = memoryStore.getLatestTelemetry();
    }

    return res.json({ success: true, telemetry: latest });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTelemetryHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    let list = [];
    if (isDBConnected()) {
      try {
        list = await Telemetry.find().sort({ createdAt: -1 }).limit(limit);
      } catch (e) {
        list = [];
      }
    }
    if (!list || list.length === 0) {
      list = memoryStore.getTelemetryHistory(limit);
    }


    return res.json({
      success: true,
      count: list.length,
      telemetry: list.slice().reverse()
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
