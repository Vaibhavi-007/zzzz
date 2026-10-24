/**
 * Negotiation Engine for Behavioral Experiment
 * Dynamics strictly conditioned on participant's reported mood:
 * - Pleasant: Easy negotiation (generous bot, high reservation limit, rapid concessions)
 * - Neutral: Moderate negotiation (balanced standard economics)
 * - Unpleasant: Hard negotiation (stubborn lowball bot, low reservation ceiling, minimal concessions)
 */

const RANGES = {
  pleasant: {
    difficulty: 'easy',
    pool: 100,
    openOfferMin: 45,
    openOfferMax: 53,
    reservationLimitMin: 73,
    reservationLimitMax: 80,
    concessionSteps: [7, 8, 9],
    maxCounters: 5,
    roundTimeoutSeconds: 90
  },
  neutral: {
    difficulty: 'moderate',
    pool: 100,
    openOfferMin: 28,
    openOfferMax: 38,
    reservationLimitMin: 57,
    reservationLimitMax: 65,
    concessionSteps: [4, 5, 6],
    maxCounters: 4,
    roundTimeoutSeconds: 90
  },
  unpleasant: {
    difficulty: 'hard',
    pool: 100,
    openOfferMin: 14,
    openOfferMax: 22,
    reservationLimitMin: 38,
    reservationLimitMax: 44,
    concessionSteps: [2, 3, 4],
    maxCounters: 3,
    roundTimeoutSeconds: 90
  }
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const PHRASES = {
  pleasant: {
    open: (offer) => `I'm offering you ${offer} points to start this round. Accept or propose your demand on the wire.`,
    concession: (offer) => `I want to reach a good agreement. I can increase my offer to ${offer} points.`,
    finalOffer: (offer) => `This is my highest possible offer: ${offer} points. Accept or walk away.`,
    acceptDemand: (points) => `That is a fair proposal. Deal confirmed at ${points} points!`,
    acceptedBotOffer: (points) => `Deal agreed at ${points} points. Good outcome!`
  },
  neutral: {
    open: (offer) => `My opening offer is ${offer} points for you. Accept, or send your counter-demand on the wire.`,
    concession: (offer) => `I can adjust my terms: you receive ${offer} points. Accept or counter.`,
    finalOffer: (offer) => `This is my final position: ${offer} points. Take it or walk away.`,
    acceptDemand: (points) => `Agreed. I accept your demand of ${points} points.`,
    acceptedBotOffer: (points) => `Deal finalized at ${points} points.`
  },
  unpleasant: {
    open: (offer) => `Opening position: you receive ${offer} points. Accept, or propose your counter.`,
    concession: (offer) => `Your demand is too demanding. I can only move to ${offer} points.`,
    finalOffer: (offer) => `No further room for concessions. Final offer is ${offer} points.`,
    acceptDemand: (points) => `Acceptable terms. Deal recorded at ${points} points.`,
    acceptedBotOffer: (points) => `Deal locked at ${points} points.`
  }
};

/**
 * Returns a randomized configuration tailored to the reported mood and round
 */
function getBotConfig(mood) {
  const normalized = (mood || 'neutral').toLowerCase().trim();
  let key = 'neutral';
  if (normalized.includes('unpleas') || normalized === 'negative') {
    key = 'unpleasant';
  } else if (normalized.includes('pleas') || normalized === 'positive') {
    key = 'pleasant';
  }

  const range = RANGES[key];
  const openOffer = getRandomInt(range.openOfferMin, range.openOfferMax);
  const botReservationLimit = getRandomInt(range.reservationLimitMin, range.reservationLimitMax);
  const concessionStep = getRandomChoice(range.concessionSteps);

  return {
    conditionKey: key,
    difficulty: range.difficulty,
    pool: range.pool,
    openOffer,
    botReservationLimit,
    concessionStep,
    maxCounters: range.maxCounters,
    roundTimeoutSeconds: range.roundTimeoutSeconds,
    initialDialogue: PHRASES[key].open(openOffer),
    botPhrases: PHRASES[key]
  };
}

/**
 * Evaluates a participant's counter demand
 */
function evaluateCounterDemand(mood, demand, currentBotOffer, counterCount, activeReservationLimit, activeConcessionStep) {
  const config = getBotConfig(mood);
  const numericDemand = Math.round(Number(demand));
  const reservationLimit = activeReservationLimit ? Number(activeReservationLimit) : config.botReservationLimit;
  const concessionStep = activeConcessionStep ? Number(activeConcessionStep) : config.concessionStep;

  // Sanity check
  if (isNaN(numericDemand) || numericDemand < 0 || numericDemand > config.pool) {
    return {
      error: `Demand must be between 0 and ${config.pool}.`
    };
  }

  const nextCounterCount = counterCount + 1;

  // Rule 1: Bot accepts demand if it is within its reservation limit
  if (numericDemand <= reservationLimit) {
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
      botOffer: reservationLimit,
      dialogue: config.botPhrases.finalOffer(reservationLimit),
      counterCount: nextCounterCount,
      isFinal: true
    };
  }

  // Rule 3: Bot makes a concession towards its reservation limit
  const nextOffer = Math.min(
    reservationLimit,
    currentBotOffer + concessionStep
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
  RANGES,
  CONFIGS: RANGES,
  getBotConfig,
  evaluateCounterDemand,
  calculateTrialMetrics
};
