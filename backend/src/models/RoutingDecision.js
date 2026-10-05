const mongoose = require('mongoose');

const RoutingDecisionSchema = new mongoose.Schema({
  timestamp: { type: String, default: () => new Date().toISOString() },
  source: { type: String, required: true },
  mlPredictedRoute: { type: String, required: true },
  confidence: { type: Number, required: true },
  finalRoute: { type: String, required: true },
  finalAction: { type: String, required: true },
  overrideApplied: { type: Boolean, default: false },
  reasonCodes: [{ type: String }],
  safetyStatus: { type: String, default: 'SAFE_FOR_MODEL_REVIEW' },
  decisionStatus: { type: String, default: 'APPROVED' },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('RoutingDecision', RoutingDecisionSchema);
