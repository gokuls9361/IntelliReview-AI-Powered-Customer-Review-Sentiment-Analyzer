import React from 'react';
import { 
  Sparkles, 
  Layers, 
  UploadCloud, 
  BarChart3, 
  Hash, 
  GitCompare, 
  Cpu, 
  SplitSquareVertical 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'single', label: 'Review Analyzer', icon: Sparkles },
    { id: 'absa', label: 'Aspect-Based (ABSA)', icon: SplitSquareVertical },
    { id: 'batch', label: 'Batch CSV Analysis', icon: UploadCloud },
    { id: 'dashboard', label: 'Sentiment Dashboard', icon: BarChart3 },
    { id: 'keywords', label: 'Issues & Topics', icon: Hash },
    { id: 'comparison', label: 'Product Compare', icon: GitCompare },
    { id: 'benchmark', label: 'Model Benchmarks', icon: Cpu },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">SentifyAI</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">v1.0 Deep Learning</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Customer Review Sentiment & ABSA Intelligence</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              FastAPI Core Online
            </span>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
