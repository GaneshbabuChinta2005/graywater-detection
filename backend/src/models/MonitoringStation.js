const mongoose = require('mongoose');

const monitoringStationSchema = new mongoose.Schema(
  {
    station_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    station_name: {
      type: String,
      required: true,
      trim: true
    },
    location_id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      ref: 'Location',
      index: true
    },
    water_body_name: {
      type: String,
      required: true,
      trim: true
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    sample_type: {
      type: String,
      required: true,
      trim: true
    },
    data_source: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MonitoringStation', monitoringStationSchema);

