import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Target,
  Download,
  RotateCcw,
  Zap,
  BarChart,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';

export default function DebriefSummary({
  session,
  trials = [],
  onRestart
}) {
  const targetReached = session?.targetReached;
  const totalPoints = session?.totalPointsWon || 0;
  const targetPoints = session?.targetPoints || 500;
  const totalDurationMs = session?.totalNegotiationDurationMs || 0;
  const totalDurationSec = (totalDurationMs / 1000).toFixed(1);

  // Calculate average accuracy
  const validTrials = trials.filter((t) => t.accuracyRatio !== undefined);
  const avgAccuracyPercent = validTrials.length > 0
    ? Math.round(
        (validTrials.reduce((sum, t) => sum + t.accuracyRatio, 0) / validTrials.length) * 100
      )
    : 0;

  // Average deal speed
  const avgDealSpeed = validTrials.length > 0
    ? (validTrials.reduce((sum, t) => sum + (t.dealSpeedPointsPerSec || 0), 0) / validTrials.length).toFixed(1)
    : '0';

  const downloadSessionCSV = () => {
    window.open(api.getExportCsvUrl(), '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
      {/* Banner */}
      <div className="text-center pb-6 border-b border-slate-100">
        <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 shadow-xs ${
          targetReached
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : 'bg-slate-100 text-slate-700 border border-slate-200'
        }`}>
          {targetReached ? (
            <Award className="w-8 h-8" />
          ) : (
            <Target className="w-8 h-8" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Experimental Task Concluded
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Participant PID: <span className="font-mono font-semibold">{session?.participantId}</span>
        </p>
      </div>

      {/* Target Status Callout */}
      <div className={`my-6 p-4 rounded-xl border flex items-center justify-between ${
        targetReached
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          : 'bg-amber-50/80 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-current shrink-0" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider">
              Cumulative Target Goal:
            </div>
            <div className="text-base font-bold">
              {targetReached ? `Target Attained (${totalPoints} / ${targetPoints} pts)` : `Target Missed (${totalPoints} / ${targetPoints} pts)`}
            </div>
          </div>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-white border border-current font-semibold">
          {session?.reportedMood ? `Mood: ${session.reportedMood.toUpperCase()}` : ''}
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* Total Points */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium">Points Won</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1">
            {totalPoints}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target: {targetPoints} pts</div>
        </div>

        {/* Run Time */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium">Total Run Time</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1">
            {totalDurationSec}s
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{(totalDurationMs / 60000).toFixed(1)} mins elapsed</div>
        </div>

        {/* Negotiation Accuracy */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium">Negotiation Accuracy</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1">
            {avgAccuracyPercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pareto efficiency</div>
        </div>

        {/* Deal Speed */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium">Negotiation Speed</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1">
            {avgDealSpeed}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">points / second</div>
        </div>
      </div>

      {/* Trial breakdown mini-table */}
      {trials.length > 0 && (
        <div className="mb-8">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Round-by-Round Behavioral Breakdown
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Round</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Points Won</th>
                  <th className="py-2.5 px-3">Run Time (s)</th>
                  <th className="py-2.5 px-3">Counters</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trials.map((t) => (
                  <tr key={t.roundNumber} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-800">#{t.roundNumber}</td>
                    <td className="py-2 px-3 text-slate-600">{t.finalOutcome}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{t.agreedPoints}</td>
                    <td className="py-2 px-3 text-slate-600">{(t.roundDurationMs / 1000).toFixed(1)}s</td>
                    <td className="py-2 px-3 text-slate-600">{t.countersExchanged}</td>
                    <td className="py-2 px-3 text-slate-800">
                      {Math.round((t.accuracyRatio || 0) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={downloadSessionCSV}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Download Experimental CSV Dataset</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Run Next Participant</span>
        </button>
      </div>
    </div>
  );
}
