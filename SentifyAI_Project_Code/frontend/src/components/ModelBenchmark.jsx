import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Zap, 
  BarChart2, 
  Layers, 
  Scale, 
  Award,
  Grid
} from 'lucide-react';
import { getModelsBenchmark } from '../services/api';

export default function ModelBenchmark() {
  const [data, setData] = useState(null);
  const [selectedModel, setSelectedModel] = useState('distilbert');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getModelsBenchmark();
        setData(res);
      } catch (err) {
        setError(err.message || 'Error fetching model benchmark.');
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
        <p className="text-sm font-medium">Loading deep learning model comparative benchmarks...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
        {error || 'Unable to load benchmark data.'}
      </div>
    );
  }

  const activeModelObj = data.models?.find(m => m.id === selectedModel) || data.models?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Deep Learning Model Benchmarking & Evaluation</h2>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Comparative empirical evaluation across <strong>LSTM</strong>, <strong>BiLSTM</strong>, and <strong>DistilBERT</strong> evaluated on identical test partitions (2,250 reviews, 3 balanced classes).
        </p>
      </div>

      {/* Comparative Metrics Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Empirical Performance Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Dataset: Amazon 3-Class (15k reviews)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">Avg Latency</th>
                <th className="py-3 px-4">Parameters</th>
                <th className="py-3 px-4">Model Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.models?.map((m) => {
                const isWinner = m.id === 'distilbert';
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedModel === m.id ? 'bg-blue-50/60 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        {isWinner && (
                          <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">
                            {m.id.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {m.accuracy}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{m.precision}%</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{m.recall}%</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{m.f1_score}%</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{m.avg_latency_ms} ms</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{(m.parameters / 1e6).toFixed(2)}M</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{m.model_size_mb} MB</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Deep-Dive: Confusion Matrix & Architecture Details */}
      {activeModelObj && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Architecture Info & Trade-offs */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Selected Model Inspection
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeModelObj.name}
                </h3>
              </div>
              <div className="flex space-x-1">
                {data.models?.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedModel === m.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m.id.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Layer Architecture Pipeline:
              </span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-800">
                {activeModelObj.architecture}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-2">
                  Key Strengths:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {activeModelObj.pros?.map((p, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block mb-2">
                  Trade-offs / Limitations:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {activeModelObj.cons?.map((c, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5"></span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Confusion Matrix Visualizer */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Grid className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Confusion Matrix
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Actual vs Predicted class alignment on test sample (N=2,250):
            </p>

            {activeModelObj.confusion_matrix && (
              <div className="pt-2">
                <div className="grid grid-cols-4 gap-1 text-center text-xs font-semibold">
                  <div></div>
                  <div className="text-rose-700 text-[11px] pb-1">Pred Neg</div>
                  <div className="text-amber-700 text-[11px] pb-1">Pred Neu</div>
                  <div className="text-emerald-700 text-[11px] pb-1">Pred Pos</div>

                  {['Actual Neg', 'Actual Neu', 'Actual Pos'].map((label, rowIdx) => (
                    <React.Fragment key={rowIdx}>
                      <div className="text-left text-[11px] text-slate-600 flex items-center pr-1">
                        {label}
                      </div>
                      {activeModelObj.confusion_matrix[rowIdx].map((val, colIdx) => {
                        const isDiagonal = rowIdx === colIdx;
                        return (
                          <div
                            key={colIdx}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                              isDiagonal
                                ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 font-medium'
                            }`}
                          >
                            <span className="text-sm">{val}</span>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              Diagonal elements represent true positives for each class. Non-diagonal values represent misclassifications.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
