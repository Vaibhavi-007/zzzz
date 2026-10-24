const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  participantId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  ageGroup: {
    type: String,
    default: 'unspecified'
  },
  assignedCondition: {
    type: String,
    enum: ['pleasant', 'neutral', 'unpleasant'],
    required: true
  },
  stimulusType: {
    type: String,
    enum: ['video', 'photo'],
    default: 'video'
  },
  status: {
    type: String,
    enum: ['registered', 'in_progress', 'completed', 'abandoned'],
    default: 'registered'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Participant', participantSchema);
