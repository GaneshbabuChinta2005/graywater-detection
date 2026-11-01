const mongoose = require('mongoose');

const waterQualityMeasurementSchema = new mongoose.Schema(
  {
    station_id: {
      type: String,
      required: true,
      trim: true,
      ref: 'MonitoringStation',
      index: true
    },
    location_id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      ref: 'Location',
      index: true
    },
    parameter_name: {
      type: String,
      required: true,
      enum: ['TSS', 'BOD', 'COD', 'pH', 'Faecal_Coliform'],
      trim: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    sample_date: {
      type: Date,
      required: true,
      index: true
    },
    data_source: {
      type: String,
      required: true,
      trim: true
    },
    import_timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimal time-series and station filtering
waterQualityMeasurementSchema.index({ location_id: 1, parameter_name: 1, sample_date: -1 });
waterQualityMeasurementSchema.index({ station_id: 1, parameter_name: 1, sample_date: -1 });

module.exports = mongoose.model('WaterQualityMeasurement', waterQualityMeasurementSchema);

