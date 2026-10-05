const mongoose = require('mongoose');

const TelemetrySchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  greywater_source: { type: String, required: true },
  pH: { type: Number, required: true },
  TEMP_C: { type: Number, required: true },
  SAL_ppt: { type: Number, required: true },
  TUR_NTU: { type: Number, required: true },
  DS_mg_L: { type: Number, required: true },
  TDS_mg_L: { type: Number, required: true },
  TSS_mg_L: { type: Number, required: true },
  COND_uS_cm: { type: Number, required: true },
  DO_mg_L: { type: Number, required: true },
  BOD_mg_L: { type: Number, required: true },
  COD_mg_L: { type: Number, required: true },
  NH4F_mg_L: { type: Number, required: true },
  NO3_mg_L: { type: Number, required: true },
  K_mg_L: { type: Number, required: true },
  E_coli_CFU_100mL: { type: Number, required: true },
  flow_rate_L_min: { type: Number, default: 0.0 },
  tank_capacity_L: { type: Number, default: 1000.0 },
  tank_level_L: { type: Number, default: 250.0 },
  sensor_status: { type: String, default: 'OK' },
  event_name: { type: String, default: 'normal' },
  step: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Telemetry', TelemetrySchema);
