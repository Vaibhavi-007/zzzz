const mongoose = require('mongoose');

const stimulusSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['pleasant', 'neutral', 'unpleasant'],
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'photo'],
    required: true
  },
  description: { type: String },
  mediaUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  recommendedDurationSeconds: { type: Number, default: 8 }
}, { timestamps: true });

module.exports = mongoose.model('Stimulus', stimulusSchema);
