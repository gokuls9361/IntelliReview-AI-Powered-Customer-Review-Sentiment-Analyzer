import React, { useState } from 'react';
import { 
  SplitSquareVertical, 
  Send, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  AlertCircle,
  Tag,
  Zap,
  Info
} from 'lucide-react';
import { analyzeABSA } from '../services/api';

const ABSA_EXAMPLES = [
  "The camera quality is excellent, but the battery backup is terrible.",
  "Sound is crystal clear and comfortable for flights, however Bluetooth connectivity constantly drops.",
  "Fast M-series performance and gorgeous display, but keyboard keys stick and customer support was completely unhelpful.",
  "Vacuum cleans carpets flawlessly, but mopping function leaves streaks and battery degrades fast."
];

export default function AspectBasedAnalysis() {
  const [reviewText, setReviewText] = useState("The camera quality is excellent, but the battery backup is terrible.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunABSA = async (e) => {
    if (e) e.preventDefault();
    if (!reviewText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeABSA(reviewText);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Error running Aspect-Based Sentiment Analysis.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentPill = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Positive
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Negative
          </span>
        );
      case 'mixed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-purple-600" />
            Mixed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <MinusCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Neutral
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <SplitSquareVertical className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-slate-900">
            Aspect-Based Sentiment Analysis (ABSA) Deep Dive
          </h2>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Deconstructs nuanced customer reviews into individual product dimensions (Camera, Battery, Audio, Support, etc.) to uncover contradictory sentiments within the same review.
        </p>

        {/* Example prompts */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Try Multi-Aspect Examples:
          </span>
          <div className="flex flex-wrap gap-2">
            {ABSA_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReviewText(ex)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition-colors"
              >
                Sample {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Card */}
        <div className="lg:col-span-6 space-y-4">
          <form onSubmit={handleRunABSA} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Compound Customer Review:
              </label>
              <textarea
                rows={5}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Enter review containing multiple opinions..."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !reviewText.trim()}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-md shadow-purple-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Extracting Aspects & Polarity...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Extract Aspect Sentiment</span>
                </>
              )}
            </button>
          </form>

          {/* Academic Note */}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold">
              <Info className="w-4 h-4 text-purple-600" />
              <span>How ABSA Solves the "Mixed Sentiment" Problem</span>
            </div>
            <p className="leading-relaxed text-purple-800">
              Standard 3-class classifiers often collapse reviews with both praise and complaints into a flat "Neutral". ABSA isolates each clause using contrastive conjunctions (<em>but</em>, <em>however</em>, <em>although</em>) and assigns independent polarities to each product feature.
            </p>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-6 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {result ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Composite Multi-Aspect Sentiment
                  </span>
                  <div className="mt-1">
                    {getSentimentPill(result.overall_aspect_sentiment)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Aspects Extracted
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {result.total_aspects_found}
                  </span>
                </div>
              </div>

              {/* Aspect Cards List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Identified Product Dimensions:
                </span>

                {result.detected_aspects?.length > 0 ? (
                  result.detected_aspects.map((asp, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200/90 bg-slate-50 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-xs font-bold text-slate-900">{asp.aspect}</span>
                          {asp.keyword && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              kw: {asp.keyword}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 italic">
                          "{asp.evidence_snippet}"
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {getSentimentPill(asp.sentiment)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No specific aspect keywords detected.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-12 rounded-2xl border border-dashed border-slate-300 text-center">
              <Zap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-700 text-sm">Awaiting Review</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Paste a review with contrasting clauses (e.g. great camera, poor battery) to inspect the ABSA extraction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
