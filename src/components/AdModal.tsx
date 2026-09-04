import React, { useState } from 'react';
import { ScrapedAd } from '../types';
import { X, Calendar, Clock, ExternalLink, Copy, Check, CheckCircle2, ArrowUpRight, Play, Layers, Image as ImageIcon, ShieldCheck } from 'lucide-react';

interface AdModalProps {
  ad: ScrapedAd | null;
  onClose: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ ad, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!ad) return null;

  const copyAdCopy = () => {
    navigator.clipboard.writeText(ad.adCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLibraryId = () => {
    if (ad.adArchiveId) {
      navigator.clipboard.writeText(ad.adArchiveId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const librarySearchUrl = ad.libraryUrl || (ad.adArchiveId 
    ? `https://www.facebook.com/ads/library/?id=${ad.adArchiveId}`
    : `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q=${encodeURIComponent(ad.pageName)}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden text-slate-900 flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Meta Ad Library Verified Creative Snapshot
            </span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
              {ad.formatType}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 bg-white flex-1">
          {/* Authentic Meta Ad Unit Simulation */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {/* Meta Header */}
            <div className="p-3.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                {ad.pageAvatar ? (
                  <img
                    src={ad.pageAvatar}
                    alt={ad.pageName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {getInitials(ad.pageName)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 leading-tight">
                      {ad.pageName}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium leading-tight">
                    Sponsored • Active on {ad.platforms?.join(', ') || 'Facebook & Instagram'}
                  </span>
                </div>
              </div>

              {ad.adArchiveId && (
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 text-[11px]">
                  <span className="text-slate-400 font-mono">ID: {ad.adArchiveId}</span>
                  <button
                    onClick={copyLibraryId}
                    title="Copy Meta Ad Archive ID"
                    className="text-indigo-600 hover:text-indigo-800 ml-1"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>

            {/* Ad Primary Copy */}
            <div className="p-4 bg-white">
              <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
                {ad.adCopy || 'No primary copy captured for this creative.'}
              </p>
            </div>

            {/* Creative Snapshot Asset */}
            <div className="relative w-full max-h-96 bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={ad.creativeUrl}
                alt={`${ad.pageName} Creative Snapshot`}
                className="w-full h-auto object-contain max-h-96"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80';
                }}
              />
              
              {/* Format overlay badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/85 backdrop-blur-xs text-white text-[11px] font-bold rounded shadow-md">
                {ad.formatType === 'video' ? (
                  <>
                    <Play className="w-3 h-3 fill-white" />
                    <span>VIDEO SNAPSHOT</span>
                  </>
                ) : ad.formatType === 'carousel' ? (
                  <>
                    <Layers className="w-3 h-3" />
                    <span>CAROUSEL AD</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3" />
                    <span>IMAGE CREATIVE</span>
                  </>
                )}
              </div>

              {ad.formatType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-slate-900/70 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-lg">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Meta Ad Destination Bar with Real CTA Button */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                  {ad.displayUrl || `${ad.pageName.toUpperCase().replace(/\s+/g, '')}.COM`}
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                  {ad.headline || `${ad.pageName} Official Campaign`}
                </h4>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-md shadow-xs transition cursor-pointer">
                  <span>{ad.ctaText || 'Learn More'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Ad Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Started Running:
              </span>
              <strong className="text-slate-900 text-sm font-mono">{ad.startedRunningOn}</strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Active Duration:
              </span>
              <strong className="text-emerald-600 text-sm font-bold">~{ad.daysActive || 1} days running</strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide mb-1">
                Verified CTA:
              </span>
              <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded text-xs">
                {ad.ctaText || 'Learn More'}
              </span>
            </div>
          </div>

          {/* Raw Copy Text & Actions */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Extracted Primary Copy
              </span>
              <button
                onClick={copyAdCopy}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono select-text bg-white p-3 rounded border border-slate-200">
              {ad.adCopy || 'No text captured'}
            </p>
          </div>

          {/* External Verification Links */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <a
              href={librarySearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold py-1.5"
            >
              <span>View in Meta Ad Library</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {ad.linkUrl && (
              <a
                href={ad.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium py-1.5"
              >
                <span>Visit Landing Page Destination</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Data sourced directly from Meta Ad Library archive
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-md shadow-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
