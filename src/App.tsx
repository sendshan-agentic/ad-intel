import React, { useState, useEffect, useRef } from 'react';
import { DesktopHeader } from './components/DesktopHeader';
import { ResearchForm, PRESETS } from './components/ResearchForm';
import { ScraperTelemetry } from './components/ScraperTelemetry';
import { CompetitorCard } from './components/CompetitorCard';
import { OverallStrategySection } from './components/OverallStrategySection';
import { AdModal } from './components/AdModal';
import { BenchmarkModal } from './components/BenchmarkModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import {
  AdIntelPayload,
  CompetitorScrapeRecord,
  StrategicAnalysisResult,
  ScrapedAd,
  CpmBenchmark,
  ScrapeJobLog
} from './types';
import {
  Download,
  FileText,
  Printer,
  Sparkles,
  TrendingUp,
  BarChart3,
  Layers,
  Search,
  ExternalLink,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

export default function App() {
  // State: Form & Active Research Session
  const [payload, setPayload] = useState<AdIntelPayload>(PRESETS[0].data);
  const [competitors, setCompetitors] = useState<CompetitorScrapeRecord[]>([]);
  const [analysis, setAnalysis] = useState<StrategicAnalysisResult | null>(null);

  // State: Scraper Engine Status & Telemetry
  const [status, setStatus] = useState<'idle' | 'queued' | 'delaying' | 'scraping' | 'analyzing' | 'completed' | 'error'>('idle');
  const [currentCompetitor, setCurrentCompetitor] = useState<string>('');
  const [delaySeconds, setDelaySeconds] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(3);
  const [logs, setLogs] = useState<ScrapeJobLog[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State: Modals & Panels
  const [selectedAd, setSelectedAd] = useState<ScrapedAd | null>(null);
  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [benchmarks, setBenchmarks] = useState<CpmBenchmark[]>([]);
  const [dbRecords, setDbRecords] = useState<CompetitorScrapeRecord[]>([]);

  // Telemetry Polling Ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial benchmarks & DB records
  useEffect(() => {
    fetchBenchmarks();
    fetchLatestHistory();
    fetchRecords().then((records) => {
      if (records && records.length > 0) {
        setCompetitors(records.slice(0, 3));
        setStatus('completed');
      } else {
        // Run initial research if database is fresh
        handleStartResearch(PRESETS[0].data);
      }
    });
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + Enter to run research, Esc to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (status !== 'scraping' && status !== 'delaying' && status !== 'analyzing') {
          handleStartResearch(payload);
        }
      }
      if (e.key === 'Escape') {
        setSelectedAd(null);
        setIsBenchmarkModalOpen(false);
        setIsHistoryDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [payload, status]);

  const fetchBenchmarks = async () => {
    try {
      const res = await fetch('/api/benchmarks');
      if (res.ok) {
        const data = await res.json();
        setBenchmarks(data.benchmarks || []);
      }
    } catch (err) {
      console.warn('Failed to fetch benchmarks:', err);
    }
  };

  const fetchRecords = async (): Promise<CompetitorScrapeRecord[]> => {
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        const records = data.records || [];
        setDbRecords(records);
        return records;
      }
    } catch (err) {
      console.warn('Failed to fetch DB records:', err);
    }
    return [];
  };

  const fetchLatestHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        if (data.analyses && data.analyses.length > 0) {
          const latest = data.analyses[0];
          if (latest.analysis) setAnalysis(latest.analysis);
          if (latest.searchParams) setPayload(latest.searchParams);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch history:', err);
    }
  };

  // Launch research task
  const handleStartResearch = async (searchParams: AdIntelPayload) => {
    setPayload(searchParams);
    setStatus('queued');
    setErrorMsg(null);
    setLogs([
      {
        timestamp: new Date().toLocaleTimeString(),
        message: `Queue initialized for ${searchParams.competitorNames.length} competitor brands...`,
        level: 'info'
      }
    ]);
    setTotalCount(searchParams.competitorNames.length);
    setCompletedCount(0);

    try {
      // 1. Post to /api/research
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        let errDetail = 'Failed to complete competitive research scan';
        try {
          const errData = await response.json();
          if (errData?.error) errDetail = errData.error;
        } catch {
          errDetail = `Server error (${response.status})`;
        }
        throw new Error(errDetail);
      }

      const data = await response.json();
      setCompetitors(data.competitors || []);
      setAnalysis(data.analysis || null);
      setStatus('completed');
      setCompletedCount(searchParams.competitorNames.length);

      // Refresh DB records
      fetchRecords();
    } catch (err: any) {
      console.error('Research execution error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Error occurred during scraping.');
    }
  };

  // Apply custom CPM to re-estimate spend ranges across active competitors
  const handleApplyCustomCpm = async (minCpm: number, maxCpm: number) => {
    if (competitors.length === 0) return;

    try {
      const updated = await Promise.all(
        competitors.map(async (c) => {
          const res = await fetch('/api/re-estimate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ads: c.ads,
              industry: payload.industry,
              location: payload.targetLocation,
              customMinCpm: minCpm,
              customMaxCpm: maxCpm
            })
          });
          if (res.ok) {
            const data = await res.json();
            return {
              ...c,
              estimatedMonthlySpend: data.spendRange
            };
          }
          return c;
        })
      );
      setCompetitors(updated);
    } catch (err) {
      console.error('Failed to recalculate spend ranges:', err);
    }
  };

  // Export handlers
  const exportAsMarkdown = () => {
    if (!analysis) return;
    const content = `# Competitive Ad Intel Dossier: ${payload.brandName}
**Generated**: ${new Date().toLocaleString()}
**Target Audience**: ${payload.targetAudience}
**Target Location**: ${payload.targetLocation}
**Campaign Focus**: ${payload.adTopics}

---

## Competitor Ad Library Scrapes
${competitors.map(c => `
### ${c.brand}
- **Active Ads**: ${c.activeAdsCount}
- **Format Breakdown**: ${c.formatBreakdown.videoPercentage}% Video (${c.formatBreakdown.videoCount}), ${c.formatBreakdown.imagePercentage}% Image (${c.formatBreakdown.imageCount}), ${c.formatBreakdown.carouselPercentage}% Carousel (${c.formatBreakdown.carouselCount})
- **Active Dates**: ${c.earliestAdStartDate} to ${c.mostRecentAdStartDate}
- **Estimated Monthly Spend**: ${c.estimatedMonthlySpend.formattedRange} (Heuristic: ${c.estimatedMonthlySpend.methodologyNote})
`).join('\n')}

---

## Strategic Analysis
${analysis.rawMarkdown}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ad-intel-${payload.brandName.toLowerCase().replace(/\s+/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsJson = () => {
    const data = {
      payload,
      competitors,
      analysis,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ad-intel-data-${payload.brandName.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Aggregated Stats
  const totalActiveAds = competitors.reduce((sum, c) => sum + c.activeAdsCount, 0);
  const totalVideoAds = competitors.reduce((sum, c) => sum + c.formatBreakdown.videoCount, 0);
  const totalImageAds = competitors.reduce((sum, c) => sum + c.formatBreakdown.imageCount, 0);
  const totalCarouselAds = competitors.reduce((sum, c) => sum + c.formatBreakdown.carouselCount, 0);

  const dominantFormat = totalVideoAds >= totalImageAds && totalVideoAds >= totalCarouselAds
    ? 'Video Reels'
    : totalImageAds >= totalCarouselAds ? 'Static Images' : 'Multi-card Carousels';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Desktop App Window Header */}
      <DesktopHeader
        onOpenBenchmarks={() => setIsBenchmarkModalOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        recordsCount={dbRecords.length}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Research Input Form */}
        <section id="form-section">
          <ResearchForm
            onSubmit={handleStartResearch}
            isLoading={status === 'scraping' || status === 'delaying' || status === 'analyzing' || status === 'queued'}
          />
        </section>

        {/* Real-time Scraper Queue & Telemetry Inspector */}
        <section id="telemetry-section">
          <ScraperTelemetry
            status={status}
            currentCompetitor={currentCompetitor}
            delaySeconds={delaySeconds}
            logs={logs}
            completedCount={completedCount}
            totalCount={totalCount}
          />
        </section>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {/* Dashboard Content */}
        {competitors.length > 0 && (
          <div className="space-y-6">
            {/* Top Metrics & Quick Export Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide">Competitors Scanned</span>
                  <strong className="text-base text-slate-900 font-bold">{competitors.length} Brands</strong>
                </div>
                <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide">Total Active Ads Scraped</span>
                  <strong className="text-base text-indigo-600 font-bold">{totalActiveAds} Meta Ads</strong>
                </div>
                <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide">Dominant Competitor Format</span>
                  <strong className="text-base text-purple-600 font-bold">{dominantFormat}</strong>
                </div>
                <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide">Target Audience</span>
                  <span className="text-slate-700 font-medium truncate max-w-xs block">{payload.targetAudience}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportAsMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold border border-slate-200 shadow-2xs transition"
                  title="Export full intelligence report in Markdown format"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Export Markdown</span>
                </button>
                <button
                  onClick={exportAsJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold border border-slate-200 shadow-2xs transition"
                  title="Export raw scraped ad objects as JSON"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-md border border-slate-200 shadow-2xs transition"
                  title="Print / Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Strategic Playbook Overview Section */}
            {analysis?.overall && (
              <section id="strategic-playbook">
                <OverallStrategySection
                  overall={analysis.overall}
                  brandName={payload.brandName}
                />
              </section>
            )}

            {/* Competitor Cards Section */}
            <section id="competitor-cards" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    Individual Competitor Ad Breakdowns & AI Audits
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Active ad sets, format distributions, heuristic monthly budgets, and angles extracted from Meta Ad Library
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {competitors.map((comp) => {
                  const compAnalysis = analysis?.competitors?.find(
                    (c) => c.competitorName.toLowerCase() === comp.brand.toLowerCase()
                  ) || analysis?.competitors?.find(
                    (c) => c.competitorName.toLowerCase().includes(comp.brand.toLowerCase()) || comp.brand.toLowerCase().includes(c.competitorName.toLowerCase())
                  );

                  return (
                    <CompetitorCard
                      key={comp.id}
                      competitor={comp}
                      analysis={compAnalysis}
                      onSelectAd={(ad) => setSelectedAd(ad)}
                      onAdjustCpm={() => setIsBenchmarkModalOpen(true)}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Ad Intel • Desktop Performance Marketing Intelligence Platform</span>
          <span className="text-[11px] font-mono text-slate-400">
            Ad Library Scraper • GraphQL Reverse-Engineered • Gemini 3.8 Flash Analysis Engine
          </span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AdModal
        ad={selectedAd}
        onClose={() => setSelectedAd(null)}
      />

      <BenchmarkModal
        benchmarks={benchmarks}
        isOpen={isBenchmarkModalOpen}
        onClose={() => setIsBenchmarkModalOpen(false)}
        onApplyCustomCpm={handleApplyCustomCpm}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onLoadDossier={() => {}}
        records={dbRecords}
      />
    </div>
  );
}
