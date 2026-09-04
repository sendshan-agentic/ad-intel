import React from 'react';
import { AnalysisOverallSection } from '../types';
import { Compass, Sparkles, PieChart, Ban, Copy, Check } from 'lucide-react';

interface OverallStrategySectionProps {
  overall: AnalysisOverallSection;
  brandName: string;
}

export const OverallStrategySection: React.FC<OverallStrategySectionProps> = ({ overall, brandName }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyHook = (hook: string, index: number) => {
    navigator.clipboard.writeText(hook);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-900 relative overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
              Strategic Playbook
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Overall Competitive Counter-Strategy for {brandName}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Synthesized whitespace opportunities, differentiated opening hooks, format balancing, and angles to avoid.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Whitespace Opportunity */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 mb-2 font-bold text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>1. Whitespace Opportunity (Uncontested Angle)</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {overall.whitespaceOpportunity}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-indigo-100/80 text-xs text-indigo-800/80 font-mono">
            Direct opportunity to win market share without bidding wars on saturated angles.
          </div>
        </div>

        {/* 3. Recommended Format Mix */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-700 mb-2 font-bold text-xs uppercase tracking-wider">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>3. Recommended Format Mix (Saturation Counter)</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {overall.recommendedFormatMix}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500 font-mono">
            Based on current competitor ad saturation vs. underutilized Meta ad placements.
          </div>
        </div>

        {/* 2. Differentiated Ad Hooks / Openings (Span 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>2. Ready-to-Test Differentiated Ad Hooks / Openings</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Click copy icon to copy hook text</span>
          </div>

          <div className="space-y-2.5">
            {overall.differentiatedHooks.map((hook, idx) => (
              <div
                key={idx}
                className="group flex items-start justify-between gap-3 p-3.5 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 rounded-lg transition"
              >
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed italic">
                    "{hook.replace(/^["']|["']$/g, '')}"
                  </p>
                </div>
                <button
                  onClick={() => copyHook(hook, idx)}
                  className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 transition shrink-0"
                  title="Copy ad hook to clipboard"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Angle to Explicitly Avoid Copying */}
        <div className="lg:col-span-2 bg-rose-50/70 border border-rose-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-800 mb-2 font-bold text-xs uppercase tracking-wider">
            <Ban className="w-4 h-4 text-rose-600" />
            <span>4. Explicitly Avoid Copying (Saturated Competitor Trap)</span>
          </div>
          <p className="text-sm text-rose-900 leading-relaxed font-medium">
            {overall.avoidAngle}
          </p>
          <p className="mt-2 text-xs text-rose-700/80">
            A competitor is already dominating this exact hook with high cumulative spend. Entering this auction angle directly will spike CPMs and induce audience ad fatigue.
          </p>
        </div>
      </div>
    </div>
  );
};
