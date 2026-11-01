/**
 * Graceful In-Memory Store Fallback for MongoDB
 * Ensures that if MongoDB server is unavailable, the application can still save and
 * query analysis records, telemetry history, reports, routing decisions, and
 * the Andhra Pradesh Places Regional Water Quality Monitoring data seamlessly.
 */

const {
  PREDEFINED_LOCATIONS,
  PREDEFINED_STATIONS,
  COMPLIANCE_REFERENCE_LIMITS,
  generatePredefinedMeasurements
} = require('../data/andhraPradeshWaterData');

class MemoryStore {
  constructor() {
    this.analyses = [];
    this.telemetry = [];
    this.routingDecisions = [];
    this.storageStates = [];
    this.weatherContexts = [];
    this.reports = [];
    this.users = [
      {
        _id: 'default_admin_01',
        name: 'System Administrator',
        email: 'admin@greywater.ai',
        role: 'ADMIN'
      }
    ];

    // Places Module In-Memory Collections
    this.locations = [];
    this.monitoringStations = [];
    this.waterQualityMeasurements = [];
    this.complianceLimits = COMPLIANCE_REFERENCE_LIMITS;

    this._seedInitialData();
    this._seedPlacesData();
  }

  _seedInitialData() {
    const sources = ['Bathroom', 'Kitchen', 'Laundry', 'Mixed'];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = new Date(now - i * 5 * 60 * 1000).toISOString();
      const src = sources[i % sources.length];
      const ph = 6.8 + (i % 5) * 0.2;
      const tur = 20.0 + (i % 8) * 15.0;
      const cod = 120.0 + (i % 6) * 60.0;
      const ecoli = src === 'Kitchen' ? 80000 : 1500;
      const tank = 250.0 + (20 - i) * 8.5;

      this.telemetry.push({
        _id: `tel_init_${i}`,
        timestamp: t,
        greywater_source: src,
        pH: parseFloat(ph.toFixed(2)),
        TEMP_C: 24.5,
        SAL_ppt: 0.35,
        TUR_NTU: parseFloat(tur.toFixed(1)),
        DS_mg_L: 280.0,
        TDS_mg_L: 310.0,
        TSS_mg_L: 45.0,
        COND_uS_cm: 540.0,
        DO_mg_L: 4.2,
        BOD_mg_L: 45.0,
        COD_mg_L: parseFloat(cod.toFixed(1)),
        NH4F_mg_L: 5.5,
        NO3_mg_L: 3.8,
        K_mg_L: 16.5,
        E_coli_CFU_100mL: ecoli,
        flow_rate_L_min: 14.5,
        tank_capacity_L: 1000.0,
        tank_level_L: parseFloat(Math.min(1000.0, tank).toFixed(1)),
        sensor_status: 'OK',
        event_name: 'normal',
        step: 20 - i,
        createdAt: new Date(now - i * 5 * 60 * 1000)
      });
    }

