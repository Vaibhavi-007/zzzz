const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const Trial = require('../models/Trial');
const fallback = require('../config/storageFallback');
const { getStatus } = require('../config/db');
const {
  getBotConfig,
  evaluateCounterDemand,
  calculateTrialMetrics
} = require('../controllers/negotiationEngine');
const { STIMULI_DATA } = require('../controllers/stimuliData');

// 1. Start a new session
router.post('/start', async (req, res) => {
  try {
    const { participantId, condition, stimulusType, targetPoints = 500 } = req.body;
    if (!participantId) {
      return res.status(400).json({ error: 'participantId is required' });
    }

    const assignedCondition = condition || ['pleasant', 'neutral', 'unpleasant'][Math.floor(Math.random() * 3)];
    const chosenType = stimulusType || 'video';

    // Select stimulus
    const candidates = STIMULI_DATA.filter(s => s.category === assignedCondition && s.type === chosenType);
    const stimulus = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : STIMULI_DATA.find(s => s.category === assignedCondition) || STIMULI_DATA[0];

    const sessionId = `SES-${Date.now()}-${uuidv4().substring(0, 6)}`;
    const sessionData = {
      sessionId,
      participantId: participantId.trim(),
      condition: assignedCondition,
      stimulusType: chosenType,
      stimulusId: stimulus.id,
      targetPoints: Number(targetPoints) || 500,
      totalPointsWon: 0,
      targetReached: false,
      reportedMood: 'pending',
      likertValenceScore: null,
      moodRatingLatencyMs: 0,
      totalRoundsPlayed: 0,
      totalNegotiationDurationMs: 0,
      averageRoundDurationMs: 0,
      averageAccuracyRatio: 0,
      averageDealSpeed: 0,
      status: 'stimulus_active',
      startedAt: new Date()
    };

    if (getStatus()) {
      await Session.create(sessionData);
    } else {
      fallback.save('sessions', sessionData);
    }

    res.json({
      success: true,
      session: sessionData,
      stimulus
    });
  } catch (err) {
    console.error('Session start error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Rate Mood (Likert Scale)
router.post('/:id/rate-mood', async (req, res) => {
  try {
    const { id } = req.params;
    const { reportedMood, likertScore, latencyMs } = req.body;

    if (!reportedMood) {
      return res.status(400).json({ error: 'reportedMood is required' });
    }

    const botConfig = getBotConfig(reportedMood);

    let session;
    if (getStatus()) {
      session = await Session.findOne({ sessionId: id });
      if (!session) return res.status(404).json({ error: 'Session not found' });

      session.reportedMood = reportedMood.toLowerCase();
      session.likertValenceScore = Number(likertScore) || (reportedMood === 'pleasant' ? 7 : reportedMood === 'unpleasant' ? 1 : 4);
      session.moodRatingLatencyMs = Number(latencyMs) || 0;
      session.status = 'negotiation_active';
      await session.save();
    } else {
      session = fallback.findOne('sessions', { sessionId: id });
      if (!session) return res.status(404).json({ error: 'Session not found' });

      session.reportedMood = reportedMood.toLowerCase();
      session.likertValenceScore = Number(likertScore) || (reportedMood === 'pleasant' ? 7 : reportedMood === 'unpleasant' ? 1 : 4);
      session.moodRatingLatencyMs = Number(latencyMs) || 0;
      session.status = 'negotiation_active';
      fallback.save('sessions', session);
    }

    res.json({
      success: true,
      session,
      botConfig: {
        difficulty: botConfig.difficulty,
        openOffer: botConfig.openOffer,
        pool: botConfig.pool,
        maxCounters: botConfig.maxCounters,
        initialDialogue: botConfig.botPhrases.open
      }
    });
  } catch (err) {
    console.error('Mood rating error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Counter demand on the Negotiate Wire
router.post('/:id/counter', async (req, res) => {
  try {
    const { id } = req.params;
    const { demand, currentBotOffer, counterCount = 0, latencyMs = 0 } = req.body;

    let session;
    if (getStatus()) {
      session = await Session.findOne({ sessionId: id });
    } else {
      session = fallback.findOne('sessions', { sessionId: id });
    }

    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Bot negotiation logic is conditioned on reported mood!
    const mood = session.reportedMood || session.condition || 'neutral';
    const result = evaluateCounterDemand(mood, demand, currentBotOffer, counterCount);

    res.json({
      success: true,
      moodCondition: mood,
      ...result
    });
  } catch (err) {
    console.error('Counter evaluation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Record completed round
router.post('/:id/round', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      roundNumber,
      finalOutcome,
      agreedPoints,
      roundDurationMs,
      firstActionLatencyMs,
      countersExchanged,
      exchanges = []
    } = req.body;

    let session;
    if (getStatus()) {
      session = await Session.findOne({ sessionId: id });
    } else {
      session = fallback.findOne('sessions', { sessionId: id });
    }

    if (!session) return res.status(404).json({ error: 'Session not found' });

    const mood = session.reportedMood || session.condition || 'neutral';
    const botConfig = getBotConfig(mood);
    const isDeal = finalOutcome === 'participant_accepted' || finalOutcome === 'bot_accepted_demand';
    const pointsWon = isDeal ? Number(agreedPoints) : 0;

    const metrics = calculateTrialMetrics({
      agreedPoints: pointsWon,
      botReservationLimit: botConfig.botReservationLimit,
      roundDurationMs: Number(roundDurationMs) || 0,
      firstActionLatencyMs: Number(firstActionLatencyMs) || 0,
      countersCount: Number(countersExchanged) || 0,
      isDeal
    });

    const newTotalPoints = (session.totalPointsWon || 0) + pointsWon;
    const targetReached = newTotalPoints >= (session.targetPoints || 500);

    const trialData = {
      sessionId: session.sessionId,
      participantId: session.participantId,
      roundNumber: Number(roundNumber),
      condition: session.condition,
      reportedMood: mood,
      botDifficulty: botConfig.difficulty,
      poolSize: botConfig.pool,
      botOpeningOffer: botConfig.openOffer,
      botReservationLimit: botConfig.botReservationLimit,
      botConcessionStep: botConfig.concessionStep,
      exchanges,
      finalOutcome,
      agreedPoints: pointsWon,
      roundDurationMs: Number(roundDurationMs) || 0,
      firstActionLatencyMs: Number(firstActionLatencyMs) || 0,
      countersExchanged: Number(countersExchanged) || 0,
      accuracyRatio: metrics.accuracyRatio,
      dealSpeedPointsPerSec: metrics.dealSpeedPointsPerSec,
      cumulativePointsAtRoundEnd: newTotalPoints,
      createdAt: new Date()
    };

    if (getStatus()) {
      await Trial.create(trialData);
    } else {
      fallback.save('trials', trialData);
    }

    // Update Session aggregates
    session.totalPointsWon = newTotalPoints;
    session.targetReached = targetReached;
    session.totalRoundsPlayed = (session.totalRoundsPlayed || 0) + 1;
    session.totalNegotiationDurationMs = (session.totalNegotiationDurationMs || 0) + (Number(roundDurationMs) || 0);
    session.averageRoundDurationMs = Math.round(session.totalNegotiationDurationMs / session.totalRoundsPlayed);

    if (getStatus()) {
      await session.save();
    } else {
      fallback.save('sessions', session);
    }

    res.json({
      success: true,
      trial: trialData,
      metrics,
      currentTotalPoints: newTotalPoints,
      targetPoints: session.targetPoints,
      targetReached
    });
  } catch (err) {
    console.error('Record round error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Finalize Study Session
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    let session;
    let trials;

    if (getStatus()) {
      session = await Session.findOne({ sessionId: id });
      trials = await Trial.find({ sessionId: id });
    } else {
      session = fallback.findOne('sessions', { sessionId: id });
      trials = fallback.find('trials', { sessionId: id });
    }

    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Compute overall session stats
    const totalRounds = trials.length;
    const avgAccuracy = totalRounds > 0
      ? trials.reduce((acc, t) => acc + (t.accuracyRatio || 0), 0) / totalRounds
      : 0;

    const avgDealSpeed = totalRounds > 0
      ? trials.reduce((acc, t) => acc + (t.dealSpeedPointsPerSec || 0), 0) / totalRounds
      : 0;

    session.status = 'completed';
    session.completedAt = new Date();
    session.averageAccuracyRatio = Number(avgAccuracy.toFixed(4));
    session.averageDealSpeed = Number(avgDealSpeed.toFixed(2));
    session.targetReached = session.totalPointsWon >= session.targetPoints;

    if (getStatus()) {
      await session.save();
    } else {
      fallback.save('sessions', session);
    }

    res.json({
      success: true,
      session,
      trialsCount: totalRounds,
      summary: {
        totalPoints: session.totalPointsWon,
        targetPoints: session.targetPoints,
        targetReached: session.targetReached,
        totalDurationMs: session.totalNegotiationDurationMs,
        averageRoundDurationMs: session.averageRoundDurationMs,
        averageAccuracyPercentage: Math.round(avgAccuracy * 100),
        averageDealSpeed: session.averageDealSpeed
      }
    });
  } catch (err) {
    console.error('Session complete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Get session state
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let session;
    let trials;

    if (getStatus()) {
      session = await Session.findOne({ sessionId: id });
      trials = await Trial.find({ sessionId: id }).sort({ roundNumber: 1 });
    } else {
      session = fallback.findOne('sessions', { sessionId: id });
      trials = fallback.find('trials', { sessionId: id }).sort((a, b) => a.roundNumber - b.roundNumber);
    }

    if (!session) return res.status(404).json({ error: 'Session not found' });

    res.json({ success: true, session, trials });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
