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
    default: 'standard'
  },
  stimulusType: {
    type: String,
    default: 'none'
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
