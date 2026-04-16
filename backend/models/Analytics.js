const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: track logged-in users
  ip: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
