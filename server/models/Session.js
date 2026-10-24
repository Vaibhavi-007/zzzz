const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  participantId: {
    type: String,
    required: true,
    index: true
  },
  condition: {
    type: String,
    enum: ['pleasant', 'neutral', 'unpleasant'],
    required: true
  },
  stimulusType: {
    type: String,
    enum: ['video', 'photo'],
    default: 'video'
  },
  stimulusId: {
    type: String,
    default: ''
  },
  targetPoints: {
    type: Number,
    default: 500
  },
  totalPointsWon: {
    type: Number,
    default: 0
  },
  targetReached: {
    type: Boolean,
    default: false
  },
  reportedMood: {
    type: String,
    enum: ['pleasant', 'neutral', 'unpleasant', 'pending'],
    default: 'pending'
  },
  likertValenceScore: {
    type: Number,
    default: null
  },
  moodRatingLatencyMs: {
    type: Number,
    default: 0
  },
  totalRoundsPlayed: {
    type: Number,
    default: 0
  },
  totalNegotiationDurationMs: {
    type: Number,
    default: 0
  },
  averageRoundDurationMs: {
    type: Number,
    default: 0
  },
  averageAccuracyRatio: {
    type: Number,
    default: 0
  },
  averageDealSpeed: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['initialized', 'stimulus_active', 'mood_reported', 'negotiation_active', 'completed'],
    default: 'initialized'
  },
  rawTelemetryLogs: [{
    event: String,
    round: Number,
    value: mongoose.Schema.Types.Mixed,
    latencyMs: Number,
    wallTimestamp: Date
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
