import React, { useState } from 'react';
import { CompetitorScrapeRecord, AnalysisCompetitorSection, ScrapedAd } from '../types';
import { ExternalLink, Film, Image as ImageIcon, Layers, Calendar, DollarSign, Lightbulb, Repeat, Cpu, AlertCircle, Eye, CheckCircle2, ArrowUpRight, Play } from 'lucide-react';

interface CompetitorCardProps {
  competitor: CompetitorScrapeRecord;
  analysis?: AnalysisCompetitorSection;
  onSelectAd: (ad: ScrapedAd) => void;
  onAdjustCpm: () => void;
}

export const CompetitorCard: React.FC<CompetitorCardProps> = ({
  competitor,
  analysis,
  onSelectAd,
  onAdjustCpm
}) => {
  const [showAllAds, setShowAllAds] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const displayedAds = showAllAds ? competitor.ads : competitor.ads.slice(0, 4);

  const { videoPercentage, imagePercentage, carouselPercentage, videoCount, imageCount, carouselCount } = competitor.formatBreakdown;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition flex flex-col">
      {/* Top Brand Bar */}
      <div className="p-5 border-b border-slate-100 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">{competitor.brand}</h3>
              {competitor.metaPageUrl && (
                <a
                  href={competitor.metaPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100/70 px-2 py-0.5 rounded border border-indigo-100"
                  title="Verify live on Meta Ad Library"
                >
                  <span>Meta Ad Library</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>Scraped: <strong className="text-slate-700">{competitor.scrapeDate}</strong></span>
              <span>•</span>
              <span>Target Geo: <strong className="text-slate-700">{competitor.targetLocation}</strong></span>
            </div>
          </div>

          {/* Active Ads Pill */}
          <div className="flex flex-col items-end">
            <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              <span>{competitor.activeAdsCount} Active Ads Scraped</span>
            </div>
          </div>
        </div>

        {/* Spend Range Heuristic Box */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Estimated Monthly Ad Spend Range
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
              Estimated — not actual Meta data
            </span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-base font-bold text-emerald-600 font-mono">
              {competitor.estimatedMonthlySpend.formattedRange}
            </div>
            <button
              onClick={onAdjustCpm}
              className="text-xs text-slate-500 hover:text-indigo-600 underline decoration-slate-300 transition"
            >
              Adjust CPM benchmark
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-normal">
            {competitor.estimatedMonthlySpend.methodologyNote}
          </p>
        </div>

        {/* Format Breakdown & Timeline Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
          {/* Format Breakdown */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <span className="font-bold text-slate-700 block mb-2 uppercase tracking-wide text-[11px]">Format Breakdown</span>
            {/* Segmented Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex mb-2.5">
              <div style={{ width: `${videoPercentage}%` }} className="bg-purple-600 h-full" title={`Video: ${videoPercentage}%`} />
              <div style={{ width: `${imagePercentage}%` }} className="bg-indigo-600 h-full" title={`Image: ${imagePercentage}%`} />
              <div style={{ width: `${carouselPercentage}%` }} className="bg-amber-500 h-full" title={`Carousel: ${carouselPercentage}%`} />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-purple-600" />
                {videoPercentage}% Video ({videoCount})
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                {imagePercentage}% Image ({imageCount})
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                {carouselPercentage}% Carousel ({carouselCount})
              </span>
            </div>
          </div>

          {/* Active Running Dates Timeline */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Active Running Timeline
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Earliest Active Ad:</span>
                <span className="text-slate-800 font-semibold">{competitor.earliestAdStartDate}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Most Recent Launch:</span>
                <span className="text-slate-800 font-semibold">{competitor.mostRecentAdStartDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Creatives Gallery */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              Active Meta Ad Creatives & Verified CTAs ({competitor.ads.length})
            </span>
            <span className="hidden sm:inline-block text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Library Snapshots
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            {/* View toggle */}
            <div className="inline-flex rounded-md shadow-2xs bg-slate-200/60 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Ad Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Compact Grid
              </button>
            </div>

            {competitor.ads.length > 4 && (
              <button
                onClick={() => setShowAllAds(!showAllAds)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 ml-1"
              >
                {showAllAds ? 'Show Less' : `View All (${competitor.ads.length})`}
              </button>
            )}
          </div>
        </div>

        {viewMode === 'cards' ? (
          /* High-Fidelity Meta Ad Library Ad Units */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedAds.map((ad, idx) => (
              <div
                key={idx}
                onClick={() => onSelectAd(ad)}
                className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-400 overflow-hidden cursor-pointer transition shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Meta Ad Header */}
                  <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      {ad.pageAvatar ? (
                        <img
                          src={ad.pageAvatar}
                          alt={ad.pageName || competitor.brand}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                          {getInitials(ad.pageName || competitor.brand)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900 leading-tight">
                            {ad.pageName || competitor.brand}
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                        </div>
                        <span className="text-[10px] text-slate-400 block font-medium leading-tight">
                          Sponsored • Meta Ad Library
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ● {ad.daysActive || 14}d active
                      </span>
                      {ad.adArchiveId && (
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                          ID: {ad.adArchiveId.slice(0, 10)}...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ad Primary Copy / Hook */}
                  <div className="px-3.5 py-2.5">
                    <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed font-normal">
                      {ad.adCopy || 'No primary copy captured for this creative.'}
                    </p>
                  </div>

                  {/* Ad Creative Image / Video Snapshot */}
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <img
                      src={ad.creativeUrl}
                      alt={`${ad.pageName} Ad Creative`}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80';
                      }}
                    />
                    
                    {/* Format overlay badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold rounded shadow-xs">
                      {ad.formatType === 'video' ? (
                        <>
                          <Play className="w-2.5 h-2.5 fill-white" />
                          <span>VIDEO REEL</span>
                        </>
                      ) : ad.formatType === 'carousel' ? (
                        <>
                          <Layers className="w-2.5 h-2.5" />
                          <span>CAROUSEL</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-2.5 h-2.5" />
                          <span>SINGLE IMAGE</span>
                        </>
                      )}
                    </div>

                    {/* Started Running Date */}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-slate-950/75 backdrop-blur-xs text-slate-200 text-[9px] font-mono rounded">
                      Started: {ad.startedRunningOn}
                    </span>
                  </div>

                  {/* Destination Strip & Real CTA Button */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate block">
                        {ad.displayUrl || `${competitor.brand.toUpperCase().replace(/\s+/g, '')}.COM`}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                        {ad.headline || `${competitor.brand} Official Campaign`}
                      </h4>
                    </div>

                    {/* Real CTA Button */}
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs rounded-md border border-slate-300 hover:border-indigo-400 shadow-2xs transition group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
                        <span>{ad.ctaText || 'Learn More'}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inspect Footer Link */}
                <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Click card to inspect copy & angle</span>
                  <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-0.5">
                    Inspect Snapshot <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Compact Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {displayedAds.map((ad, idx) => (
              <div
                key={idx}
                onClick={() => onSelectAd(ad)}
                className="group relative bg-white rounded-lg border border-slate-200 hover:border-indigo-500 overflow-hidden cursor-pointer transition shadow-2xs hover:shadow-xs"
              >
                <div className="aspect-square w-full bg-slate-100 relative overflow-hidden">
                  <img
                    src={ad.creativeUrl}
                    alt={`Ad creative ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80';
                    }}
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold rounded uppercase">
                    {ad.formatType}
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-slate-200 text-[9px] font-mono rounded">
                    {ad.startedRunningOn}
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="text-xs text-slate-700 line-clamp-2 leading-snug">
                    {ad.adCopy || 'No ad text captured'}
                  </p>
                  {ad.ctaText && (
                    <span className="mt-1.5 inline-block text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      CTA: {ad.ctaText}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gemini-Generated Strategic Analysis Section */}
      {analysis && (
        <div className="p-5 space-y-3.5 bg-white flex-1">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              AI Strategic Intelligence (Gemini 3.8 Flash)
            </span>
          </div>

          {/* 1. Leading Hook / Angle */}
          <div className="text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1 mb-1.5">
              <span>1. Leading Angle / Hook:</span>
            </span>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {analysis.leadingAngle}
            </p>
          </div>

          {/* 2. Messaging Patterns & CTAs */}
          <div className="text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1 mb-1.5">
              <Repeat className="w-3.5 h-3.5 text-indigo-600" />
              <span>2. Repeating Messaging Patterns & CTAs:</span>
            </span>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {analysis.messagingPatterns}
            </p>
          </div>

          {/* 3. Format Strategy & Maturity Signal */}
          <div className="text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1 mb-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              <span>3. Format Strategy & Maturity Signal:</span>
            </span>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {analysis.formatStrategy}
            </p>
          </div>

          {/* 4. Gap or Weakness */}
          <div className="text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1 mb-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>4. Clear Gap / Weakness for Your Audience:</span>
            </span>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {analysis.gapOrWeakness}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
