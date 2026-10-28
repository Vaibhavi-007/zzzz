import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Database,
  RefreshCw,
  Sparkles,
  Clock,
  Target,
  Zap,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export default function ResearcherDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalyticsSummary();
      setSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      await api.seedDemoData();
      await fetchAnalytics();
    } catch (err) {
      alert(err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleExportCSV = () => {
    window.open(api.getExportCsvUrl(), '_blank');
  };

  const overall = summary?.overall || {};
  const recentTrials = summary?.recentTrials || [];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-medium px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 mb-2">
            <Database className="w-3.5 h-3.5" />
            Empirical Telemetry & Analytics Portal
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Negotiation Study Performance Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time measurement of Run Time, Negotiation Accuracy, Bot Rejections, and Target Point Attainment.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeedDemo}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{seeding ? 'Seeding Pilot...' : 'Seed Pilot Data'}</span>
          </button>

          <button
            type="button"
            onClick={fetchAnalytics}
            className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs shadow-xs"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Dataset</span>
          </button>
        </div>
      </div>

      {/* Core Summary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Run Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Mean Run Time</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-900">
            {overall.avgRunTimeSec || 0}s
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Time per round to reach agreement
          </div>
        </div>

        {/* Negotiation Accuracy */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Negotiation Accuracy</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-emerald-700">
            {overall.avgAccuracyPercent || 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Pareto frontier efficiency
          </div>
        </div>

        {/* Deal Speed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Deal Speed</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-900">
            {overall.avgDealSpeedPointsPerSec || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Points earned per second
          </div>
        </div>

        {/* Target Reached Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Target Attainment</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-blue-700">
            {overall.targetReachedRate || 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Sessions reaching 500+ pts
          </div>
        </div>
      </div>

      {/* Rejection Rule Banner & Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Bot Rejection Rule Enforcement
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Demands exceeding the previous offer by <strong>10+ points</strong> OR <strong>15%+</strong> are systematically rejected by the bot without concession.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500">Total Trials: </span>
            <span className="font-bold text-slate-900">{summary?.totalTrialsCount || 0}</span>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500">Participants: </span>
            <span className="font-bold text-slate-900">{summary?.totalSessionsCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Trial Logs Table */}
      {recentTrials.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span>Recent Trial Telemetry Logs</span>
            <span className="text-xs font-mono text-slate-400 font-normal">Last {recentTrials.length} recorded rounds</span>
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Participant</th>
                  <th className="py-2.5 px-3">Round</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Points</th>
                  <th className="py-2.5 px-3">Run Time</th>
                  <th className="py-2.5 px-3">Counters</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {recentTrials.map((t, idx) => (
                  <tr key={t._id || idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-800">{t.participantId}</td>
                    <td className="py-2 px-3 text-slate-600">Round {t.roundNumber}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        t.finalOutcome === 'participant_accepted' || t.finalOutcome === 'bot_accepted_demand'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {t.finalOutcome}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">{t.agreedPoints}</td>
                    <td className="py-2 px-3 text-slate-600">{(t.roundDurationMs / 1000).toFixed(1)}s</td>
                    <td className="py-2 px-3 text-slate-600">{t.countersExchanged}</td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">
                      {Math.round((t.accuracyRatio || 0) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
