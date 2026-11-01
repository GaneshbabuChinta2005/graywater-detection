const express = require('express');
const router = express.Router();
const { getLatestStorage } = require('../controllers/storageController');

router.get('/latest', getLatestStorage);

module.exports = router;
