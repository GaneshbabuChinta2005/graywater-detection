const fs = require('fs');
const mlClient = require('../services/mlClient');
const Analysis = require('../models/Analysis');
const Report = require('../models/Report');
const memoryStore = require('../services/storageFallback');
const { isDBConnected } = require('../config/db');

exports.analyzeSample = async (req, res) => {
  try {
    const sample = req.body;
    
    // Forward to Python ML service
    const mlResponse = await mlClient.analyzeSample(sample);
    if (!mlResponse.success) {
      return res.status(503).json(mlResponse);
    }

    const data = mlResponse.data;

    // Persist analysis to MongoDB or memory store
    const record = {
      analysisId: data.analysis_id,
      timestamp: data.timestamp,
      source: data.source,
      inputFeatures: data.input_features,
      predictedClass: data.prediction.class_id,
      predictedRoute: data.prediction.class_name,
      confidence: data.prediction.confidence,
      probabilities: data.prediction.probabilities,
      anomalyStatus: data.anomaly.status,
      anomalyScore: data.anomaly.anomaly_score,
      safetyStatus: data.safety.status,
      weatherStatus: data.weather.status,
      storageStatus: data.storage.status,
      finalRoute: data.routing.final_route,
      finalAction: data.routing.final_action,
      overrideApplied: data.routing.override_applied,
      reasonCodes: data.routing.reason_codes,
      explanation: data.explanation.summary,
      shapSummary: data.shap
    };

    if (isDBConnected()) {
      try {
        await Analysis.create(record);
      } catch (dbErr) {
        memoryStore.saveAnalysis(record);
      }
    } else {
      memoryStore.saveAnalysis(record);
    }

    return res.json({
      success: true,
      analysis: data
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyzeBatch = async (req, res) => {
  try {
    let samples = [];

    // Case 1: File upload (CSV)
    if (req.file) {
      const csvContent = fs.readFileSync(req.file.path, 'utf8');
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        return res.status(400).json({ success: false, error: 'CSV file contains no data rows.' });
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, idx) => {
          const val = vals[idx];
          obj[h] = isNaN(Number(val)) || h === 'Greywater_Source' || h === 'greywater_source' ? val : Number(val);
        });
        if (obj.Greywater_Source || obj.greywater_source) {
          samples.push(obj);
        }
      }
      fs.unlinkSync(req.file.path); // Clean up temp file
    } else if (req.body.samples && Array.isArray(req.body.samples)) {
      // Case 2: JSON array
      samples = req.body.samples;
    } else {
      return res.status(400).json({
        success: false,
        error: 'INVALID_BATCH_INPUT',
        message: 'Must provide either a multipart CSV file upload or a JSON body with a "samples" array.'
      });
    }

    if (samples.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid sample rows could be parsed.' });
    }

    // Call Python ML batch endpoint
    const mlResponse = await mlClient.analyzeBatch(samples);
    if (!mlResponse.success) {
      return res.status(503).json(mlResponse);
    }

    const results = mlResponse.data;

    // Calculate aggregated audit statistics
    const routeCounts = {};
    let anomalyCount = 0;
    let overrideCount = 0;

    results.forEach(r => {
      const route = r.routing.final_route;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
      if (r.anomaly.is_anomaly) anomalyCount++;
      if (r.routing.override_applied) overrideCount++;
    });

    const anomalyRate = parseFloat(((anomalyCount / results.length) * 100).toFixed(2));
    const reportData = {
      title: `Batch Analysis Report (${results.length} Samples)`,
      reportType: 'BATCH_SUMMARY',
      generatedAt: new Date().toISOString(),
      totalSamples: results.length,
      routesDistribution: routeCounts,
      anomalyRate,
      safetyOverridesCount: overrideCount,
      summaryText: `Evaluated ${results.length} greywater samples. ${overrideCount} samples triggered deterministic safety overrides. Anomaly screening rate was ${anomalyRate}%.`
    };

    if (isDBConnected()) {
      try {
        await Report.create(reportData);
      } catch (e) {
        memoryStore.saveReport(reportData);
      }
    } else {
      memoryStore.saveReport(reportData);
    }

    return res.json({
      success: true,
      totalSamples: results.length,
      routesDistribution: routeCounts,
      anomalyRate,
      safetyOverridesCount: overrideCount,
      results
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLatestAnalysis = async (req, res) => {
  try {
    let latest = null;
    if (isDBConnected()) {
      try {
        latest = await Analysis.findOne().sort({ createdAt: -1 });
      } catch (e) {
        latest = null;
      }
    }
    if (!latest) {
      latest = memoryStore.getAnalyses(1)[0] || null;
    }
    return res.json({ success: true, analysis: latest });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAnalysisHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    let list = [];
    if (isDBConnected()) {
      try {
        list = await Analysis.find().sort({ createdAt: -1 }).limit(limit);
      } catch (e) {
        list = [];
      }
    }
    if (!list || list.length === 0) {
      list = memoryStore.getAnalyses(limit);
    }
    return res.json({ success: true, count: list.length, analyses: list });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAnalysisById = async (req, res) => {
  try {
    const id = req.params.id;
    let item = null;
    if (isDBConnected()) {
      try {
        item = await Analysis.findOne({ $or: [{ analysisId: id }, { _id: id }] });
      } catch (e) {
        item = null;
      }
    }
    if (!item) {
      item = memoryStore.getAnalysisById(id);
    }


    if (!item) {
      return res.status(404).json({ success: false, error: 'Analysis record not found.' });
    }

    // Try fetching live SHAP explanation from Python cache if available
    const shapRes = await mlClient.getExplanation(item.analysisId || id);
    if (shapRes.success) {
      item = { ...item.toObject ? item.toObject() : item, liveShap: shapRes.data };
    }

    return res.json({ success: true, analysis: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
