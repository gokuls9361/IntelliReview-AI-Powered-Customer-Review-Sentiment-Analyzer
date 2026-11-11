import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Search, 
  Filter,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';
import { uploadCSV } from '../services/api';

export default function BatchAnalyzer() {
  const [file, setFile] = useState(null);
  const [modelType, setModelType] = useState('distilbert');
  const [loading, setLoading] = useState(false);
  const [batchData, setBatchData] = useState(null);
  const [error, setError] = useState(null);
  const [filterSentiment, setFilterSentiment] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const data = await uploadCSV(file, modelType);
      setBatchData(data);
    } catch (err) {
      setError(err.message || 'Error processing batch CSV.');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!batchData || !batchData.reviews) return;
    const headers = ["Review ID", "Product", "Rating", "Review Text", "Predicted Sentiment", "Confidence", "Aspects"];
    const rows = batchData.reviews.map(r => [
      `"${r.review_id || ''}"`,
      `"${r.product_name || ''}"`,
      `"${r.rating || ''}"`,
      `"${(r.review_text || '').replace(/"/g, '""')}"`,
      `"${r.predicted_sentiment || ''}"`,
      `"${((r.confidence || 0) * 100).toFixed(1)}%"`,
      `"${(r.detected_aspects || []).join('; ')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analyzed_reviews_${modelType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReviews = (batchData?.reviews || []).filter(r => {
    const matchesFilter = filterSentiment === 'ALL' || r.predicted_sentiment.toUpperCase() === filterSentiment;
    const matchesSearch = searchTerm === '' || 
      (r.review_text && r.review_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.product_name && r.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <span>Batch Review Analysis</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload CSV files containing hundreds of customer reviews for automated sentiment & aspect labeling.
          </p>
        </div>

        <a
          href="/api/download-sample-csv"
          download="sample_reviews_template.csv"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors w-fit"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Download Sample CSV Template</span>
        </a>
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* File Input */}
            <div className="flex-1 w-full">
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-all text-center">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  {file ? file.name : "Click to select CSV file or drag and drop"}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Expected column: <code>review_text</code> (optional: <code>rating</code>, <code>product_name</code>)
                </span>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Controls */}
            <div className="w-full md:w-64 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Select Model:
                </label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="distilbert">DistilBERT (Highest Accuracy)</option>
                  <option value="bilstm">BiLSTM (Balanced & Fast)</option>
                  <option value="lstm">LSTM (Fastest)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!file || loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Batch...</span>
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-4 h-4" />
                    <span>Run Batch Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Batch Summary & Table */}
      {batchData && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block">Total Reviews</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {batchData.summary.total_reviews}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-emerald-600 block">Positive</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {batchData.summary.positive_percentage}%
              </span>
              <span className="text-[11px] text-slate-400">{batchData.summary.positive_count} reviews</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-rose-600 block">Negative</span>
              <span className="text-2xl font-black text-rose-700 mt-1 block">
                {batchData.summary.negative_percentage}%
              </span>
              <span className="text-[11px] text-slate-400">{batchData.summary.negative_count} reviews</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-amber-600 block">Neutral</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">
                {batchData.summary.neutral_percentage}%
              </span>
              <span className="text-[11px] text-slate-400">{batchData.summary.neutral_count} reviews</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
              <span className="text-xs font-semibold text-blue-600 block">Avg Confidence</span>
              <span className="text-2xl font-black text-blue-700 mt-1 block">
                {(batchData.summary.average_confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reviews or products..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-1">
                  {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilterSentiment(f)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filterSentiment === f
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={exportCSV}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Analyzed CSV</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Review Text</th>
                    <th className="py-3 px-4">Predicted Sentiment</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Detected Aspects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReviews.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {r.review_id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {r.product_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-md">
                        {r.review_text}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {r.predicted_sentiment === 'Positive' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            Positive
                          </span>
                        )}
                        {r.predicted_sentiment === 'Negative' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                            Negative
                          </span>
                        )}
                        {r.predicted_sentiment === 'Neutral' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            Neutral
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {((r.confidence || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {r.detected_aspects?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {r.detected_aspects.map((asp, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium border border-purple-200">
                                {asp}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex justify-between items-center">
              <span>Showing {filteredReviews.length} of {batchData.reviews.length} reviews</span>
              <span>Model: {modelType.toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
