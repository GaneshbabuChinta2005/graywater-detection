/**
 * Places Controller - Andhra Pradesh Water Quality Monitoring
 * Handles endpoints for regional water quality tracking across 10 Andhra Pradesh locations.
 * Completely decoupled from greywater ML models and training datasets.
 */

const Location = require('../models/Location');
const MonitoringStation = require('../models/MonitoringStation');
const WaterQualityMeasurement = require('../models/WaterQualityMeasurement');
const memoryStore = require('../services/storageFallback');
const { isDBConnected } = require('../config/db');

/**
 * GET /api/places
 * List all 10 Andhra Pradesh locations with aggregated station count and latest date.
 */
exports.getPlaces = async (req, res) => {
  try {
    const { search, district, availability, sort } = req.query;

    // Always fetch through unified memoryStore or Mongo
    const places = memoryStore.getPlaces({ search, district, availability, sort });

    return res.json({
      success: true,
      count: places.length,
      places
    });
  } catch (error) {
    console.error('[PlacesController:getPlaces] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/places/:placeId
 * Get comprehensive metadata for a specific location.
 */
exports.getPlaceById = async (req, res) => {
  try {
    const { placeId } = req.params;
    const place = memoryStore.getPlaceById(placeId);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: `Location '${placeId}' not found. Please select from the 10 authorized Andhra Pradesh locations.`
      });
    }

    return res.json({
      success: true,
      place
    });
  } catch (error) {
    console.error('[PlacesController:getPlaceById] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/places/:placeId/stations
 * Get monitoring stations for a specific location.
 */
exports.getPlaceStations = async (req, res) => {
  try {
    const { placeId } = req.params;
    const stations = memoryStore.getStationsByPlaceId(placeId);

    return res.json({
      success: true,
      count: stations.length,
      stations
    });
  } catch (error) {
    console.error('[PlacesController:getPlaceStations] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/places/:placeId/water-quality
 * Get latest measurements for the 5 parameters (TSS, BOD, COD, pH, Faecal Coliform).
 * Optional query: station_id.
 */
exports.getPlaceWaterQuality = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { station_id } = req.query;

    const place = memoryStore.getPlaceById(placeId);
    if (!place) {
      return res.status(404).json({ success: false, error: `Location '${placeId}' not found.` });
    }

    const waterQuality = memoryStore.getWaterQuality(placeId, station_id || null);

    return res.json({
      success: true,
      location_id: placeId,
      station_id: station_id || 'all_stations',
      water_quality: waterQuality
    });
  } catch (error) {
    console.error('[PlacesController:getPlaceWaterQuality] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/places/:placeId/history
 * Get time-series historical readings for a parameter.
 * Query params: parameter, station_id, range (7d, 30d, 90d, 1y, all).
 */
exports.getPlaceHistory = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { parameter = 'BOD', station_id = null, range = 'all' } = req.query;

    const history = memoryStore.getPlaceHistory(placeId, {
      parameter,
      stationId: station_id,
      range
    });

    return res.json({
      success: true,
      location_id: placeId,
      parameter,
      station_id: station_id || 'all_stations',
      range,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('[PlacesController:getPlaceHistory] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/places/compare
 * Compare 2 or more locations side-by-side.
 * Query param: location_ids (comma-separated, e.g. "visakhapatnam,vijayawada").
 */
exports.comparePlaces = async (req, res) => {
  try {
    const { location_ids } = req.query;
    if (!location_ids) {
      return res.status(400).json({
        success: false,
        error: 'Please provide location_ids query parameter (e.g. ?location_ids=visakhapatnam,vijayawada)'
      });
    }

    const ids = location_ids.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 valid locations must be selected for comparison.'
      });
    }

    const comparison = memoryStore.comparePlaces(ids);

    return res.json({
      success: true,
      comparison
    });
  } catch (error) {
    console.error('[PlacesController:comparePlaces] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/places/:placeId/export
 * Download CSV of historical measurements for a location.
 */
exports.exportPlaceCsv = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { station_id } = req.query;

    const place = memoryStore.getPlaceById(placeId);
    if (!place) {
      return res.status(404).json({ success: false, error: 'Location not found.' });
    }

    const measurements = memoryStore.waterQualityMeasurements.filter(m => {
      if (m.location_id.toLowerCase() !== placeId.toLowerCase()) return false;
      if (station_id && m.station_id !== station_id) return false;
      return true;
    });

    // Generate CSV string
    const headers = ['Station_ID', 'Location_ID', 'Parameter', 'Value', 'Unit', 'Sample_Date', 'Data_Source'];
    const rows = measurements.map(m => [
      `"${m.station_id}"`,
      `"${m.location_id}"`,
      `"${m.parameter_name}"`,
      m.value,
      `"${m.unit}"`,
      `"${new Date(m.sample_date).toISOString().split('T')[0]}"`,
      `"${m.data_source}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${placeId}_water_quality_${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    console.error('[PlacesController:exportPlaceCsv] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/places/import
 * Import verified water quality measurements from CSV payload or JSON array.
 */
exports.importPlaceMeasurements = async (req, res) => {
  try {
    let records = [];

    if (Array.isArray(req.body)) {
      records = req.body;
    } else if (req.body.records && Array.isArray(req.body.records)) {
      records = req.body.records;
    } else if (req.body.csv_text) {
      // Basic CSV line parser
      const lines = req.body.csv_text.trim().split('\n');
      const headerLine = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 5) {
          records.push({
            station_id: cols[headerLine.indexOf('station_id')] || cols[0],
            location_id: cols[headerLine.indexOf('location_id')] || cols[1],
            parameter_name: cols[headerLine.indexOf('parameter')] || cols[headerLine.indexOf('parameter_name')] || cols[2],
            value: cols[headerLine.indexOf('value')] || cols[3],
            unit: cols[headerLine.indexOf('unit')] || cols[4],
            sample_date: cols[headerLine.indexOf('sample_date')] || cols[5],
            data_source: cols[headerLine.indexOf('data_source')] || 'Authorized Manual Import'
          });
        }
      }
    }

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid records supplied. Please provide an array of records or csv_text.'
      });
    }

    const result = memoryStore.importMeasurements(records);

    return res.json({
      success: result.success,
      imported_count: result.imported_count,
      errors_count: result.errors_count,
      errors: result.errors
    });
  } catch (error) {
    console.error('[PlacesController:importPlaceMeasurements] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

