const mlClient = require('../services/mlClient');
const Analysis = require('../models/Analysis');
const Telemetry = require('../models/Telemetry');
const memoryStore = require('../services/storageFallback');
const { isDBConnected } = require('../config/db');

exports.getDashboardSummary = async (req, res) => {
  try {
    // 1. Fetch latest analysis
    let latestAnalysis = null;
    if (isDBConnected()) {
      try {
        latestAnalysis = await Analysis.findOne().sort({ createdAt: -1 });
      } catch (e) {
        latestAnalysis = null;
      }
    }
    if (!latestAnalysis) {
      latestAnalysis = memoryStore.getAnalyses(1)[0] || null;
    }

    // 2. Fetch latest telemetry & trend history
    let telemetryHistory = [];
    if (isDBConnected()) {
      try {
        telemetryHistory = await Telemetry.find().sort({ createdAt: -1 }).limit(24);
      } catch (e) {
        telemetryHistory = [];
      }
    }
    if (!telemetryHistory || telemetryHistory.length === 0) {
      telemetryHistory = memoryStore.getTelemetryHistory(24);
    }

    const latestTelemetry = telemetryHistory[0] || null;


    // 3. Fetch context from ML service or fallback
    const weatherRes = await mlClient.getWeatherCurrent();
    const storageRes = await mlClient.getStorageCurrent();
    const mlHealth = await mlClient.getHealth();

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      systemHealth: {
        nodeApi: 'CONNECTED',
        pythonMl: mlHealth.success ? 'CONNECTED' : 'DISCONNECTED',
        modelsLoaded: mlHealth.data?.models_loaded || false,
        weatherStatus: weatherRes.data?.weather_status || 'LIVE'
      },
      summary: {
        source: latestTelemetry?.greywater_source || latestAnalysis?.source || 'Bathroom',
        predictedRoute: latestAnalysis?.predictedRoute || 'Restricted Irrigation',
        confidence: latestAnalysis?.confidence || 0.94,
        finalRoute: latestAnalysis?.finalRoute || 'Restricted Irrigation',
        finalAction: latestAnalysis?.finalAction || 'ALLOW_ROUTE',
        anomalyStatus: latestAnalysis?.anomalyStatus || 'NORMAL',
        anomalyScore: latestAnalysis?.anomalyScore || 0.04,
        safetyStatus: latestAnalysis?.safetyStatus || 'SAFE_FOR_MODEL_REVIEW',
        tankLevelLiters: storageRes.data?.current_level_liters || latestTelemetry?.tank_level_L || 250.0,
        tankCapacityLiters: storageRes.data?.capacity_liters || 1000.0,
        fillPercentage: storageRes.data?.fill_percentage || 25.0,
        storageAgeHours: storageRes.data?.storage_age_hours || 0.0,
        weatherCondition: weatherRes.data?.weather_condition || 'Clear',
        rainfallMm: weatherRes.data?.rainfall_mm || 0.0,
        irrigationAction: weatherRes.data?.irrigation_action || 'ALLOW_ROUTE'
      },
      latestTelemetry,
      telemetryTrends: telemetryHistory.slice().reverse(),
      latestAnalysis
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
