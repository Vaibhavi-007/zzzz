import React, { useState } from 'react';
import { Target, Play, Shield, SlidersHorizontal, Info, Sparkles } from 'lucide-react';

export default function Onboarding({ onStartStudy, isStarting = false }) {
  const [pid, setPid] = useState(`PARTICIPANT-${Math.floor(100 + Math.random() * 900)}`);
  const [condition, setCondition] = useState('random'); // 'random' | 'pleasant' | 'neutral' | 'unpleasant'
  const [stimulusType, setStimulusType] = useState('video'); // 'video' | 'photo'
  const [targetPoints, setTargetPoints] = useState(500);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pid.trim() || isStarting) return;

    onStartStudy({
      participantId: pid.trim(),
      condition: condition === 'random' ? undefined : condition,
      stimulusType,
      targetPoints: Number(targetPoints) || 500
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
      {/* Protocol Header */}
      <div className="border-b border-slate-100 pb-6 mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700 mb-3">
          <Shield className="w-3.5 h-3.5" />
          Protocol ID: EXP-EMO-NEG-2026
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Experimental Negotiation Study
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          In this session, you will view standardized emotion-evoking stimulus material, report your feelings on a Likert scale, and then engage in an interactive negotiation game on a bargaining wire to attain a cumulative target of <strong>500 points</strong>.
        </p>
      </div>

      {/* Task Guidelines Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 mb-6 text-xs text-slate-700 space-y-2.5">
        <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm">
          <Info className="w-4 h-4 text-slate-600" />
          Instructions & Sequence:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">1. Stimulus Phase</span>
            Watch a standardized photo or video clip carefully.
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">2. Likert Rating</span>
            Rate your mood from Pleasant, Neutral, to Unpleasant.
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">3. The Negotiate Wire</span>
            Bargain for points across rounds to reach 500 points!
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

        {/* Researcher Config Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Experimental Parameters' : 'Configure Experimental Parameters (Researcher Override)'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Condition Assignment:
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium"
                  >
                    <option value="random">Randomized Condition (Double-Blind)</option>
                    <option value="pleasant">Pleasant (Easy Negotiation Bot)</option>
                    <option value="neutral">Neutral (Moderate Negotiation Bot)</option>
                    <option value="unpleasant">Unpleasant (Hard Negotiation Bot)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stimulus Material Type:
                  </label>
                  <select
                    value={stimulusType}
                    onChange={(e) => setStimulusType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium"
                  >
                    <option value="video">Standardized Video Clip</option>
                    <option value="photo">Standardized Photographic Image</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Point Accumulator:
                </label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  step="50"
                  value={targetPoints}
                  onChange={(e) => setTargetPoints(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-mono"
                />
                <span className="ml-2 text-slate-500">points</span>
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
            <span>{isStarting ? 'Initializing Trial...' : 'Begin Experimental Protocol'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
