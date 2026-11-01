const express = require('express');
const router = express.Router();
const { getLatestRouting } = require('../controllers/routingController');

router.get('/latest', getLatestRouting);

module.exports = router;
