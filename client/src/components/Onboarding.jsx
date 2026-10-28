import React, { useState } from 'react';
import { Target, Play, Shield, SlidersHorizontal, Info } from 'lucide-react';

export default function Onboarding({ onStartStudy, isStarting = false }) {
  const [pid, setPid] = useState(`PARTICIPANT-${Math.floor(100 + Math.random() * 900)}`);
  const [targetPoints, setTargetPoints] = useState(500);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pid.trim() || isStarting) return;

    onStartStudy({
      participantId: pid.trim(),
      targetPoints: Number(targetPoints) || 500
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
      {/* Protocol Header */}
      <div className="border-b border-slate-100 pb-6 mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700 mb-3">
          <Shield className="w-3.5 h-3.5" />
          Protocol ID: EXP-NEG-2026
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Behavioral Negotiation Study
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          In this experiment, you will play an interactive negotiation game on a bargaining wire against an automated bot. Your objective is to negotiate points across rounds to reach a cumulative target of <strong>{targetPoints} points</strong>.
        </p>
      </div>

      {/* Task Guidelines Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 mb-6 text-xs text-slate-700 space-y-2.5">
        <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm">
          <Info className="w-4 h-4 text-slate-600" />
          Game Rules & Dynamics:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">1. The Negotiate Wire</span>
            Each round splits 100 points. The bot marks its offer; you position your demand.
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-rose-700 block mb-1">2. Bot Rejection Rule</span>
            The bot rejects any demand that is <strong>10+ points</strong> or <strong>15%+ higher</strong> than the previous offer.
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-emerald-700 block mb-1">3. Target Goal</span>
            Strike deals to accumulate <strong>{targetPoints} points</strong> across rounds as fast and accurately as possible.
          </div>
        </div>
      </div>

      {/* Start Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Participant Identifier (PID)
          </label>
          <input
            type="text"
            required
            value={pid}
            onChange={(e) => setPid(e.target.value)}
            placeholder="e.g. PARTICIPANT-101"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
          />
        </div>

        {/* Experimenter Settings Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Experiment Target Settings' : 'Configure Experiment Target Settings'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Master Target Point Accumulator:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    step="50"
                    value={targetPoints}
                    onChange={(e) => setTargetPoints(Number(e.target.value))}
                    className="w-32 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-mono"
                  />
                  <span className="text-slate-500">points</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isStarting || !pid.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-sm shadow-xs active:translate-y-0.5 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isStarting ? 'Initializing Trial...' : 'Start Negotiation Task'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