    this.reports.push({
      _id: 'rep_init_01',
      title: 'Baseline Greywater Operational Audit',
      reportType: 'DAILY_AUDIT',
      generatedAt: new Date(now - 3600000).toISOString(),
      totalSamples: 288,
      routesDistribution: {
        'Sewer Bypass': 42,
        'Bio-filtration': 86,
        'Restricted Irrigation': 118,
        'Indoor Reuse': 42
      },
      anomalyRate: 3.47,
      safetyOverridesCount: 14,
      summaryText: 'Nominal diurnal domestic greywater recycling cycle with 4.8% high-organic kitchen shocks bypassed to municipal sewer.'
    });
  }

  _seedPlacesData() {
    this.locations = PREDEFINED_LOCATIONS.map(loc => ({
      ...loc,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    this.monitoringStations = PREDEFINED_STATIONS.map(st => ({
      ...st,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    this.waterQualityMeasurements = generatePredefinedMeasurements();
    console.log(`[StorageFallback] Seeded ${this.locations.length} AP locations, ${this.monitoringStations.length} stations, and ${this.waterQualityMeasurements.length} water quality measurements.`);
  }

  // --- Greywater Fallback Methods ---

  saveAnalysis(doc) {
    const item = { ...doc, _id: doc.analysisId || `ana_${Date.now()}`, createdAt: new Date() };
    this.analyses.unshift(item);
    if (this.analyses.length > 500) this.analyses.pop();
    return item;
  }

  getAnalyses(limit = 50) {
    return this.analyses.slice(0, limit);
  }

  getAnalysisById(id) {
    return this.analyses.find(a => a.analysisId === id || a._id === id);
  }

  saveTelemetry(doc) {
    const item = { ...doc, _id: `tel_${Date.now()}`, createdAt: new Date() };
    this.telemetry.unshift(item);
    if (this.telemetry.length > 500) this.telemetry.pop();
    return item;
  }

  getTelemetryHistory(limit = 100) {
    return this.telemetry.slice(0, limit);
  }

  getLatestTelemetry() {
    return this.telemetry[0] || null;
  }

  saveRoutingDecision(doc) {
    const item = { ...doc, _id: `rout_${Date.now()}`, createdAt: new Date() };
    this.routingDecisions.unshift(item);
    if (this.routingDecisions.length > 500) this.routingDecisions.pop();
    return item;
  }

  getLatestRouting() {
    return this.routingDecisions[0] || null;
  }

  saveReport(doc) {
    const item = { ...doc, _id: `rep_${Date.now()}`, createdAt: new Date() };
    this.reports.unshift(item);
    return item;
  }

  getReports(limit = 20) {
    return this.reports.slice(0, limit);
  }

  // --- Places Module Fallback Methods ---

  /**
   * Evaluates compliance against configured CPCB / Environmental standards.
   */
  evaluateCompliance(parameter, value) {
    if (value === null || value === undefined || isNaN(value)) {
      return { status: 'Data Not Available', class: 'muted' };
    }
    const limit = this.complianceLimits[parameter];
    if (!limit) {
      return { status: 'Within Normal Range', class: 'info' };
    }

    if (parameter === 'pH') {
      if (value < limit.min) return { status: 'Below Limit (Acidic)', class: 'warning', limit: `${limit.min} - ${limit.max}` };
      if (value > limit.max) return { status: 'Exceeds Limit (Alkaline)', class: 'danger', limit: `${limit.min} - ${limit.max}` };
      return { status: 'Within Limits', class: 'success', limit: `${limit.min} - ${limit.max}` };
    }

    if (parameter === 'BOD') {
      if (value > limit.max) return { status: 'Exceeds Limit', class: 'danger', limit: `<= ${limit.max} mg/L` };
      return { status: 'Within Limits', class: 'success', limit: `<= ${limit.max} mg/L` };
    }

    if (parameter === 'COD') {
      if (value > limit.max) return { status: 'Exceeds Limit', class: 'danger', limit: `<= ${limit.max} mg/L` };
      return { status: 'Within Limits', class: 'success', limit: `<= ${limit.max} mg/L` };
    }

    if (parameter === 'TSS') {
      if (value > limit.max) return { status: 'Exceeds Limit', class: 'danger', limit: `<= ${limit.max} mg/L` };
      return { status: 'Within Limits', class: 'success', limit: `<= ${limit.max} mg/L` };
    }

    if (parameter === 'Faecal_Coliform') {
      if (value > limit.max) return { status: 'Exceeds Limit (High Pathogens)', class: 'danger', limit: `<= ${limit.max} MPN/100mL` };
      if (value > limit.desirable) return { status: 'Acceptable (Tolerable)', class: 'warning', limit: `<= ${limit.desirable} MPN/100mL` };
      return { status: 'Within Desirable Limits', class: 'success', limit: `<= ${limit.desirable} MPN/100mL` };
    }

    return { status: 'Monitored', class: 'info' };
  }

  /**
   * Retrieves all predefined locations with aggregated station count and latest sample date.
   */
  getPlaces({ search = '', district = '', availability = 'all', sort = 'name_asc' } = {}) {
    let result = this.locations.map(loc => {
      const stations = this.monitoringStations.filter(s => s.location_id === loc.location_id);
      const measurements = this.waterQualityMeasurements.filter(m => m.location_id === loc.location_id);

      let latestDate = null;
      if (measurements.length > 0) {
        latestDate = new Date(Math.max(...measurements.map(m => new Date(m.sample_date).getTime()))).toISOString();
      }

      const availableParams = [...new Set(measurements.map(m => m.parameter_name))];

      return {
        ...loc,
        station_count: stations.length,
        latest_sample_date: latestDate,
        data_available: measurements.length > 0,
        available_parameters: availableParams
      };
    });

    // Search filter (city name or district)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        loc => loc.city_name.toLowerCase().includes(q) || loc.district_name.toLowerCase().includes(q)
      );
    }

    // District filter
    if (district && district !== 'all') {
      result = result.filter(loc => loc.district_name.toLowerCase() === district.toLowerCase());
    }

    // Availability filter
    if (availability === 'available') {
      result = result.filter(loc => loc.data_available);
    } else if (availability === 'unavailable') {
      result = result.filter(loc => !loc.data_available);
    }

    // Sorting
    if (sort === 'name_asc') {
      result.sort((a, b) => a.city_name.localeCompare(b.city_name));
    } else if (sort === 'name_desc') {
      result.sort((a, b) => b.city_name.localeCompare(a.city_name));
    } else if (sort === 'latest_date') {
      result.sort((a, b) => {
        const da = a.latest_sample_date ? new Date(a.latest_sample_date).getTime() : 0;
        const db = b.latest_sample_date ? new Date(b.latest_sample_date).getTime() : 0;
        return db - da;
      });
    }

    return result;
  }

  /**
   * Retrieves single location details by ID with station count and summary.
   */
  getPlaceById(locationId) {
    const loc = this.locations.find(l => l.location_id.toLowerCase() === locationId.toLowerCase());
    if (!loc) return null;

    const stations = this.monitoringStations.filter(s => s.location_id === loc.location_id);
    const measurements = this.waterQualityMeasurements.filter(m => m.location_id === loc.location_id);

    let latestDate = null;
    if (measurements.length > 0) {
      latestDate = new Date(Math.max(...measurements.map(m => new Date(m.sample_date).getTime()))).toISOString();
    }

    return {
      ...loc,
      station_count: stations.length,
      stations,
      latest_sample_date: latestDate,
      data_available: measurements.length > 0
    };
  }

  /**
   * Retrieves monitoring stations for a given location.
   */
  getStationsByPlaceId(locationId) {
    return this.monitoringStations.filter(s => s.location_id.toLowerCase() === locationId.toLowerCase());
  }

  /**
   * Retrieves the latest water quality readings for the 5 parameters for a location or specific station.
   */
  getWaterQuality(locationId, stationId = null) {
    const targetParams = ['TSS', 'BOD', 'COD', 'pH', 'Faecal_Coliform'];
    const paramNames = {
      TSS: 'Total Suspended Solids',
      BOD: 'Biochemical Oxygen Demand',
      COD: 'Chemical Oxygen Demand',
      pH: 'pH',
      Faecal_Coliform: 'Faecal Coliform'
    };
    const defaultUnits = {
      TSS: 'mg/L',
      BOD: 'mg/L',
      COD: 'mg/L',
      pH: 'pH units',
      Faecal_Coliform: 'MPN/100mL'
    };

    let filtered = this.waterQualityMeasurements.filter(
      m => m.location_id.toLowerCase() === locationId.toLowerCase()
    );

    if (stationId) {
      filtered = filtered.filter(m => m.station_id === stationId);
    }

    const latestByParam = {};
    targetParams.forEach(param => {
      const match = filtered
        .filter(m => m.parameter_name === param)
        .sort((a, b) => new Date(b.sample_date) - new Date(a.sample_date))[0];

      if (match) {
        const compliance = this.evaluateCompliance(param, match.value);
        latestByParam[param] = {
          parameter: param,
          name: paramNames[param],
          value: match.value,
          unit: match.unit,
          sample_date: match.sample_date,
          station_id: match.station_id,
          data_source: match.data_source,
          reference_limit: compliance.limit || null,
          compliance_status: compliance.status,
          compliance_class: compliance.class,
          is_available: true
        };
      } else {
        // Parameter not sampled or unavailable - strictly display "Data Not Available", never zero or fake
        latestByParam[param] = {
          parameter: param,
          name: paramNames[param],
          value: null,
          unit: defaultUnits[param],
          sample_date: null,
          station_id: stationId || null,
          data_source: null,
          reference_limit: this.complianceLimits[param]?.description || null,
          compliance_status: 'Data Not Available',
          compliance_class: 'muted',
          is_available: false
        };
      }
    });

    return latestByParam;
  }

  /**
   * Retrieves time-series history for a location and parameter, optional station and range filtering.
   */
  getPlaceHistory(locationId, { stationId = null, parameter = 'BOD', range = 'all' } = {}) {
    let filtered = this.waterQualityMeasurements.filter(
      m => m.location_id.toLowerCase() === locationId.toLowerCase() && m.parameter_name === parameter
    );

    if (stationId) {
      filtered = filtered.filter(m => m.station_id === stationId);
    }

    if (range && range !== 'all') {
      const now = new Date();
      let cutoff = new Date();
      if (range === '7d') cutoff.setDate(now.getDate() - 7);
      else if (range === '30d') cutoff.setDate(now.getDate() - 30);
      else if (range === '90d') cutoff.setDate(now.getDate() - 90);
      else if (range === '1y') cutoff.setFullYear(now.getFullYear() - 1);

      filtered = filtered.filter(m => new Date(m.sample_date) >= cutoff);
    }

    // Sort ascending by sample_date for accurate Recharts plotting
    filtered.sort((a, b) => new Date(a.sample_date) - new Date(b.sample_date));

    return filtered.map(m => ({
      measurement_id: m._id || `${m.station_id}_${m.parameter_name}_${new Date(m.sample_date).getTime()}`,
      station_id: m.station_id,
      location_id: m.location_id,
      parameter_name: m.parameter_name,
      value: m.value,
      unit: m.unit,
      sample_date: m.sample_date,
      formatted_date: new Date(m.sample_date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      data_source: m.data_source
    }));
  }

  /**
   * Compares 2 or more locations side-by-side for the 5 parameters.
   */
  comparePlaces(locationIds) {
    if (!Array.isArray(locationIds)) {
      locationIds = locationIds.split(',').map(s => s.trim().toLowerCase());
    }

    const targetParams = ['TSS', 'BOD', 'COD', 'pH', 'Faecal_Coliform'];
    const paramNames = {
      TSS: 'Total Suspended Solids (mg/L)',
      BOD: 'Biochemical Oxygen Demand (mg/L)',
      COD: 'Chemical Oxygen Demand (mg/L)',
      pH: 'pH (pH units)',
      Faecal_Coliform: 'Faecal Coliform (MPN/100mL)'
    };

    const comparedCities = [];

    locationIds.forEach(locId => {
      const loc = this.locations.find(l => l.location_id.toLowerCase() === locId.toLowerCase());
      if (!loc) return;

      const latestParams = this.getWaterQuality(locId);

      comparedCities.push({
        location_id: loc.location_id,
        city_name: loc.city_name,
        district_name: loc.district_name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        parameters: latestParams
      });
    });

    // Create matrix view for UI table
    const matrix = targetParams.map(param => {
      const row = {
        parameter_key: param,
        parameter_name: paramNames[param]
      };

      comparedCities.forEach(city => {
        const item = city.parameters[param];
        row[city.location_id] = {
          value: item && item.is_available ? item.value : null,
          unit: item ? item.unit : '',
          sample_date: item ? item.sample_date : null,
          compliance_status: item ? item.compliance_status : 'Data Not Available',
          is_available: item ? item.is_available : false
        };
      });

      return row;
    });

    return {
      cities: comparedCities,
      matrix
    };
  }

  /**
   * Imports custom CSV or external measurements with strict validation.
   */
  importMeasurements(records) {
    const validParams = ['TSS', 'BOD', 'COD', 'pH', 'Faecal_Coliform'];
    const imported = [];
    const errors = [];

    records.forEach((rec, idx) => {
      if (!rec.station_id || !rec.location_id || !rec.parameter_name || rec.value === undefined || !rec.sample_date) {
        errors.push({ row: idx + 1, message: 'Missing mandatory field (station_id, location_id, parameter_name, value, sample_date)' });
        return;
      }

      if (!validParams.includes(rec.parameter_name)) {
        errors.push({ row: idx + 1, message: `Invalid parameter: ${rec.parameter_name}. Must be one of ${validParams.join(', ')}` });
        return;
      }

      const val = parseFloat(rec.value);
      if (isNaN(val)) {
        errors.push({ row: idx + 1, message: `Invalid numeric value for ${rec.parameter_name}: ${rec.value}` });
        return;
      }

      if (rec.parameter_name === 'pH' && (val < 0 || val > 14)) {
        errors.push({ row: idx + 1, message: `pH out of range (0-14): ${val}` });
        return;
      }

      if (rec.parameter_name !== 'pH' && val < 0) {
        errors.push({ row: idx + 1, message: `Negative value not permitted for ${rec.parameter_name}: ${val}` });
        return;
      }

      const sampleDate = new Date(rec.sample_date);
      if (isNaN(sampleDate.getTime()) || sampleDate > new Date()) {
        errors.push({ row: idx + 1, message: `Invalid or future sample date: ${rec.sample_date}` });
        return;
      }

      const item = {
        station_id: rec.station_id,
        location_id: rec.location_id.toLowerCase(),
        parameter_name: rec.parameter_name,
        value: val,
        unit: rec.unit || (rec.parameter_name === 'pH' ? 'pH units' : rec.parameter_name === 'Faecal_Coliform' ? 'MPN/100mL' : 'mg/L'),
        sample_date: sampleDate,
        data_source: rec.data_source || 'Government Authorized Import',
        import_timestamp: new Date()
      };

      this.waterQualityMeasurements.push(item);
      imported.push(item);
    });

    return {
      success: true,
      imported_count: imported.length,
      errors_count: errors.length,
      errors
    };
  }
}

module.exports = new MemoryStore();
