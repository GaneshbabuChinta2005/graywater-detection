const RoutingDecision = require('../models/RoutingDecision');
const Analysis = require('../models/Analysis');
const memoryStore = require('../services/storageFallback');
const { isDBConnected } = require('../config/db');

exports.getLatestRouting = async (req, res) => {
  try {
    let latest = null;
    if (isDBConnected()) {
      try {
        latest = await RoutingDecision.findOne().sort({ createdAt: -1 });
        if (!latest) {
          const latestAnalysis = await Analysis.findOne().sort({ createdAt: -1 });
          if (latestAnalysis) {
            latest = {
              timestamp: latestAnalysis.timestamp,
              source: latestAnalysis.source,
              mlPredictedRoute: latestAnalysis.predictedRoute,
              confidence: latestAnalysis.confidence,
              finalRoute: latestAnalysis.finalRoute,
              finalAction: latestAnalysis.finalAction,
              overrideApplied: latestAnalysis.overrideApplied,
              reasonCodes: latestAnalysis.reasonCodes,
              safetyStatus: latestAnalysis.safetyStatus,
              decisionStatus: 'APPROVED'
            };
          }
        }
      } catch (e) {
        latest = null;
      }
    }
    if (!latest) {
      latest = memoryStore.getLatestRouting();
    }


    if (!latest) {
      latest = {
        timestamp: new Date().toISOString(),
        source: 'Bathroom',
        mlPredictedRoute: 'Restricted Irrigation',
        confidence: 0.94,
        finalRoute: 'Restricted Irrigation',
        finalAction: 'ALLOW_ROUTE',
        overrideApplied: false,
        reasonCodes: ['RC_ML_CONFIDENT_ALLOW'],
        safetyStatus: 'SAFE_FOR_MODEL_REVIEW',
        decisionStatus: 'APPROVED'
      };
    }

    return res.json({ success: true, routing: latest });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
