import React from 'react';
import { Target, Award, CheckCircle2 } from 'lucide-react';

export default function TopPointerGauge({ currentPoints = 0, targetPoints = 500 }) {
  const percentage = Math.min(100, Math.max(0, (currentPoints / targetPoints) * 100));
  const isTargetAchieved = currentPoints >= targetPoints;
  const pointsRemaining = Math.max(0, targetPoints - currentPoints);

  const ticks = [0, 100, 200, 300, 400, 500];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-6">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Master Target Accumulator
            </div>
            <div className="text-lg font-bold text-slate-900 flex items-baseline gap-2">
              <span className="font-mono-num text-2xl text-slate-900">{currentPoints}</span>
              <span className="text-sm font-normal text-slate-500">/ {targetPoints} pts</span>
            </div>
          </div>
        </div>

        {/* Milestone Status */}
        <div>
          {isTargetAchieved ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-xs shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Target Achieved ({currentPoints} pts)!</span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500">Target Deficit:</span>
              <div className="text-sm font-semibold text-slate-800 font-mono-num">
                {pointsRemaining} pts needed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calibrated Gauge with Top Pointer */}
      <div className="relative pt-6 pb-2">
        {/* Moving Pointer Needle at the top of the bar */}
        <div
          className="absolute top-0 transition-all duration-500 ease-out flex flex-col items-center -translate-x-1/2 z-20 pointer-events-none"
          style={{ left: `${percentage}%` }}
        >
          {/* Pointer Value Bubble */}
          <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-mono-num font-semibold shadow-xs whitespace-nowrap mb-0.5">
            {currentPoints} pts
          </span>
          {/* Pointer Needle Arrow */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-900"></div>
        </div>

        {/* Progress Track */}
        <div className="relative h-4 bg-slate-100 rounded-full border border-slate-300/80 overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isTargetAchieved
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Target Finish Notch Line */}
        <div className="absolute right-0 top-6 bottom-2 w-0.5 bg-rose-500 z-10" />

        {/* Calibrated Tick Marks Below */}
        <div className="relative flex justify-between mt-2 px-0.5">
          {ticks.map((tick) => {
            const tickPct = (tick / targetPoints) * 100;
            return (
              <div key={tick} className="flex flex-col items-center">
                <div className="w-0.5 h-1.5 bg-slate-300 mb-1" />
                <span className="text-[11px] font-mono-num text-slate-500 font-medium">
                  {tick}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
