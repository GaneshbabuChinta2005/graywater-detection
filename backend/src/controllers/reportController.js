const Report = require('../models/Report');
const memoryStore = require('../services/storageFallback');
const { isDBConnected } = require('../config/db');

exports.getReports = async (req, res) => {
  try {
    let list = [];
    if (isDBConnected()) {
      try {
        list = await Report.find().sort({ createdAt: -1 });
      } catch (e) {
        list = [];
      }
    }
    if (!list || list.length === 0) {
      list = memoryStore.getReports(20);
    }
    return res.json({ success: true, count: list.length, reports: list });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

