/**
 * Negotiation Engine for Behavioral Experiment
 * Dynamics strictly conditioned on participant's reported mood:
 * - Pleasant: Easy negotiation (generous bot, high reservation limit, rapid concessions)
 * - Neutral: Moderate negotiation (balanced standard economics)
 * - Unpleasant: Hard negotiation (stubborn lowball bot, low reservation ceiling, minimal concessions)
 */

const CONFIGS = {
  pleasant: {
    difficulty: 'easy',
    pool: 100,
    openOffer: 48,
    botReservationLimit: 75,
    concessionStep: 8,
    maxCounters: 5,
    roundTimeoutSeconds: 90,
    botPhrases: {
      open: "I'm offering you 48 points to start with. Accept or propose your demand on the wire.",
      concession: (offer) => `I want to reach a good agreement. I can increase my offer to ${offer} points.`,
      finalOffer: (offer) => `This is my highest possible offer: ${offer} points. Accept or walk away.`,
      acceptDemand: (points) => `That is a fair proposal. Deal confirmed at ${points} points!`,
      acceptedBotOffer: (points) => `Deal agreed at ${points} points. Good outcome!`
    }
  },
  neutral: {
    difficulty: 'moderate',
    pool: 100,
    openOffer: 32,
    botReservationLimit: 60,
    concessionStep: 5,
    maxCounters: 4,
    roundTimeoutSeconds: 90,
    botPhrases: {
      open: "My offer is 32 points for you. Accept, or send your counter-demand on the wire.",
      concession: (offer) => `I can adjust my terms: you receive ${offer} points. Accept or counter.`,
      finalOffer: (offer) => `This is my final position: ${offer} points. Take it or walk away.`,
      acceptDemand: (points) => `Agreed. I accept your demand of ${points} points.`,
      acceptedBotOffer: (points) => `Deal finalized at ${points} points.`
    }
  },
  unpleasant: {
    difficulty: 'hard',
    pool: 100,
    openOffer: 18,
    botReservationLimit: 42,
    concessionStep: 3,
    maxCounters: 3,
    roundTimeoutSeconds: 90,
    botPhrases: {
      open: "Opening position: you receive 18 points. Accept, or propose your counter.",
      concession: (offer) => `Your demand is too demanding. I can only move to ${offer} points.`,
      finalOffer: (offer) => `No further room for concessions. Final offer is ${offer} points.`,
      acceptDemand: (points) => `Acceptable terms. Deal recorded at ${points} points.`,
      acceptedBotOffer: (points) => `Deal locked at ${points} points.`
    }
  }
};

/**
 * Returns configuration based on reported mood (or assigned condition)
 */
function getBotConfig(mood) {
  const normalized = (mood || 'neutral').toLowerCase().trim();
  if (normalized.includes('unpleas') || normalized === 'negative') {
    return CONFIGS.unpleasant;
  }
  if (normalized.includes('pleas') || normalized === 'positive') {
    return CONFIGS.pleasant;
  }
  return CONFIGS.neutral;
}

/**
 * Evaluates a participant's counter demand
 */
function evaluateCounterDemand(mood, demand, currentBotOffer, counterCount) {
  const config = getBotConfig(mood);
  const numericDemand = Math.round(Number(demand));

  // Sanity check
  if (isNaN(numericDemand) || numericDemand < 0 || numericDemand > config.pool) {
    return {
      error: `Demand must be between 0 and ${config.pool}.`
    };
  }

  const nextCounterCount = counterCount + 1;

  // Rule 1: Bot accepts demand if it is within its reservation limit
  if (numericDemand <= config.botReservationLimit) {
    return {
      action: 'accept_demand',
      isDeal: true,
      agreedPoints: numericDemand,
      botPoints: config.pool - numericDemand,
      botOffer: numericDemand,
      dialogue: config.botPhrases.acceptDemand(numericDemand),
      counterCount: nextCounterCount,
      isFinal: false
    };
  }

  // Rule 2: Bot rejects demand. Check if final offer limit reached
  if (nextCounterCount >= config.maxCounters) {
    return {
      action: 'final_offer',
      isDeal: false,
      botOffer: config.botReservationLimit,
      dialogue: config.botPhrases.finalOffer(config.botReservationLimit),
      counterCount: nextCounterCount,
      isFinal: true
    };
  }

  // Rule 3: Bot makes a concession towards its reservation limit
  const nextOffer = Math.min(
    config.botReservationLimit,
    currentBotOffer + config.concessionStep
  );

  return {
    action: 'counter_offer',
    isDeal: false,
    botOffer: nextOffer,
    dialogue: config.botPhrases.concession(nextOffer),
    counterCount: nextCounterCount,
    isFinal: false
  };
}

/**
 * Computes accuracy and efficiency metrics
 */
function calculateTrialMetrics({
  agreedPoints,
  botReservationLimit,
  roundDurationMs,
  firstActionLatencyMs,
  countersCount,
  isDeal
}) {
  const accuracyRatio = isDeal && botReservationLimit > 0
    ? Math.min(1.0, Number((agreedPoints / botReservationLimit).toFixed(4)))
    : 0;

  const seconds = Math.max(0.1, roundDurationMs / 1000);
  const dealSpeedPointsPerSec = isDeal ? Number((agreedPoints / seconds).toFixed(2)) : 0;

  return {
    accuracyRatio,
    accuracyPercentage: Math.round(accuracyRatio * 100),
    dealSpeedPointsPerSec,
    roundDurationMs,
    firstActionLatencyMs,
    countersCount
  };
}

module.exports = {
  CONFIGS,
  getBotConfig,
  evaluateCounterDemand,
  calculateTrialMetrics
};
