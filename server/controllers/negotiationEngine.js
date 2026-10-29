/**
 * Negotiation Engine for Behavioral Economics Experiment
 *
 * Mechanics:
 * - Standard pool of 100 points per round.
 * - Dynamic randomized opening offers and reservation limits per round.
 * - Rejection Rule: The bot automatically rejects any participant counter-offer
 *   if the proposed demand is >= 10 points more than the previous offer, OR
 *   >= 15% more than the previous offer.
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const BASE_CONFIG = {
  pool: 100,
  openOfferMin: 28,
  openOfferMax: 38,
  reservationLimitMin: 58,
  reservationLimitMax: 68,
  concessionSteps: [4, 5, 6],
  maxCounters: 4,
  roundTimeoutSeconds: 90
};

/**
 * Returns a randomized bot configuration for a negotiation round.
 * If minAllowedOffer is provided (e.g. from initial round), the opening offer
 * for any following round is guaranteed to be >= minAllowedOffer.
 */
function getBotConfig(minAllowedOffer) {
  const floor = minAllowedOffer ? Math.round(Number(minAllowedOffer)) : BASE_CONFIG.openOfferMin;
  const minOffer = Math.max(floor, BASE_CONFIG.openOfferMin);
  const maxOffer = Math.max(minOffer + 4, BASE_CONFIG.openOfferMax);

  const openOffer = getRandomInt(minOffer, maxOffer);
  const botReservationLimit = getRandomInt(
    Math.max(openOffer + 15, BASE_CONFIG.reservationLimitMin),
    Math.max(openOffer + 25, BASE_CONFIG.reservationLimitMax)
  );
  const concessionStep = getRandomChoice(BASE_CONFIG.concessionSteps);

  return {
    pool: BASE_CONFIG.pool,
    openOffer,
    botReservationLimit,
    concessionStep,
    maxCounters: BASE_CONFIG.maxCounters,
    roundTimeoutSeconds: BASE_CONFIG.roundTimeoutSeconds,
    initialDialogue: `My opening offer this round is ${openOffer} points for you. Accept, or propose your counter-demand on the wire.`
  };
}

/**
 * Evaluates a participant's counter demand.
 *
 * Rejection Rule:
 * The bot automatically REJECTS the participant's offer if:
 *   1. Demand is >= 10 points more than the previous offer (diff >= 10)
 *      OR
 *   2. Demand is >= 15% more than the previous offer (pctDiff >= 0.15)
 */
function evaluateCounterDemand(demand, currentBotOffer, counterCount, activeReservationLimit, activeConcessionStep) {
  const numericDemand = Math.round(Number(demand));
  const prevOffer = Math.round(Number(currentBotOffer));
  const reservationLimit = activeReservationLimit ? Number(activeReservationLimit) : 60;
  const concessionStep = activeConcessionStep ? Number(activeConcessionStep) : 5;
  const maxCounters = BASE_CONFIG.maxCounters;

  // Sanity check
  if (isNaN(numericDemand) || numericDemand < 0 || numericDemand > BASE_CONFIG.pool) {
    return {
      error: `Demand must be between 0 and ${BASE_CONFIG.pool}.`
    };
  }

  const nextCounterCount = counterCount + 1;

  // Calculate difference from previous offer
  const diff = numericDemand - prevOffer;
  const pctDiff = prevOffer > 0 ? (diff / prevOffer) : 0;

  // Rejection condition: 10 more than previous offer OR 15% more than previous offer
  const isTenMore = diff >= 10;
  const isFifteenPercentMore = pctDiff >= 0.15;
  const shouldReject = isTenMore || isFifteenPercentMore;

  // 1. REJECTION RULE
  if (shouldReject) {
    const isFinal = nextCounterCount >= maxCounters;
    let reasonText = '';
    if (isTenMore && isFifteenPercentMore) {
      reasonText = `exceeds previous offer by ${diff} pts (+${Math.round(pctDiff * 100)}%), which is both 10+ points and 15%+ above ${prevOffer} pts`;
    } else if (isTenMore) {
      reasonText = `is ${diff} pts higher than previous offer of ${prevOffer} pts (exceeds +10 pts threshold)`;
    } else {
      reasonText = `is ${Math.round(pctDiff * 100)}% higher than previous offer of ${prevOffer} pts (exceeds +15% threshold)`;
    }

    const dialogue = isFinal
      ? `No. Offer rejected! Your demand of ${numericDemand} points ${reasonText}. Turn limit reached. Accept my standing offer of ${prevOffer} points or the round concludes without a deal.`
      : `No. Offer rejected! Your demand of ${numericDemand} points ${reasonText}. I will not accept an increase of 10+ points or 15%+ over the previous offer. My standing offer remains ${prevOffer} points.`;

    return {
      action: 'bot_rejected',
      isDeal: false,
      isRejected: true,
      botDecision: 'NO',
      botOffer: prevOffer, // Bot stands firm at current offer without conceding
      rejectionReason: reasonText,
      diff,
      pctDiff: Math.round(pctDiff * 100),
      dialogue,
      counterCount: nextCounterCount,
      isFinal
    };
  }

  // 2. Bot accepts demand if it is within reservation limit (and passed rejection check)
  if (numericDemand <= reservationLimit) {
    return {
      action: 'accept_demand',
      isDeal: true,
      isRejected: false,
      agreedPoints: numericDemand,
      botPoints: BASE_CONFIG.pool - numericDemand,
      botOffer: numericDemand,
      dialogue: `Agreed! I accept your counter-demand of ${numericDemand} points. Deal confirmed!`,
      counterCount: nextCounterCount,
      isFinal: false
    };
  }

  // 3. Final offer if counter limit reached
  if (nextCounterCount >= maxCounters) {
    return {
      action: 'final_offer',
      isDeal: false,
      isRejected: false,
      botOffer: reservationLimit,
      dialogue: `This is my final position: ${reservationLimit} points. Take it or walk away.`,
      counterCount: nextCounterCount,
      isFinal: true
    };
  }

  // 4. Bot makes a concession towards reservation limit
  const nextOffer = Math.min(
    reservationLimit,
    prevOffer + concessionStep
  );

  return {
    action: 'counter_offer',
    isDeal: false,
    isRejected: false,
    botOffer: nextOffer,
    dialogue: `I can adjust my terms: I offer you ${nextOffer} points. Accept or propose a counter.`,
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
  BASE_CONFIG,
  getBotConfig,
  evaluateCounterDemand,
  calculateTrialMetrics
};
