import React, { useState, useEffect } from 'react';
import { 
  Hash, 
  AlertTriangle, 
  Sparkles, 
  Tag, 
  Layers, 
  MessageSquareWarning 
} from 'lucide-react';
import { getKeywords } from '../services/api';

export default function KeywordTopicAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getKeywords();
        setData(res);
      } catch (err) {
        setError(err.message || 'Error fetching keyword data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Extracting n-grams and topic clusters from reviews...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
        {error || 'Unable to load keyword analysis.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Hash className="w-5 h-5 text-blue-600" />
          <span>Keyword & Frequently Mentioned Issues Miner</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Identifies critical customer complaints, recurrent hardware/service failures, and positive product delight factors using NLP n-gram extraction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Negative Issues & Complaints */}
        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Top Customer Complaints & Issues</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
              Needs Product Action
            </span>
          </div>

          <div className="space-y-2.5">
            {data.top_customer_issues?.map((issue, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-rose-200 text-rose-800 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 capitalize block">
                      "{issue.issue}"
                    </span>
                    <span className="text-[11px] text-rose-600 font-medium">
                      Category: {issue.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-rose-700 bg-rose-100 px-2 py-1 rounded-md">
                    {issue.occurrences} mentions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Positive Praise Highlights */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Top Positive Highlights & Praise</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Customer Delighters
            </span>
          </div>

          <div className="space-y-2.5">
            {data.top_positive_highlights?.map((high, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 capitalize block">
                      "{high.highlight}"
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      Feature: {high.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">
                    {high.occurrences} mentions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyword Frequency Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <span>High-Salience Sentiment Keywords</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-2">
                Positive Descriptors:
              </span>
              <div className="flex flex-wrap gap-2">
                {data.positive_keywords?.map((k, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <span>{k.word}</span>
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-200 text-[10px] font-bold">
                      {k.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block mb-2">
                Negative Descriptors:
              </span>
              <div className="flex flex-wrap gap-2">
                {data.negative_keywords?.map((k, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200"
                  >
                    <span>{k.word}</span>
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-200 text-[10px] font-bold">
                      {k.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
