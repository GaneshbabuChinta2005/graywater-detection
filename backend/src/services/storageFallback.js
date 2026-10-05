/**
 * Graceful In-Memory Store Fallback for MongoDB
 * Ensures that if MongoDB server is unavailable, the application can still save and
 * query analysis records, telemetry history, reports, and routing decisions seamlessly.
 */

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

    this._seedInitialData();
  }

  _seedInitialData() {
    // Seed some initial telemetry records for immediate chart display
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

    // Seed sample reports
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
}

module.exports = new MemoryStore();
