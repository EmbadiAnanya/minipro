const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'hero', 'about', 'projects', 'skills', 'contact'
  title: { type: String },
  content: { type: mongoose.Schema.Types.Mixed }, // Dynamic content based on type
  order: { type: Number, required: true }
});

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  template: { type: String, default: 'developer' },
  theme: {
    name: { type: String, default: 'blue' }, // 'light', 'dark', 'blue', 'purple', 'neon'
    primaryColor: { type: String, default: '#3b82f6' },
    fontFamily: { type: String, default: 'Inter' },
    darkMode: { type: Boolean, default: false }
  },
  branding: {
    profileImage: { type: String },
    bannerImage: { type: String },
    tagline: { type: String }
  },
  socials: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  sections: [sectionSchema],
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'approved', 'rejected'], 
    default: 'draft' 
  },
  publicUrl: { type: String, unique: true, sparse: true },
  feedback: { type: String },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
portfolioSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
