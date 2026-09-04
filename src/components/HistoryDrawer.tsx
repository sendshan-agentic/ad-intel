import React, { useState } from 'react';
import { Database, Calendar, X, Eye, Download, FileText } from 'lucide-react';
import { CompetitorScrapeRecord } from '../types';

interface SavedDossierSummary {
  id: string;
  brandName: string;
  competitors: string[];
  date: string;
  activeAdsTotal: number;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDossier: (id: string) => void;
  records: CompetitorScrapeRecord[];
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onLoadDossier,
  records
}) => {
  const [tab, setTab] = useState<'records' | 'dossiers'>('records');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Persistent Ad Intel Database
            </h3>
            <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-mono border border-indigo-100 font-bold">
              {records.length} Scraped Brands
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Keying Note */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
          Scraped competitor records are stored with <code className="text-indigo-600 font-semibold font-mono">brand + scrape_date</code> primary keying. Subsequent runs update existing records rather than duplicating rows.
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
          {records.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No competitor records stored yet. Run a competitive research query to populate database.
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{rec.brand}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 rounded font-semibold">
                      {rec.activeAdsCount} ads
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {rec.scrapeDate}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 mb-2.5">
                  <div className="flex justify-between">
                    <span>Est. Spend Range:</span>
                    <strong className="text-emerald-600 font-mono font-bold">{rec.estimatedMonthlySpend?.formattedRange}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Format Mix:</span>
                    <span>{rec.formatBreakdown?.videoPercentage}% Video / {rec.formatBreakdown?.imagePercentage}% Image / {rec.formatBreakdown?.carouselPercentage}% Carousel</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 text-xs">
                  <span className="text-slate-500">
                    Latest ad: {rec.mostRecentAdStartDate}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    ID: {rec.id}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">JSON DB Sync Active</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-semibold transition shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
