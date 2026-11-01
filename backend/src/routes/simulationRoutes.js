const express = require('express');
const router = express.Router();
const {
  startSimulation,
  stopSimulation,
  resetSimulation,
  stepSimulation
} = require('../controllers/simulationController');

router.post('/start', startSimulation);
router.post('/stop', stopSimulation);
router.post('/reset', resetSimulation);
router.post('/step', stepSimulation);

module.exports = router;
