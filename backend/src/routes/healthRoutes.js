const express = require('express');
const router = express.Router();
const mlClient = require('../services/mlClient');
const { getDBStatus } = require('../config/db');

router.get('/health', async (req, res) => {
  const mlStatus = await mlClient.getHealth();
  const dbStatus = getDBStatus();

  return res.json({
    status: 'ok',
    service: 'express-gateway',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    mlService: {
      status: mlStatus.success ? 'CONNECTED' : 'DISCONNECTED',
      modelsLoaded: mlStatus.data?.models_loaded || false,
      detail: mlStatus.data || mlStatus.message
    }
  });
});

module.exports = router;
