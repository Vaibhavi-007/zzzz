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
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function ResearcherDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'comparison'

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

  const conditions = summary?.conditions || {};
  const pleasant = conditions.pleasant || {};
  const neutral = conditions.neutral || {};
  const unpleasant = conditions.unpleasant || {};

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-medium px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 mb-2">
            <Database className="w-3.5 h-3.5" />
            Empirical Telemetry & Comparative Analytics
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Affective Negotiation Experiment Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time evaluation of Run Time and Negotiation Accuracy conditioned on participant emotional valence.
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

      {/* Main Condition Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pleasant Condition */}
        <div className="bg-white border-2 border-emerald-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 mb-4">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-700">
                Condition 1
              </span>
              <h3 className="text-base font-bold text-slate-900">Pleasant (Easy Bot)</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              {pleasant.totalTrials || 0} trials
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Average Run Time:</span>
              <span className="font-mono text-base font-bold text-slate-900">
                {pleasant.avgRunTimeSec || 0}s
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Negotiation Accuracy:</span>
              <span className="font-mono text-base font-bold text-emerald-700">
                {pleasant.avgAccuracyPercent || 0}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Deal Speed:</span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {pleasant.avgDealSpeedPointsPerSec || 0} pts/s
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Target Reached Rate:</span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {pleasant.targetReachedRate || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Neutral Condition */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                Condition 2
              </span>
              <h3 className="text-base font-bold text-slate-900">Neutral (Moderate Bot)</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              {neutral.totalTrials || 0} trials
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Average Run Time:</span>
              <span className="font-mono text-base font-bold text-slate-900">
                {neutral.avgRunTimeSec || 0}s
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Negotiation Accuracy:</span>
              <span className="font-mono text-base font-bold text-slate-700">
                {neutral.avgAccuracyPercent || 0}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Deal Speed:</span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {neutral.avgDealSpeedPointsPerSec || 0} pts/s
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Target Reached Rate:</span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {neutral.targetReachedRate || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Unpleasant Condition */}
        <div className="bg-white border-2 border-rose-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-700">
                Condition 3
              </span>
              <h3 className="text-base font-bold text-slate-900">Unpleasant (Hard Bot)</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
              {unpleasant.totalTrials || 0} trials
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Average Run Time:</span>
              <span className="font-mono text-base font-bold text-slate-900">
                {unpleasant.avgRunTimeSec || 0}s
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Negotiation Accuracy:</span>
              <span className="font-mono text-base font-bold text-rose-700">
                {unpleasant.avgAccuracyPercent || 0}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Deal Speed:</span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {unpleasant.avgDealSpeedPointsPerSec || 0} pts/s
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Target Reached Rate:</span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {unpleasant.targetReachedRate || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Charts: Run Time & Accuracy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Mean Run Time by Condition */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-bold text-slate-900">
                Mean Negotiation Run Time (Seconds)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Lower = Faster Deals</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-4 pt-2">
            {/* Pleasant */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-700 font-semibold">Pleasant (Easy)</span>
                <span className="text-slate-900 font-bold">{pleasant.avgRunTimeSec || 0}s</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, ((pleasant.avgRunTimeSec || 0) / 40) * 100)}%` }}
                />
              </div>
            </div>

            {/* Neutral */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-700 font-semibold">Neutral (Moderate)</span>
                <span className="text-slate-900 font-bold">{neutral.avgRunTimeSec || 0}s</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, ((neutral.avgRunTimeSec || 0) / 40) * 100)}%` }}
                />
              </div>
            </div>

            {/* Unpleasant */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-700 font-semibold">Unpleasant (Hard)</span>
                <span className="text-slate-900 font-bold">{unpleasant.avgRunTimeSec || 0}s</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, ((unpleasant.avgRunTimeSec || 0) / 40) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Negotiation Accuracy by Condition */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-bold text-slate-900">
                Negotiation Accuracy / Efficiency (%)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Higher = Closer to Optimal</span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Pleasant */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-700 font-semibold">Pleasant (Easy)</span>
                <span className="text-slate-900 font-bold">{pleasant.avgAccuracyPercent || 0}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${pleasant.avgAccuracyPercent || 0}%` }}
                />
              </div>
            </div>

            {/* Neutral */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-700 font-semibold">Neutral (Moderate)</span>
                <span className="text-slate-900 font-bold">{neutral.avgAccuracyPercent || 0}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${neutral.avgAccuracyPercent || 0}%` }}
                />
              </div>
            </div>

            {/* Unpleasant */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-700 font-semibold">Unpleasant (Hard)</span>
                <span className="text-slate-900 font-bold">{unpleasant.avgAccuracyPercent || 0}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${unpleasant.avgAccuracyPercent || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
