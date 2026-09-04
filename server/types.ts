export type AdFormat = 'image' | 'video' | 'carousel';

export interface ScrapedAd {
  id: string;
  pageName: string;
  pageAvatar?: string;
  adArchiveId?: string;
  creativeUrl: string;
  thumbnailUrl?: string;
  formatType: AdFormat;
  adCopy: string;
  headline?: string;
  displayUrl?: string;
  startedRunningOn: string;
  daysActive: number;
  ctaText?: string;
  linkUrl?: string;
  targetLocation?: string;
  platforms?: string[];
  libraryUrl?: string;
}

export interface FormatBreakdown {
  videoCount: number;
  imageCount: number;
  carouselCount: number;
  videoPercentage: number;
  imagePercentage: number;
  carouselPercentage: number;
}

export interface SpendRange {
  minMonthlyInr: number;
  maxMonthlyInr: number;
  minMonthlyUsd: number;
  maxMonthlyUsd: number;
  currency: 'INR' | 'USD';
  formattedRange: string;
  methodologyNote: string;
  cpmBenchmarkUsed: {
    industry: string;
    region: string;
    cpmMin: number;
    cpmMax: number;
    currency: string;
  };
}

export interface CompetitorScrapeRecord {
  id: string;
  brand: string;
  scrapeDate: string; // YYYY-MM-DD
  targetLocation: string;
  activeAdsCount: number;
  formatBreakdown: FormatBreakdown;
  earliestAdStartDate: string;
  mostRecentAdStartDate: string;
  estimatedMonthlySpend: SpendRange;
  ads: ScrapedAd[];
  adCopySamples: string[];
  metaPageUrl?: string;
  updatedAt: string;
}

export interface AnalysisCompetitorSection {
  competitorName: string;
  leadingAngle: string;
  messagingPatterns: string;
  formatStrategy: string;
  gapOrWeakness: string;
}

export interface AnalysisOverallSection {
  whitespaceOpportunity: string;
  differentiatedHooks: string[];
  recommendedFormatMix: string;
  avoidAngle: string;
}

export interface StrategicAnalysisResult {
  rawMarkdown: string;
  competitors: AnalysisCompetitorSection[];
  overall: AnalysisOverallSection;
  generatedAt: string;
  promptUsed: string;
}

export interface AdIntelPayload {
  brandName: string;
  targetAudience: string;
  targetLocation: string;
  adTopics: string;
  competitorNames: string[];
  industry?: string;
}

export interface ScrapeJobStatus {
  jobId: string;
  status: 'idle' | 'queued' | 'delaying' | 'scraping' | 'analyzing' | 'completed' | 'error';
  currentCompetitor?: string;
  completedCompetitors: string[];
  totalCompetitors: number;
  delayRemainingSeconds?: number;
  logs: Array<{ timestamp: string; message: string; level: 'info' | 'warn' | 'success' | 'error' }>;
  error?: string;
  results?: {
    competitors: CompetitorScrapeRecord[];
    analysis: StrategicAnalysisResult;
    searchParams: AdIntelPayload;
  };
}
