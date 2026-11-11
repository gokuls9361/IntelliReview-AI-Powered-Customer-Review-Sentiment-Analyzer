import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Trophy, 
  TrendingUp, 
  ThumbsUp, 
  ThumbsDown, 
  Minus,
  Sparkles,
  Layers
} from 'lucide-react';
import { compareProducts } from '../services/api';

export default function ProductComparison() {
  const [comparison, setComparison] = useState(null);
  const [modelType, setModelType] = useState('distilbert');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchComparison() {
      setLoading(true);
      setError(null);
      try {
        const res = await compareProducts(modelType);
        setComparison(res.products || []);
      } catch (err) {
        setError(err.message || 'Error comparing products.');
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [modelType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <span>Cross-Product Sentiment Benchmarking</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Compare customer perception, Net Sentiment Scores (NSS), and aspect-level customer feedback across catalog products.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600">Model:</label>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className="p-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="distilbert">DistilBERT</option>
            <option value="bilstm">BiLSTM</option>
            <option value="lstm">LSTM</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Computing comparative sentiment scores across products...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Product Leaderboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparison?.map((prod, idx) => (
              <div
                key={prod.product_id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      {idx === 0 && (
                        <span className="p-1 rounded-md bg-amber-100 text-amber-800">
                          <Trophy className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-400">#{idx + 1} Rank</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {prod.product_name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">{prod.product_id}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Net Score
                    </span>
                    <span className={`text-xl font-black ${prod.net_sentiment_score >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                      {prod.net_sentiment_score > 0 ? `+${prod.net_sentiment_score}` : prod.net_sentiment_score}
                    </span>
                  </div>
                </div>

                {/* Sentiment Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span className="text-emerald-700">{prod.positive_percentage}% Pos</span>
                    <span className="text-amber-700">{prod.neutral_percentage}% Neu</span>
                    <span className="text-rose-700">{prod.negative_percentage}% Neg</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
                    <div className="bg-emerald-500 h-2" style={{ width: `${prod.positive_percentage}%` }}></div>
                    <div className="bg-amber-400 h-2" style={{ width: `${prod.neutral_percentage}%` }}></div>
                    <div className="bg-rose-500 h-2" style={{ width: `${prod.negative_percentage}%` }}></div>
                  </div>
                </div>

                {/* Aspect Highlights */}
                {prod.aspect_breakdown && Object.keys(prod.aspect_breakdown).length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Key Aspect Ratings:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(prod.aspect_breakdown).slice(0, 4).map(([aspectName, counts], i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 flex items-center space-x-1"
                        >
                          <span>{aspectName}:</span>
                          <span className="text-emerald-700 font-bold">{counts.Positive}P</span>
                          {counts.Negative > 0 && (
                            <span className="text-rose-700 font-bold">{counts.Negative}N</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 flex justify-between pt-2 border-t border-slate-100">
                  <span>Reviews: {prod.total_reviews}</span>
                  <span>Avg Conf: {(prod.average_confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
