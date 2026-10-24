import React, { useState, useEffect, useRef } from 'react';
import { Play, Eye, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function StimulusViewer({
  stimulus,
  condition = 'neutral',
  onComplete
}) {
  const [phase, setPhase] = useState('fixation'); // 'fixation' | 'stimulus'
  const [videoError, setVideoError] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    stimulus?.recommendedDurationSeconds || 8
  );

  const startTimeRef = useRef(null);

  // 1. Fixation cross countdown (1.5 seconds)
  useEffect(() => {
    const fixationTimer = setTimeout(() => {
      setPhase('stimulus');
      startTimeRef.current = performance.now();
    }, 1500);

    return () => clearTimeout(fixationTimer);
  }, []);

  // 2. Stimulus duration countdown
  useEffect(() => {
    if (phase !== 'stimulus') return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const handleFinishStimulus = () => {
    const elapsedMs = startTimeRef.current
      ? Math.round(performance.now() - startTimeRef.current)
      : (stimulus?.recommendedDurationSeconds || 8) * 1000;

    onComplete({
      stimulusId: stimulus?.id || `${condition}-stim`,
      stimulusType: stimulus?.type || 'video',
      exposureDurationMs: elapsedMs
    });
  };

  // Phase 1: Fixation Cross
  if (phase === 'fixation') {
    return (
      <div className="bg-slate-900 rounded-2xl min-h-[460px] flex flex-col items-center justify-center p-8 text-white shadow-lg">
        <div className="text-4xl font-light text-slate-300 font-mono select-none tracking-widest animate-pulse">
          +
        </div>
        <p className="text-xs text-slate-400 mt-6 tracking-wide">
          Focus on the crosshair...
        </p>
      </div>
    );
  }

  // Phase 2: Stimulus Presentation (Video or Photo with robust SVG fallback)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-400" />
          <span>Standardized Stimulus Material</span>
          <span className="text-slate-400">|</span>
          <span className="font-mono text-slate-300 capitalize">{stimulus?.type || 'Visual'}</span>
        </div>
        <div className="text-slate-300 font-mono">
          {timeRemaining > 0 ? `Minimum exposure: ${timeRemaining}s` : 'Exposure complete'}
        </div>
      </div>

      {/* Main Stimulus Window */}
      <div className="relative bg-slate-950 aspect-video max-h-[500px] flex items-center justify-center overflow-hidden">
        {stimulus?.type === 'video' && !videoError ? (
          <video
            src={stimulus.mediaUrl}
            autoPlay
            controls
            playsInline
            onError={() => setVideoError(true)}
            onEnded={handleFinishStimulus}
            className="w-full h-full object-contain"
          />
        ) : stimulus?.type === 'photo' && !videoError ? (
          <img
            src={stimulus.mediaUrl}
            alt={stimulus.title || 'Experimental stimulus'}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          /* High-Fidelity Affective Canvas Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-radial from-slate-900 to-slate-950">
            {condition === 'pleasant' ? (
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-amber-400/20 border-2 border-amber-300/40 flex items-center justify-center text-4xl shadow-lg">
                  ☀️
                </div>
                <h3 className="text-xl font-bold text-amber-200">
                  Golden Meadow & Morning Serenity
                </h3>
                <p className="text-sm text-slate-300 max-w-md">
                  Gentle golden sunlight warming a vibrant summer meadow with birdsong and calm breeze.
                </p>
              </div>
            ) : condition === 'unpleasant' ? (
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-4xl shadow-lg">
                  ⛈️
                </div>
                <h3 className="text-xl font-bold text-slate-200">
                  Harsh Storm & Heavy Turbulence
                </h3>
                <p className="text-sm text-slate-400 max-w-md">
                  Cold, torrential rain beating against crumbling concrete structures under an oppressive black sky.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-4xl shadow-lg">
                  ⏱️
                </div>
                <h3 className="text-xl font-bold text-slate-200">
                  Minimalist Architectural Geometry
                </h3>
                <p className="text-sm text-slate-400 max-w-md">
                  Steady, standard clockwork gears and regular geometric concrete forms in neutral lighting.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            {stimulus?.title || `${condition.toUpperCase()} Stimulus Trial`}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Please observe the stimulus carefully before answering how you feel.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFinishStimulus}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs active:translate-y-0.5 transition-all"
        >
          <span>Continue to Rating</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
