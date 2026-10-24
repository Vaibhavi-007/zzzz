import React, { useState, useEffect, useRef } from 'react';
import { Smile, Meh, Frown, Check, ArrowRight } from 'lucide-react';

export default function LikertRating({ onSubmitRating, disabled = false }) {
  const [selectedMood, setSelectedMood] = useState(null); // 'pleasant' | 'neutral' | 'unpleasant'
  const [fineValence, setFineValence] = useState(4); // 1 to 7 Likert
  const mountTimeRef = useRef(null);

  useEffect(() => {
    mountTimeRef.current = performance.now();
  }, []);

  const handleSelectPrimary = (mood) => {
    setSelectedMood(mood);
    if (mood === 'pleasant') setFineValence(6);
    else if (mood === 'unpleasant') setFineValence(2);
    else setFineValence(4);
  };

  const handleSubmit = () => {
    if (!selectedMood || disabled) return;

    const latencyMs = mountTimeRef.current
      ? Math.round(performance.now() - mountTimeRef.current)
      : 0;

    onSubmitRating({
      reportedMood: selectedMood,
      likertScore: fineValence,
      latencyMs
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs max-w-2xl mx-auto">
      {/* Title & Instructions */}
      <div className="text-center mb-8">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Manipulation Check & Mood Assessment
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-3">
          How do you feel right now?
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
          Please indicate your immediate affective state on the Likert scale below.
        </p>
      </div>

      {/* Primary 3-Anchor Likert Scale */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Unpleasant */}
        <button
          type="button"
          onClick={() => handleSelectPrimary('unpleasant')}
          className={`flex flex-col items-center p-5 rounded-xl border-2 transition-all text-center ${
            selectedMood === 'unpleasant'
              ? 'border-rose-500 bg-rose-50/70 shadow-sm scale-102'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
            <Frown className="w-7 h-7" />
          </div>
          <div className="text-sm font-bold text-slate-900">Unpleasant</div>
          <p className="text-xs text-slate-500 mt-1">
            Distressed, dissatisfied, or tense
          </p>
          <div className="mt-3 text-[11px] font-mono text-rose-600 font-semibold">
            Scale: 1 – 3
          </div>
        </button>

        {/* Neutral */}
        <button
          type="button"
          onClick={() => handleSelectPrimary('neutral')}
          className={`flex flex-col items-center p-5 rounded-xl border-2 transition-all text-center ${
            selectedMood === 'neutral'
              ? 'border-amber-500 bg-amber-50/70 shadow-sm scale-102'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <Meh className="w-7 h-7" />
          </div>
          <div className="text-sm font-bold text-slate-900">Neutral</div>
          <p className="text-xs text-slate-500 mt-1">
            Indifferent, calm, or baseline
          </p>
          <div className="mt-3 text-[11px] font-mono text-amber-600 font-semibold">
            Scale: 4
          </div>
        </button>

        {/* Pleasant */}
        <button
          type="button"
          onClick={() => handleSelectPrimary('pleasant')}
          className={`flex flex-col items-center p-5 rounded-xl border-2 transition-all text-center ${
            selectedMood === 'pleasant'
              ? 'border-emerald-500 bg-emerald-50/70 shadow-sm scale-102'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <Smile className="w-7 h-7" />
          </div>
          <div className="text-sm font-bold text-slate-900">Pleasant</div>
          <p className="text-xs text-slate-500 mt-1">
            Joyful, content, or uplifted
          </p>
          <div className="mt-3 text-[11px] font-mono text-emerald-600 font-semibold">
            Scale: 5 – 7
          </div>
        </button>
      </div>

      {/* Granular 7-Point Likert Slider */}
      {selectedMood && (
        <div className="mb-8 p-5 bg-slate-50 rounded-xl border border-slate-200 transition-all">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-3">
            <span>Granular Affective Valence Rating:</span>
            <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-900">
              Level {fineValence} of 7
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="7"
            step="1"
            value={fineValence}
            onChange={(e) => setFineValence(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2 px-1">
            <span>1 (Very Unpleasant)</span>
            <span>4 (Neutral)</span>
            <span>7 (Very Pleasant)</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="button"
          disabled={!selectedMood || disabled}
          onClick={handleSubmit}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-xs tracking-wide shadow-xs active:translate-y-0.5 transition-all"
        >
          <span>Confirm Rating & Proceed to Negotiation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
