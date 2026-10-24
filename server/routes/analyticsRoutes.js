const express = require('express');
const router = express.Router();
const Trial = require('../models/Trial');
const Session = require('../models/Session');
const fallback = require('../config/storageFallback');
const { getStatus } = require('../config/db');

// Helper to get all trials
async function getAllTrials() {
  if (getStatus()) {
    return await Trial.find().lean();
  }
  return fallback.find('trials');
}

// Helper to get all sessions
async function getAllSessions() {
  if (getStatus()) {
    return await Session.find().lean();
  }
  return fallback.find('sessions');
}

// 1. Experimental Summary Metrics grouped by Mood Condition
router.get('/summary', async (req, res) => {
  try {
    const trials = await getAllTrials();
    const sessions = await getAllSessions();

    const conditions = ['pleasant', 'neutral', 'unpleasant'];
    const summaryByCondition = {};

    conditions.forEach(cond => {
      const condTrials = trials.filter(t => (t.reportedMood || t.condition || '').toLowerCase().includes(cond));
      const condSessions = sessions.filter(s => (s.reportedMood || s.condition || '').toLowerCase().includes(cond));

      const countTrials = condTrials.length;
      const countSessions = condSessions.length;

      const avgRunTimeMs = countTrials > 0
        ? Math.round(condTrials.reduce((sum, t) => sum + (t.roundDurationMs || 0), 0) / countTrials)
        : 0;

      const avgAccuracy = countTrials > 0
        ? Number((condTrials.reduce((sum, t) => sum + (t.accuracyRatio || 0), 0) / countTrials).toFixed(3))
        : 0;

      const avgDealSpeed = countTrials > 0
        ? Number((condTrials.reduce((sum, t) => sum + (t.dealSpeedPointsPerSec || 0), 0) / countTrials).toFixed(2))
        : 0;

      const avgAgreedPoints = countTrials > 0
        ? Math.round(condTrials.reduce((sum, t) => sum + (t.agreedPoints || 0), 0) / countTrials)
        : 0;

      const avgCounters = countTrials > 0
        ? Number((condTrials.reduce((sum, t) => sum + (t.countersExchanged || 0), 0) / countTrials).toFixed(1))
        : 0;

      const targetReachedCount = condSessions.filter(s => s.targetReached).length;
      const targetReachedRate = countSessions > 0
        ? Math.round((targetReachedCount / countSessions) * 100)
        : 0;

      summaryByCondition[cond] = {
        condition: cond,
        participantCount: countSessions,
        totalTrials: countTrials,
        avgRunTimeMs,
        avgRunTimeSec: Number((avgRunTimeMs / 1000).toFixed(2)),
        avgAccuracyRatio: avgAccuracy,
        avgAccuracyPercent: Math.round(avgAccuracy * 100),
        avgDealSpeedPointsPerSec: avgDealSpeed,
        avgAgreedPoints,
        avgCountersExchanged: avgCounters,
        targetReachedCount,
        targetReachedRate
      };
    });

    res.json({
      success: true,
      totalSessionsCount: sessions.length,
      totalTrialsCount: trials.length,
      conditions: summaryByCondition
    });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Export RFC 4180 CSV
router.get('/export/csv', async (req, res) => {
  try {
    const trials = await getAllTrials();

    const headers = [
      'session_id',
      'participant_id',
      'round_number',
      'condition',
      'reported_mood',
      'bot_difficulty',
      'final_outcome',
      'agreed_points',
      'bot_opening_offer',
      'bot_reservation_limit',
      'round_duration_ms',
      'round_duration_sec',
      'first_action_latency_ms',
      'counters_exchanged',
      'accuracy_ratio',
      'accuracy_percentage',
      'deal_speed_pts_per_sec',
      'cumulative_points',
      'timestamp'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = trials.map(t => [
      escapeCsv(t.sessionId),
      escapeCsv(t.participantId),
      t.roundNumber,
      escapeCsv(t.condition),
      escapeCsv(t.reportedMood),
      escapeCsv(t.botDifficulty),
      escapeCsv(t.finalOutcome),
      t.agreedPoints,
      t.botOpeningOffer,
      t.botReservationLimit,
      t.roundDurationMs,
      (t.roundDurationMs / 1000).toFixed(2),
      t.firstActionLatencyMs,
      t.countersExchanged,
      (t.accuracyRatio || 0).toFixed(4),
      Math.round((t.accuracyRatio || 0) * 100),
      t.dealSpeedPointsPerSec,
      t.cumulativePointsAtRoundEnd,
      escapeCsv(t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString())
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="negotiation_study_data_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).send('Error generating CSV data');
  }
});

// 3. Seed Realistic Behavioral Pilot Data
router.post('/seed-demo', async (req, res) => {
  try {
    const demoSessions = [
      // Pleasant condition cohort (Fast negotiations, high points, easy compromises)
      { pid: 'PILOT-P01', mood: 'pleasant', condition: 'pleasant', rounds: 8, baseDuration: 9400, basePoints: 68, accuracy: 0.91 },
      { pid: 'PILOT-P02', mood: 'pleasant', condition: 'pleasant', rounds: 7, baseDuration: 8200, basePoints: 72, accuracy: 0.96 },
      // Neutral condition cohort (Moderate durations and points)
      { pid: 'PILOT-N01', mood: 'neutral', condition: 'neutral', rounds: 10, baseDuration: 18200, basePoints: 52, accuracy: 0.86 },
      { pid: 'PILOT-N02', mood: 'neutral', condition: 'neutral', rounds: 10, baseDuration: 16500, basePoints: 50, accuracy: 0.83 },
      // Unpleasant condition cohort (Slow negotiations, tough low offers, stubborn bot)
      { pid: 'PILOT-U01', mood: 'unpleasant', condition: 'unpleasant', rounds: 12, baseDuration: 28500, basePoints: 34, accuracy: 0.81 },
      { pid: 'PILOT-U02', mood: 'unpleasant', condition: 'unpleasant', rounds: 12, baseDuration: 31200, basePoints: 32, accuracy: 0.76 }
    ];

    for (const d of demoSessions) {
      const sessionId = `SES-DEMO-${d.pid}`;
      let totalPts = 0;
      let totalDur = 0;

      for (let r = 1; r <= d.rounds; r++) {
        const pts = Math.min(100, Math.max(20, Math.round(d.basePoints + (Math.random() * 8 - 4))));
        const dur = Math.max(3000, Math.round(d.baseDuration + (Math.random() * 3000 - 1500)));
        const latency = Math.round(1200 + Math.random() * 800);
        const counters = d.mood === 'pleasant' ? 1 : d.mood === 'neutral' ? 2 : 3;
        totalPts += pts;
        totalDur += dur;

        const botResLimit = d.mood === 'pleasant' ? 75 : d.mood === 'neutral' ? 60 : 42;
        const accuracy = Number((pts / botResLimit).toFixed(3));

        const trial = {
          sessionId,
          participantId: d.pid,
          roundNumber: r,
          condition: d.condition,
          reportedMood: d.mood,
          botDifficulty: d.mood === 'pleasant' ? 'easy' : d.mood === 'neutral' ? 'moderate' : 'hard',
          poolSize: 100,
          botOpeningOffer: d.mood === 'pleasant' ? 48 : d.mood === 'neutral' ? 32 : 18,
          botReservationLimit: botResLimit,
          botConcessionStep: d.mood === 'pleasant' ? 8 : d.mood === 'neutral' ? 5 : 3,
          finalOutcome: 'participant_accepted',
          agreedPoints: pts,
          roundDurationMs: dur,
          firstActionLatencyMs: latency,
          countersExchanged: counters,
          accuracyRatio: accuracy,
          dealSpeedPointsPerSec: Number((pts / (dur / 1000)).toFixed(2)),
          cumulativePointsAtRoundEnd: totalPts,
          createdAt: new Date(Date.now() - (12 - r) * 60000)
        };

        if (getStatus()) {
          await Trial.create(trial);
        } else {
          fallback.save('trials', trial);
        }
      }

      const sessionDoc = {
        sessionId,
        participantId: d.pid,
        condition: d.condition,
        stimulusType: 'video',
        stimulusId: `${d.condition}-vid-01`,
        targetPoints: 500,
        totalPointsWon: totalPts,
        targetReached: totalPts >= 500,
        reportedMood: d.mood,
        likertValenceScore: d.mood === 'pleasant' ? 7 : d.mood === 'unpleasant' ? 2 : 4,
        moodRatingLatencyMs: 2450,
        totalRoundsPlayed: d.rounds,
        totalNegotiationDurationMs: totalDur,
        averageRoundDurationMs: Math.round(totalDur / d.rounds),
        averageAccuracyRatio: d.accuracy,
        averageDealSpeed: Number((totalPts / (totalDur / 1000)).toFixed(2)),
        status: 'completed',
        completedAt: new Date()
      };

      if (getStatus()) {
        await Session.create(sessionDoc);
      } else {
        fallback.save('sessions', sessionDoc);
      }
    }

    res.json({ success: true, message: 'Pilot research dataset successfully generated.' });
  } catch (err) {
    console.error('Seed demo error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
