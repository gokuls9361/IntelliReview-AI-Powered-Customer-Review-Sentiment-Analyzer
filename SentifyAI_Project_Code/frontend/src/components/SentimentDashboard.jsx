import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Minus,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { getDashboardStats } from '../services/api';

export default function SentimentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Error loading dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Aggregating sentiment dashboard metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
        {error || 'No statistics available.'}
      </div>
    );
  }

  const total = stats.total_reviews || 1;
  const posCount = stats.sentiment_distribution?.Positive || 0;
  const negCount = stats.sentiment_distribution?.Negative || 0;
  const neuCount = stats.sentiment_distribution?.Neutral || 0;

  const posPct = ((posCount / total) * 100).toFixed(1);
  const negPct = ((negCount / total) * 100).toFixed(1);
  const neuPct = ((neuCount / total) * 100).toFixed(1);

  // Net Sentiment Score (NSS) = % Positive - % Negative
  const netScore = (parseFloat(posPct) - parseFloat(negPct)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Executive Sentiment Analytics Dashboard</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Holistic overview of customer satisfaction, rating distributions, and temporal trends across all products.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{total}</span>
            <span className="text-xs text-slate-400 font-medium">analyzed reviews</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-emerald-600 font-semibold">
            <Activity className="w-3.5 h-3.5 mr-1" />
            <span>Active Dataset Sync</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Sentiment Score</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-black ${parseFloat(netScore) >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {netScore > 0 ? `+${netScore}` : netScore}
            </span>
            <span className="text-xs text-slate-400 font-medium">NSS Points</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Positive ({posPct}%) - Negative ({negPct}%)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Positive Sentiment</span>
            <ThumbsUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600">{posPct}%</span>
            <span className="text-xs text-slate-400 font-medium">({posCount} reviews)</span>
          </div>
          <div className="mt-3 text-xs text-emerald-700 font-medium">
            Satisfied customers
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Dissatisfaction Rate</span>
            <ThumbsDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-600">{negPct}%</span>
            <span className="text-xs text-slate-400 font-medium">({negCount} reviews)</span>
          </div>
          <div className="mt-3 text-xs text-rose-700 font-medium">
            Issues requiring attention
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sentiment Distribution Card */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Sentiment Class Breakdown</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
                  Positive ({posCount} reviews)
                </span>
                <span className="text-slate-800">{posPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-emerald-500 h-3 rounded-full transition-all duration-700" style={{ width: `${posPct}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
                  Neutral ({neuCount} reviews)
                </span>
                <span className="text-slate-800">{neuPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-amber-500 h-3 rounded-full transition-all duration-700" style={{ width: `${neuPct}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2"></span>
                  Negative ({negCount} reviews)
                </span>
                <span className="text-slate-800">{negPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-rose-500 h-3 rounded-full transition-all duration-700" style={{ width: `${negPct}%` }}></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 mt-4">
            Ratings 1–2 map to <strong>Negative</strong>, 3 stars to <strong>Neutral</strong>, and 4–5 stars to <strong>Positive</strong>.
          </div>
        </div>

        {/* 1-5 Star Rating Distribution */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Star Rating Distribution</span>
          </h3>

          <div className="space-y-3 pt-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.rating_distribution?.[stars] || 0;
              const pct = ((count / total) * 100).toFixed(1);
              return (
                <div key={stars} className="flex items-center space-x-3 text-xs">
                  <div className="w-16 flex items-center space-x-1 font-semibold text-slate-700">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${stars >= 4 ? 'bg-emerald-500' : stars === 3 ? 'bg-amber-400' : 'bg-rose-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-right text-slate-600 font-medium">
                    {count} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Trend */}
        <div className="lg:col-span-12 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Sentiment Trend Timeline</span>
          </h3>
          <p className="text-xs text-slate-500">
            Temporal fluctuation of positive and negative reviews over consecutive sampling periods.
          </p>

          <div className="grid grid-cols-5 gap-3 pt-2">
            {stats.timeline_trends?.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <span className="text-[11px] font-mono text-slate-400 block mb-2">{item.date}</span>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-600">+{item.positive} Pos</div>
                  <div className="text-xs font-bold text-amber-600">{item.neutral} Neu</div>
                  <div className="text-xs font-bold text-rose-600">-{item.negative} Neg</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
