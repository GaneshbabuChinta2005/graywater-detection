const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  reportType: { type: String, enum: ['BATCH_SUMMARY', 'DAILY_AUDIT', 'SAFETY_INCIDENT'], default: 'BATCH_SUMMARY' },
  generatedAt: { type: String, default: () => new Date().toISOString() },
  totalSamples: { type: Number, default: 0 },
  routesDistribution: { type: Object, default: {} },
  anomalyRate: { type: Number, default: 0.0 },
  safetyOverridesCount: { type: Number, default: 0 },
  summaryText: { type: String, default: '' },
  sampleRecords: [{ type: Object }],
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Report', ReportSchema);
