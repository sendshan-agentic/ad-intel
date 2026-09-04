import React, { useState, useEffect } from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { ShieldCheck, Database, Sliders, History, Maximize2, Minimize2, Radio } from 'lucide-react';

interface DesktopHeaderProps {
  onOpenBenchmarks: () => void;
  onOpenHistory: () => void;
  recordsCount?: number;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  onOpenBenchmarks,
  onOpenHistory,
  recordsCount = 0
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 select-none shadow-xs">
      {/* Desktop App Titlebar Bar */}
      <div className="h-8 px-4 flex items-center justify-between border-b border-slate-200 bg-slate-50 text-slate-600 text-xs">
        {/* Left: Window controls & Desktop App Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90 hover:bg-rose-500 transition cursor-pointer"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 hover:bg-amber-500 transition cursor-pointer"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 hover:bg-emerald-500 transition cursor-pointer"></span>
          </div>
          <span className="text-slate-300 font-mono">|</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white shadow-2xs">
              AI
            </div>
            <span className="font-semibold text-slate-700 text-xs tracking-tight">Ad Intel Desktop</span>
            <span className="hidden md:inline-block px-1.5 py-0.2 bg-slate-200/70 text-slate-600 rounded text-[10px] font-semibold uppercase tracking-wider">
              Competitive Engine v2.4
            </span>
          </div>
        </div>

        {/* Right: Engine Telemetry Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] shadow-2xs">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Scraper Queue: <strong className="text-slate-800 font-mono">3–8s delays</strong></span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            <span>Gemini 3.8 Flash</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Desktop Mode)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Toolbar */}
      <div className="h-16 px-6 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <div className="w-4 h-4 border-2 border-white rounded-xs"></div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ad Intel</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded uppercase tracking-wider">
                  Meta Ad Library
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-tight">
                Competitive commercial ad intelligence & spend estimation
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Install Button */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-open-benchmarks"
            onClick={onOpenBenchmarks}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-xs"
            title="Inspect and customize CPM benchmarks by industry & region"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>CPM Benchmarks</span>
          </button>

          <button
            id="btn-open-history"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-xs"
            title="View past competitive dossiers in local database"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Database Records</span>
            <span className="sm:hidden">History</span>
            {recordsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
                {recordsCount}
              </span>
            )}
          </button>

          {/* Dedicated Desktop PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
