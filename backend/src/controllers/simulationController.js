const mlClient = require('../services/mlClient');
const Telemetry = require('../models/Telemetry');
const Analysis = require('../models/Analysis');
const RoutingDecision = require('../models/RoutingDecision');
const memoryStore = require('../services/storageFallback');

exports.startSimulation = async (req, res) => {
  try {
    const mlRes = await mlClient.simulationStart();
    return res.json(mlRes);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.stopSimulation = async (req, res) => {
  try {
    const mlRes = await mlClient.simulationStop();
    return res.json(mlRes);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.resetSimulation = async (req, res) => {
  try {
    const mlRes = await mlClient.simulationReset();
    return res.json(mlRes);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.stepSimulation = async (req, res) => {
  try {
    const stepConfig = req.body || {};
    const mlRes = await mlClient.simulationStep(stepConfig);
    if (!mlRes.success) {
      return res.status(503).json(mlRes);
    }

    const { step, telemetry, analysis } = mlRes.data;

    // Persist Telemetry Step
    if (telemetry) {
      const telRecord = {
        ...telemetry,
        step: step || 0,
        createdAt: new Date()
      };
      try {
        await Telemetry.create(telRecord);
      } catch (e) {
        memoryStore.saveTelemetry(telRecord);
      }
    }

    // Persist Analysis
    if (analysis) {
      const anaRecord = {
        analysisId: analysis.analysis_id,
        timestamp: analysis.timestamp,
        source: analysis.source,
        inputFeatures: analysis.input_features,
        predictedClass: analysis.prediction.class_id,
        predictedRoute: analysis.prediction.class_name,
        confidence: analysis.prediction.confidence,
        probabilities: analysis.prediction.probabilities,
        anomalyStatus: analysis.anomaly.status,
        anomalyScore: analysis.anomaly.anomaly_score,
        safetyStatus: analysis.safety.status,
        weatherStatus: analysis.weather.status,
        storageStatus: analysis.storage.status,
        finalRoute: analysis.routing.final_route,
        finalAction: analysis.routing.final_action,
        overrideApplied: analysis.routing.override_applied,
        reasonCodes: analysis.routing.reason_codes,
        explanation: analysis.explanation.summary,
        shapSummary: analysis.shap
      };
      try {
        await Analysis.create(anaRecord);
      } catch (e) {
        memoryStore.saveAnalysis(anaRecord);
      }

      // Persist Routing Decision
      const routRecord = {
        timestamp: analysis.timestamp,
        source: analysis.source,
        mlPredictedRoute: analysis.prediction.class_name,
        confidence: analysis.prediction.confidence,
        finalRoute: analysis.routing.final_route,
        finalAction: analysis.routing.final_action,
        overrideApplied: analysis.routing.override_applied,
        reasonCodes: analysis.routing.reason_codes,
        safetyStatus: analysis.safety.status,
        decisionStatus: analysis.routing.decision_status
      };
      try {
        await RoutingDecision.create(routRecord);
      } catch (e) {
        memoryStore.saveRoutingDecision(routRecord);
      }
    }

    return res.json({
      success: true,
      step,
      telemetry,
      analysis
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
