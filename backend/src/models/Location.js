const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    location_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    city_name: {
      type: String,
      required: true,
      trim: true
    },
    district_name: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      default: 'Andhra Pradesh'
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
    description: {
      type: String,
      default: ''
    },
    is_predefined: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

locationSchema.virtual('monitoringStations', {
  ref: 'MonitoringStation',
  localField: 'location_id',
  foreignField: 'location_id'
});

module.exports = mongoose.model('Location', locationSchema);

