import React, { useState } from 'react';
import { CpmBenchmark } from '../types';
import { X, Sliders, Info, Check, RefreshCw } from 'lucide-react';

interface BenchmarkModalProps {
  benchmarks: CpmBenchmark[];
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomCpm?: (minCpm: number, maxCpm: number) => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({
  benchmarks,
  isOpen,
  onClose,
  onApplyCustomCpm
}) => {
  const [customMin, setCustomMin] = useState(140);
  const [customMax, setCustomMax] = useState(240);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyCustomCpm?.(customMin, customMax);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Meta CPM Benchmark Table & Heuristic Spend Engine
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 bg-white">
          <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Meta does not disclose actual revenue or spend data for commercial ads. Ad Intel estimates competitor spend using this regional auction CPM table multiplied by active duration and format auction weights (Video: 1.35x, Carousel: 1.20x, Image: 1.00x).
            </p>
          </div>

          {/* Benchmark Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Industry / Domain</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">CPM Benchmark Range</th>
                  <th className="p-3">Avg CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {benchmarks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-semibold text-slate-800">{b.industry}</td>
                    <td className="p-3 text-slate-500">{b.region}</td>
                    <td className="p-3 font-mono text-emerald-600 font-bold">
                      {b.currency === 'INR' ? `₹${b.minCpm} – ₹${b.maxCpm}` : `$${b.minCpm} – $${b.maxCpm}`}
                    </td>
                    <td className="p-3 text-slate-700 font-mono">{b.avgCtrPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Custom Sensitivity Adjuster */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Test Custom CPM Sensitivity (INR)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-bold uppercase tracking-wide">Minimum CPM (₹)</label>
                <input
                  type="number"
                  min="20"
                  max="2000"
                  value={customMin}
                  onChange={(e) => setCustomMin(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-bold uppercase tracking-wide">Maximum CPM (₹)</label>
                <input
                  type="number"
                  min="20"
                  max="2000"
                  value={customMax}
                  onChange={(e) => setCustomMax(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition shadow-xs"
            >
              {applied ? <Check className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{applied ? 'Recalculated!' : 'Recalculate Spend Ranges'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-md shadow-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
