import React from 'react';
import { Activity, ShieldCheck, BarChart3, FlaskConical, Play } from 'lucide-react';

export default function Header({
  participantId,
  condition,
  reportedMood,
  currentView,
  onViewChange,
  isMongoOnline = false
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Lab Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
            BDL
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-none flex items-center gap-2">
              Affective Decision & Negotiation Study
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                v2.4
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cognitive Science & Behavioral Economics Experimental Protocol
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          {participantId && (
            <div className="flex items-center text-xs font-mono bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700">
              <span className="text-slate-400 mr-1.5">PID:</span>
              <span className="font-semibold text-slate-900">{participantId}</span>
            </div>
          )}

          {reportedMood && reportedMood !== 'pending' && (
            <div className={`text-xs font-medium px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
              reportedMood === 'pleasant'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : reportedMood === 'unpleasant'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              Mood: <span className="capitalize font-semibold">{reportedMood}</span>
            </div>
          )}

          {/* View Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center text-xs">
            <button
              onClick={() => onViewChange('task')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                currentView === 'task'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Experiment Task
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                currentView === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Researcher Analytics
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
