const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');

// Regional Water Quality Monitoring Endpoints
router.get('/', placesController.getPlaces);
router.get('/compare', placesController.comparePlaces);
router.get('/:placeId', placesController.getPlaceById);
router.get('/:placeId/stations', placesController.getPlaceStations);
router.get('/:placeId/water-quality', placesController.getPlaceWaterQuality);
router.get('/:placeId/history', placesController.getPlaceHistory);
router.get('/:placeId/export', placesController.exportPlaceCsv);
router.post('/import', placesController.importPlaceMeasurements);

module.exports = router;

