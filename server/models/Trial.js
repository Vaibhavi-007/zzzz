const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
  turn: { type: Number, required: true },
  action: {
    type: String,
    enum: ['initial_offer', 'participant_demand', 'bot_counter', 'bot_final_offer', 'bot_rejected', 'deal_accepted', 'timeout'],
    required: true
  },
  participantDemand: { type: Number },
  botOffer: { type: Number },
  latencyMs: { type: Number, default: 0 },
  botDialogue: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const trialSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  participantId: {
    type: String,
    required: true,
    index: true
  },
  roundNumber: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    default: 'standard'
  },
  reportedMood: {
    type: String,
    default: 'none'
  },
  botDifficulty: {
    type: String,
    default: 'standard'
  },
  poolSize: {
    type: Number,
    default: 100
  },
  botOpeningOffer: {
    type: Number,
    required: true
  },
  botReservationLimit: {
    type: Number,
    required: true
  },
  botConcessionStep: {
    type: Number,
    required: true
  },
  exchanges: [exchangeSchema],
  finalOutcome: {
    type: String,
    enum: ['participant_accepted', 'bot_accepted_demand', 'bot_rejected', 'timeout', 'walkaway'],
    required: true
  },
  agreedPoints: {
    type: Number,
    default: 0
  },
  roundDurationMs: {
    type: Number,
    required: true
  },
  firstActionLatencyMs: {
    type: Number,
    default: 0
  },
  countersExchanged: {
    type: Number,
    default: 0
  },
  accuracyRatio: {
    type: Number,
    default: 0
  },
  dealSpeedPointsPerSec: {
    type: Number,
    default: 0
  },
  cumulativePointsAtRoundEnd: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Trial', trialSchema);
