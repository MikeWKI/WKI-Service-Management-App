const mongoose = require('mongoose');

const LocationMetricSchema = new mongoose.Schema({
  metrics: {
    type: Object, // Store parsed PDF data as a JSON object
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Only one document will be used (latest upload)
module.exports = mongoose.model('LocationMetric', LocationMetricSchema);
