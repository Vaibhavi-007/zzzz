import React, { useState } from 'react';
import Header from './components/Header';
import TopPointerGauge from './components/TopPointerGauge';
import Onboarding from './components/Onboarding';
import NegotiateWire from './components/NegotiateWire';
import DebriefSummary from './components/DebriefSummary';
import ResearcherDashboard from './components/ResearcherDashboard';
import { api } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('task'); // 'task' | 'analytics'
  const [stage, setStage] = useState('onboarding'); // 'onboarding' | 'game' | 'summary'

  // Session & Trial State
  const [session, setSession] = useState(null);
  const [botConfig, setBotConfig] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [trials, setTrials] = useState([]);
  const [isStarting, setIsStarting] = useState(false);

  const targetGoal = session?.targetPoints || 500;
  const maxRounds = 10;

  // 1. Participant starts study (Enters negotiation task directly)
  const handleStartStudy = async ({ participantId, targetPoints }) => {
    try {
      setIsStarting(true);
      const res = await api.startSession({
        participantId,
        targetPoints
      });

      setSession(res.session);
      setBotConfig(res.botConfig);
      setTotalPoints(0);
      setCurrentRound(1);
      setTrials([]);
      setStage('game');
    } catch (err) {
      alert(`Could not start session: ${err.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  // 2. Participant sends counter-demand on the Negotiate Wire
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

  // 3. Participant accepts bot offer or bot accepts demand
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

  // 4. Round timeout handler
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
    setBotConfig(null);
    setCurrentRound(1);
    setTotalPoints(0);
    setTrials([]);
    setStage('onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Global Header */}
      <Header
        participantId={session?.participantId}
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

            {/* Stage 2: Video Game with the Negotiate Wire */}
            {stage === 'game' && botConfig && (
              <NegotiateWire
                roundNumber={currentRound}
                totalRounds={maxRounds}
                botConfig={botConfig}
                currentRoundPoints={totalPoints}
                onAcceptOffer={handleRoundComplete}
                onSendDemand={handleSendDemand}
                onTimeout={handleRoundTimeout}
              />
            )}

            {/* Stage 3: Debrief Summary */}
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
          <span>Behavioral Negotiation & Decision Paradigm &copy; 2026</span>
          <span className="font-mono text-[11px] text-slate-400">
            Target: {targetGoal} pts | MERN Stack Application
          </span>
        </div>
      </footer>
    </div>
  );
}
