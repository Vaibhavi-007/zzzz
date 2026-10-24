import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Send,
  Zap,
  Shield,
  MessageSquare,
  Bot
} from 'lucide-react';

export default function NegotiateWire({
  roundNumber = 1,
  totalRounds = 10,
  reportedMood = 'neutral',
  botConfig,
  currentRoundPoints = 0,
  onAcceptOffer,
  onSendDemand,
  onTimeout,
  disabled = false
}) {
  const pool = botConfig?.pool || 100;
  const initialBotOffer = botConfig?.openOffer || 30;

  const [botOffer, setBotOffer] = useState(initialBotOffer);
  const [participantDemand, setParticipantDemand] = useState(
    Math.min(pool, initialBotOffer + 25)
  );
  const [counterCount, setCounterCount] = useState(0);
  const [botDialogue, setBotDialogue] = useState(
    botConfig?.initialDialogue || "I have placed my initial offer on the wire. Accept or propose your demand."
  );
  const [isFinalOffer, setIsFinalOffer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dealAnimation, setDealAnimation] = useState(false);

  // Reaction time & round time
  const [timeLeft, setTimeLeft] = useState(90);
  const roundStartTimeRef = useRef(Date.now());
  const offerShownTimeRef = useRef(performance.now());
  const firstActionTimeRef = useRef(null);

  // Sync state if round resets or initial botConfig loads
  useEffect(() => {
    if (botConfig) {
      setBotOffer(botConfig.openOffer);
      setParticipantDemand(Math.min(botConfig.pool, botConfig.openOffer + 25));
      setCounterCount(0);
      setIsFinalOffer(false);
      setBotDialogue(botConfig.initialDialogue);
      setTimeLeft(90);
      roundStartTimeRef.current = Date.now();
      offerShownTimeRef.current = performance.now();
      firstActionTimeRef.current = null;
    }
  }, [roundNumber, botConfig]);

  // Round countdown timer
  useEffect(() => {
    if (disabled || dealAnimation) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRoundTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [disabled, dealAnimation, roundNumber]);

  const handleRoundTimeout = () => {
    const durationMs = Date.now() - roundStartTimeRef.current;
    onTimeout({
      roundNumber,
      durationMs,
      counterCount
    });
  };

  // Participant accepts bot's offer
  const handleAccept = async () => {
    if (disabled || isSubmitting) return;

    const now = performance.now();
    const actionLatency = Math.round(now - offerShownTimeRef.current);
    if (!firstActionTimeRef.current) firstActionTimeRef.current = actionLatency;
    const totalDurationMs = Date.now() - roundStartTimeRef.current;

    setIsSubmitting(true);
    setDealAnimation(true);

    setTimeout(() => {
      onAcceptOffer({
        roundNumber,
        agreedPoints: botOffer,
        finalOutcome: 'participant_accepted',
        roundDurationMs: totalDurationMs,
        firstActionLatencyMs: firstActionTimeRef.current,
        countersExchanged: counterCount,
        lastBotOffer: botOffer
      });
      setIsSubmitting(false);
      setDealAnimation(false);
    }, 900);
  };

  // Participant submits counter-demand on the wire
  const handleProposeDemand = async () => {
    if (disabled || isSubmitting) return;

    const now = performance.now();
    const actionLatency = Math.round(now - offerShownTimeRef.current);
    if (!firstActionTimeRef.current) firstActionTimeRef.current = actionLatency;

    setIsSubmitting(true);

    try {
      const response = await onSendDemand({
        demand: participantDemand,
        currentBotOffer: botOffer,
        counterCount: counterCount,
        latencyMs: actionLatency
      });

      if (response?.error) {
        alert(response.error);
        setIsSubmitting(false);
        return;
      }

      setCounterCount(response.counterCount);

      if (response.isDeal) {
        // Demand accepted by bot!
        setDealAnimation(true);
        setBotDialogue(response.dialogue);
        setBotOffer(response.agreedPoints);

        const totalDurationMs = Date.now() - roundStartTimeRef.current;
        setTimeout(() => {
          onAcceptOffer({
            roundNumber,
            agreedPoints: response.agreedPoints,
            finalOutcome: 'bot_accepted_demand',
            roundDurationMs: totalDurationMs,
            firstActionLatencyMs: firstActionTimeRef.current,
            countersExchanged: response.counterCount,
            lastBotOffer: response.agreedPoints
          });
          setIsSubmitting(false);
          setDealAnimation(false);
        }, 1100);
      } else {
        // Bot countered or made final offer
        setBotOffer(response.botOffer);
        setBotDialogue(response.dialogue);
        setIsFinalOffer(response.isFinal);
        offerShownTimeRef.current = performance.now();
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Positions on the 0-100 wire
  const botOfferPct = (botOffer / pool) * 100;
  const participantDemandPct = (participantDemand / pool) * 100;
  const spreadStart = Math.min(botOfferPct, participantDemandPct);
  const spreadWidth = Math.abs(participantDemandPct - botOfferPct);

  // Mood badge styling
  const moodStyle =
    reportedMood === 'pleasant'
      ? { label: 'Easy (Cooperative Bot)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      : reportedMood === 'unpleasant'
      ? { label: 'Hard (Stubborn Bot)', color: 'text-rose-700 bg-rose-50 border-rose-200' }
      : { label: 'Moderate (Balanced Bot)', color: 'text-amber-700 bg-amber-50 border-amber-200' };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      {/* Round & Timer Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono-num">
            Round {roundNumber} of {totalRounds}
          </div>
          <div className={`text-xs font-medium px-2.5 py-1 rounded-md border ${moodStyle.color}`}>
            Dynamic Difficulty: <span className="font-semibold">{moodStyle.label}</span>
          </div>
        </div>

        {/* Round Countdown */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border font-mono-num text-sm font-semibold ${
            timeLeft <= 15
              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{timeLeft}s remaining</span>
          </div>
        </div>
      </div>

      {/* Bot Persona Dialogue Window */}
      <div className="mt-5 mb-7 bg-slate-50 border border-slate-200/80 rounded-lg p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Negotiation Bot
          </div>
          <div className="text-sm font-medium text-slate-800 mt-0.5 leading-relaxed">
            {botDialogue}
          </div>
        </div>
        {counterCount > 0 && (
          <div className="text-[11px] font-mono-num text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
            Turn {counterCount} / {botConfig?.maxCounters || 4}
          </div>
        )}
      </div>

      {/* ================= THE NEGOTIATE WIRE ================= */}
      <div className="my-8 px-2">
        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>0 Pts (Bot keeps 100)</span>
          </div>
          <div className="text-slate-700 font-bold tracking-normal text-sm">
            THE NEGOTIATION WIRE
          </div>
          <div className="flex items-center gap-1.5">
            <span>100 Pts (You take 100)</span>
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          </div>
        </div>

        {/* The Physical Wire Rail Container */}
        <div className="relative py-8">
          {/* Wire Background Cable */}
          <div className="h-2.5 bg-slate-200 rounded-full w-full relative shadow-inner overflow-hidden border border-slate-300">
            {/* Active Spread / Disagreement Zone on the Wire */}
            <div
              className={`absolute top-0 bottom-0 transition-all duration-300 ${
                dealAnimation
                  ? 'bg-emerald-500 animate-wire-pulse'
                  : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400 opacity-80'
              }`}
              style={{
                left: `${spreadStart}%`,
                width: `${Math.max(2, spreadWidth)}%`
              }}
            />
          </div>

          {/* Calibrated Wire Notches */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-1 pointer-events-none">
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => (
              <div key={tick} className="flex flex-col items-center">
                <div className={`w-0.5 ${tick % 20 === 0 ? 'h-3 bg-slate-400' : 'h-1.5 bg-slate-300'}`} />
                <span className="text-[10px] font-mono-num text-slate-400 mt-2 font-medium">
                  {tick}
                </span>
              </div>
            ))}
          </div>

          {/* BOT'S OFFER MARKER ON THE WIRE */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-400 ease-out z-20 flex flex-col items-center pointer-events-none"
            style={{ left: `${botOfferPct}%` }}
          >
            {/* Top Indicator Badge */}
            <div className="absolute -top-10 px-2 py-0.5 rounded bg-slate-800 text-white text-[11px] font-mono-num font-semibold shadow-xs whitespace-nowrap">
              Bot: {botOffer} pts
            </div>
            {/* Center Peg */}
            <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          </div>

          {/* PARTICIPANT'S DEMAND GRIP ON THE WIRE (Draggable / Slider) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-150 z-30 flex flex-col items-center"
            style={{ left: `${participantDemandPct}%` }}
          >
            {/* Bottom Indicator Badge */}
            <div className="absolute -bottom-10 px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-mono-num font-semibold shadow-xs whitespace-nowrap">
              Demand: {participantDemand} pts
            </div>
            {/* Grip Node */}
            <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>

          {/* Invisible interactive input slider overlay */}
          <input
            type="range"
            min="0"
            max={pool}
            value={participantDemand}
            disabled={disabled || isFinalOffer || isSubmitting}
            onChange={(e) => setParticipantDemand(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer z-40 h-full"
            aria-label="Negotiate Wire Participant Demand Slider"
          />
        </div>

        {/* Wire Spread Gap Summary */}
        <div className="mt-8 flex justify-between items-center text-xs text-slate-500 bg-slate-50 border border-slate-200/70 rounded-md px-3 py-2">
          <div>
            Bot Offers: <span className="font-semibold text-slate-800 font-mono-num">{botOffer} pts</span>
          </div>
          <div className="font-medium text-slate-600 flex items-center gap-1.5">
            <span>Bargaining Spread:</span>
            <span className="font-mono-num font-bold text-slate-900">
              {Math.abs(participantDemand - botOffer)} pts
            </span>
          </div>
          <div>
            Your Demand: <span className="font-semibold text-blue-600 font-mono-num">{participantDemand} pts</span>
          </div>
        </div>
      </div>

      {/* ================= CONTROLS & ACTIONS ================= */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        {/* Fine Adjustment Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Fine Adjust:</span>
          <button
            type="button"
            disabled={disabled || isFinalOffer || participantDemand <= 0}
            onClick={() => setParticipantDemand((p) => Math.max(0, p - 5))}
            className="px-2.5 py-1 text-xs font-mono-num font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
          >
            -5
          </button>
          <button
            type="button"
            disabled={disabled || isFinalOffer || participantDemand <= 0}
            onClick={() => setParticipantDemand((p) => Math.max(0, p - 1))}
            className="px-2.5 py-1 text-xs font-mono-num font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
          >
            -1
          </button>
          <input
            type="number"
            min="0"
            max={pool}
            value={participantDemand}
            disabled={disabled || isFinalOffer}
            onChange={(e) => setParticipantDemand(Math.min(pool, Math.max(0, Number(e.target.value))))}
            className="w-16 px-2 py-1 text-center font-mono-num text-xs font-semibold rounded border border-slate-300 bg-white"
          />
          <button
            type="button"
            disabled={disabled || isFinalOffer || participantDemand >= pool}
            onClick={() => setParticipantDemand((p) => Math.min(pool, p + 1))}
            className="px-2.5 py-1 text-xs font-mono-num font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
          >
            +1
          </button>
          <button
            type="button"
            disabled={disabled || isFinalOffer || participantDemand >= pool}
            onClick={() => setParticipantDemand((p) => Math.min(pool, p + 5))}
            className="px-2.5 py-1 text-xs font-mono-num font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
          >
            +5
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Send Demand Counter */}
          <button
            type="button"
            disabled={disabled || isFinalOffer || isSubmitting}
            onClick={handleProposeDemand}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs active:translate-y-0.5 transition-all disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5 text-slate-500" />
            <span>Propose Demand ({participantDemand} pts)</span>
          </button>

          {/* Accept Bot Offer */}
          <button
            type="button"
            disabled={disabled || isSubmitting}
            onClick={handleAccept}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:translate-y-0.5 transition-all disabled:opacity-40"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Accept Offer ({botOffer} pts)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
