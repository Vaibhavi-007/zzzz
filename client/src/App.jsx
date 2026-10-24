import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TopPointerGauge from './components/TopPointerGauge';
import Onboarding from './components/Onboarding';
import StimulusViewer from './components/StimulusViewer';
import LikertRating from './components/LikertRating';
import NegotiateWire from './components/NegotiateWire';
import DebriefSummary from './components/DebriefSummary';
import ResearcherDashboard from './components/ResearcherDashboard';
import { api } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('task'); // 'task' | 'analytics'
  const [stage, setStage] = useState('onboarding'); // 'onboarding' | 'stimulus' | 'rating' | 'game' | 'summary'

  // Session & Trial State
  const [session, setSession] = useState(null);
  const [stimulus, setStimulus] = useState(null);
  const [botConfig, setBotConfig] = useState(null);
  const [reportedMood, setReportedMood] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [trials, setTrials] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetGoal = session?.targetPoints || 500;
  const maxRounds = 10;

  // 1. Participant starts study
  const handleStartStudy = async ({ participantId, condition, stimulusType, targetPoints }) => {
    try {
      setIsStarting(true);
      const res = await api.startSession({
        participantId,
        condition,
        stimulusType,
        targetPoints
      });

      setSession(res.session);
      setStimulus(res.stimulus);
      setTotalPoints(0);
      setCurrentRound(1);
      setTrials([]);
      setReportedMood(null);
      setStage('stimulus');
    } catch (err) {
      alert(`Could not start session: ${err.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  // 2. Participant finishes observing stimulus
  const handleStimulusComplete = (stimulusData) => {
    setStage('rating');
  };

  // 3. Participant submits Likert mood rating
  const handleMoodSubmit = async ({ reportedMood, likertScore, latencyMs }) => {
    try {
      setIsSubmitting(true);
      const res = await api.rateMood(session.sessionId, {
        reportedMood,
        likertScore,
        latencyMs
      });

      setReportedMood(reportedMood);
      setBotConfig(res.botConfig);
      setSession(res.session);
      setStage('game');
    } catch (err) {
      alert(`Could not record mood rating: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Participant sends counter-demand on the Negotiate Wire
  const handleSendDemand = async ({
    demand,
    currentBotOffer,
    counterCount,
    latencyMs,
    activeReservationLimit,
    activeConcessionStep
  }) => {
    return await api.sendCounter(session.sessionId, {
      demand,
      currentBotOffer,
      counterCount,
      latencyMs,
      activeReservationLimit,
      activeConcessionStep
    });
  };

  // 5. Participant accepts bot offer or bot accepts demand
  const handleRoundComplete = async (roundData) => {
    try {
      const res = await api.recordRound(session.sessionId, roundData);
      const newTotal = res.currentTotalPoints;

      setTotalPoints(newTotal);
      setTrials((prev) => [...prev, res.trial]);

      // Check if target points achieved (500 pts) or max rounds completed
      if (res.targetReached || currentRound >= maxRounds) {
        // Finalize study session
        const finalRes = await api.completeSession(session.sessionId);
        setSession(finalRes.session);
        setStage('summary');
      } else {
        if (res.nextRoundBotConfig) {
          setBotConfig({ ...res.nextRoundBotConfig, _freshRandom: true });
        }
        // Advance to next negotiation round
        setCurrentRound((r) => r + 1);
      }
    } catch (err) {
      console.error(err);
      alert('Error recording round results.');
    }
  };

  // 6. Round timeout handler
  const handleRoundTimeout = async ({ roundNumber, durationMs, counterCount }) => {
    await handleRoundComplete({
      roundNumber,
      agreedPoints: 0,
      finalOutcome: 'timeout',
      roundDurationMs: durationMs,
      firstActionLatencyMs: 0,
      countersExchanged: counterCount,
      lastBotOffer: 0
    });
  };

  // Restart study for a new participant
  const handleRestart = () => {
    setSession(null);
    setStimulus(null);
    setBotConfig(null);
    setReportedMood(null);
    setCurrentRound(1);
    setTotalPoints(0);
    setTrials([]);
    setStage('onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Global Clinical Header */}
      <Header
        participantId={session?.participantId}
        condition={session?.condition}
        reportedMood={reportedMood}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Experiment / Analytics Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {currentView === 'analytics' ? (
          <ResearcherDashboard />
        ) : (
          <div>
            {/* Top Pointer Gauge: Visible during the Game and Summary stages */}
            {(stage === 'game' || stage === 'summary') && (
              <TopPointerGauge
                currentPoints={totalPoints}
                targetPoints={targetGoal}
              />
            )}

            {/* Stage 1: Onboarding & PID */}
            {stage === 'onboarding' && (
              <Onboarding
                onStartStudy={handleStartStudy}
                isStarting={isStarting}
              />
            )}

            {/* Stage 2: Standardized Stimulus Phase */}
            {stage === 'stimulus' && (
              <StimulusViewer
                stimulus={stimulus}
                condition={session?.condition}
                onComplete={handleStimulusComplete}
              />
            )}

            {/* Stage 3: Likert Mood Rating */}
            {stage === 'rating' && (
              <LikertRating
                onSubmitRating={handleMoodSubmit}
                disabled={isSubmitting}
              />
            )}

            {/* Stage 4: Video Game with the Negotiate Wire */}
            {stage === 'game' && botConfig && (
              <NegotiateWire
                roundNumber={currentRound}
                totalRounds={maxRounds}
                reportedMood={reportedMood}
                botConfig={botConfig}
                currentRoundPoints={totalPoints}
                onAcceptOffer={handleRoundComplete}
                onSendDemand={handleSendDemand}
                onTimeout={handleRoundTimeout}
              />
            )}

            {/* Stage 5: Debrief Summary */}
            {stage === 'summary' && (
              <DebriefSummary
                session={session}
                trials={trials}
                onRestart={handleRestart}
              />
            )}
          </div>
        )}
      </main>

      {/* Experimenter Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Affective Decision & Negotiation Behavioral Paradigm &copy; 2026</span>
          <span className="font-mono text-[11px] text-slate-400">
            Target: {targetGoal} pts | Stack: MERN (Mongo/Express/React/Node)
          </span>
        </div>
      </footer>
    </div>
  );
}
