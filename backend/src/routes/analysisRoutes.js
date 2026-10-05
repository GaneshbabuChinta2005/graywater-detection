const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const path = require('path');
const {
  analyzeSample,
  analyzeBatch,
  getLatestAnalysis,
  getAnalysisHistory,
  getAnalysisById
} = require('../controllers/analysisController');
const { validateWaterSample } = require('../middleware/validate');

const upload = multer({ dest: path.join(os.tmpdir(), 'greywater_uploads') });

router.get('/latest', getLatestAnalysis);
router.get('/history', getAnalysisHistory);
router.get('/:id', getAnalysisById);
router.post('/', validateWaterSample, analyzeSample);
router.post('/batch', upload.single('file'), analyzeBatch);

module.exports = router;
