const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  analysisId: { type: String, required: true, index: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  source: { type: String, required: true },
  inputFeatures: { type: Object, required: true },
  predictedClass: { type: Number, required: true },
  predictedRoute: { type: String, required: true },
  confidence: { type: Number, required: true },
  probabilities: { type: Object, default: {} },
  anomalyStatus: { type: String, default: 'NORMAL' },
  anomalyScore: { type: Number, default: 0.0 },
  safetyStatus: { type: String, default: 'SAFE_FOR_MODEL_REVIEW' },
  weatherStatus: { type: String, default: 'LIVE' },
  storageStatus: { type: String, default: 'FRESH' },
  finalRoute: { type: String, required: true },
  finalAction: { type: String, required: true },
  overrideApplied: { type: Boolean, default: false },
  reasonCodes: [{ type: String }],
  explanation: { type: String, default: '' },
  shapSummary: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
