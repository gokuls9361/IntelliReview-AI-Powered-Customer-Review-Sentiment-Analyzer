import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SingleReviewAnalyzer from './components/SingleReviewAnalyzer';
import AspectBasedAnalysis from './components/AspectBasedAnalysis';
import BatchAnalyzer from './components/BatchAnalyzer';
import SentimentDashboard from './components/SentimentDashboard';
import KeywordTopicAnalysis from './components/KeywordTopicAnalysis';
import ProductComparison from './components/ProductComparison';
import ModelBenchmark from './components/ModelBenchmark';

export default function App() {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'single' && <SingleReviewAnalyzer />}
        {activeTab === 'absa' && <AspectBasedAnalysis />}
        {activeTab === 'batch' && <BatchAnalyzer />}
        {activeTab === 'dashboard' && <SentimentDashboard />}
        {activeTab === 'keywords' && <KeywordTopicAnalysis />}
        {activeTab === 'comparison' && <ProductComparison />}
        {activeTab === 'benchmark' && <ModelBenchmark />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            <p className="font-semibold text-slate-700">
              Intelligent Customer Review Sentiment & ABSA System
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Comparative Deep Learning: LSTM · BiLSTM · DistilBERT with Aspect Extraction
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
              FastAPI: 8000
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
              React + Vite: 3000
            </span>
            <span className="text-slate-400">
              Python 3.12 / PyTorch / Transformers
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
