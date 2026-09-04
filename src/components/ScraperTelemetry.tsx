import React from 'react';
import { ScrapeJobLog } from '../types';
import { Clock, Radio, CheckCircle2, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';

interface ScraperTelemetryProps {
  status: 'idle' | 'queued' | 'delaying' | 'scraping' | 'analyzing' | 'completed' | 'error';
  currentCompetitor?: string;
  delaySeconds?: number;
  logs: ScrapeJobLog[];
  completedCount: number;
  totalCount: number;
}

export const ScraperTelemetry: React.FC<ScraperTelemetryProps> = ({
  status,
  currentCompetitor,
  delaySeconds,
  logs,
  completedCount,
  totalCount
}) => {
  if (status === 'idle') return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Scraper Queue & Engine Telemetry
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                status === 'delaying' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                status === 'scraping' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                status === 'analyzing' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {status === 'delaying' ? `Delay Queue (${delaySeconds || '3–8'}s)` : status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target: Meta Ad Library (facebook.com/ads/library) • Reverse-Engineered GraphQL & DOM Parser
            </p>
          </div>
        </div>

        {/* Competitor Progress Indicator */}
        <div className="flex items-center gap-3">
          {currentCompetitor && status !== 'completed' && (
            <div className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              Current Target: <strong className="text-indigo-600">{currentCompetitor}</strong>
            </div>
          )}
          <div className="text-xs text-slate-500 font-mono font-medium">
            {completedCount} / {totalCount} Processed
          </div>
        </div>
      </div>

      {/* Randomized Delay Countdown Banner when active */}
      {status === 'delaying' && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span className="text-xs font-medium">
              Anti-bot protection delay in progress ({delaySeconds || '3–8'}s). Throttling requests to prevent IP rate-limiting.
            </span>
          </div>
          <div className="w-32 bg-amber-200/60 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full animate-[pulse_1s_infinite]"></div>
          </div>
        </div>
      )}

      {/* Terminal-style live log window - using the sleek dark block from the design */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 font-mono text-[11px] text-slate-200 max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin shadow-inner">
        <div className="flex items-center gap-1.5 text-slate-400 pb-1.5 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider">
          <Terminal className="w-3 h-3 text-indigo-400" />
          <span>Execution Log Stream</span>
        </div>
        {logs.slice(-6).map((log, i) => (
          <div key={i} className="flex items-start gap-2 leading-relaxed">
            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
            {log.level === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
            {log.level === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
            {log.level === 'info' && <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />}
            <span className={
              log.level === 'success' ? 'text-emerald-300' :
              log.level === 'warn' ? 'text-amber-300' :
              'text-slate-300'
            }>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
