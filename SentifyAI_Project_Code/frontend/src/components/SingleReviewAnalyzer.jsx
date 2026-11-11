import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Clock, 
  Zap, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  AlertCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { analyzeReview } from '../services/api';

const SAMPLE_REVIEWS = [
  {
    label: "Aspect-Mixed Review",
    text: "The camera quality is excellent, but the battery backup is terrible.",
    type: "mixed"
  },
  {
    label: "Positive Amazon Review",
    text: "Outstanding noise cancellation! Crystal clear audio with deep punchy bass. Comfortable for 8-hour flights.",
    type: "positive"
  },
  {
    label: "Negative Support Review",
    text: "Extremely disappointed. The screen cracked within two days and customer support was completely unhelpful.",
    type: "negative"
  },
  {
    label: "Neutral / Mediocre",
    text: "It is an okay phone. Good display and fast processor, but battery lasts just one normal workday. Nothing special.",
    type: "neutral"
  }
];

export default function SingleReviewAnalyzer() {
  const [reviewText, setReviewText] = useState("The camera quality is excellent, but the battery backup is terrible.");
  const [modelType, setModelType] = useState("distilbert");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!reviewText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeReview(reviewText, modelType);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Error communicating with analysis backend.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
            Positive
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-4 h-4 mr-1.5 text-rose-600" />
            Negative
          </span>
        );
      case 'mixed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <AlertCircle className="w-4 h-4 mr-1.5 text-purple-600" />
            Mixed (Multi-Aspect)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <MinusCircle className="w-4 h-4 mr-1.5 text-amber-600" />
            Neutral
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>Real-Time Customer Review Analysis</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Evaluate individual customer feedback using deep learning architectures (LSTM, BiLSTM, DistilBERT) with instant Aspect-Based Sentiment breakdown.
        </p>

        {/* Quick Sample Selector */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Try Pre-loaded Test Cases:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_REVIEWS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setReviewText(sample.text);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Model Selector */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleAnalyze} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Customer Review Text:
              </label>
              <textarea
                rows={5}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Paste customer review here..."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Model Architecture Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Select Deep Learning Model:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'distilbert', name: 'DistilBERT', desc: 'Transformer Self-Attention' },
                  { id: 'bilstm', name: 'BiLSTM', desc: 'Bidirectional Context' },
                  { id: 'lstm', name: 'LSTM', desc: 'Sequential Recurrence' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModelType(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      modelType === m.id
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${modelType === m.id ? 'text-blue-700' : 'text-slate-800'}`}>
                        {m.name}
                      </span>
                      {modelType === m.id && <span className="h-2 w-2 rounded-full bg-blue-600"></span>}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !reviewText.trim()}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Deep Learning Inference...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze Review</span>
                </>
              )}
            </button>
          </form>

          {/* Model Architecture Note */}
          <div className="bg-slate-100 p-4 rounded-xl text-xs text-slate-600 space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
              <Cpu className="w-4 h-4 text-slate-700" />
              <span>Deep Learning Pipeline Active</span>
            </div>
            <p>
              Preprocesses tokens, handles contraction expansions, computes embeddings, and evaluates sequence logits through soft probabilities.
            </p>
          </div>
        </div>

        {/* Right Column: Prediction Results & ABSA Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}

          {result ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Top Result Banner */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Predicted Sentiment
                  </span>
                  <div className="mt-1 flex items-center space-x-3">
                    {getSentimentBadge(result.sentiment)}
                    <span className="text-2xl font-black text-slate-900">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Confidence</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Model
                  </span>
                  <span className="inline-flex items-center text-xs font-semibold text-blue-700 mt-1">
                    {result.model_used?.name}
                  </span>
                  <div className="flex items-center justify-end text-[11px] text-slate-400 space-x-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{result.latency_ms} ms</span>
                  </div>
                </div>
              </div>

              {/* Class Probability Distribution Bars */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Class Probability Distribution:
                </span>
                <div className="space-y-2">
                  {[
                    { label: 'Positive', key: 'Positive', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                    { label: 'Neutral', key: 'Neutral', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
                    { label: 'Negative', key: 'Negative', color: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
                  ].map((c) => {
                    const prob = (result.probabilities?.[c.key] || 0) * 100;
                    return (
                      <div key={c.key} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className={c.text}>{c.label}</span>
                          <span className="text-slate-600 font-semibold">{prob.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${c.color} transition-all duration-500`}
                            style={{ width: `${Math.max(prob, 2)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Aspect-Based Sentiment Analysis (ABSA) Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Aspect-Based Sentiment (ABSA)
                    </span>
                  </div>
                  {result.aspects?.length > 0 && (
                    <span className="text-xs text-slate-500">
                      Overall: {getSentimentBadge(result.overall_aspect_sentiment)}
                    </span>
                  )}
                </div>

                {result.aspects?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {result.aspects.map((asp, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">{asp.aspect}</span>
                          <span className="text-slate-500 italic block">
                            "{asp.evidence_snippet}"
                          </span>
                        </div>
                        <div>{getSentimentBadge(asp.sentiment)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No explicit product aspects (e.g. camera, battery, screen) detected in this review.
                  </p>
                )}
              </div>

              {/* Preprocessed Tokens */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Tokens evaluated: {result.key_tokens?.length || 0} salient terms</span>
                <span className="font-mono text-[10px] truncate max-w-[200px]">
                  Clean: {result.cleaned_text}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-12 rounded-2xl border border-dashed border-slate-300 text-center">
              <Zap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-700 text-sm">Awaiting Review</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Type or paste a review, or pick a sample test case on the left, then click Analyze.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
