export interface CpmBenchmark {
  id: string;
  industry: string;
  region: string;
  currency: 'INR' | 'USD';
  minCpm: number;
  maxCpm: number;
  avgCtrPercent: number;
  description: string;
}

export const CPM_BENCHMARKS: Record<string, CpmBenchmark> = {
  'edtech-india': {
    id: 'edtech-india',
    industry: 'EdTech / K-12 / Test Prep',
    region: 'India (Tier 1-3)',
    currency: 'INR',
    minCpm: 140,
    maxCpm: 240,
    avgCtrPercent: 1.6,
    description: 'Competitive student & parent acquisition auctions on Meta (FB/IG feeds & reels). High seasonal surges around exam cycles.'
  },
  'd2c-india': {
    id: 'd2c-india',
    industry: 'D2C / E-Commerce / Consumer Goods',
    region: 'India',
    currency: 'INR',
    minCpm: 160,
    maxCpm: 320,
    avgCtrPercent: 1.8,
    description: 'Performance shopping ads, catalog carousels, and influencer video reels across Tier 1 and metro clusters.'
  },
  'fintech-india': {
    id: 'fintech-india',
    industry: 'Fintech / BFSI / Lending / Wealth',
    region: 'India',
    currency: 'INR',
    minCpm: 280,
    maxCpm: 580,
    avgCtrPercent: 1.1,
    description: 'High-compliance financial lead generation, app installs, and KYC conversion campaigns.'
  },
  'healthcare-india': {
    id: 'healthcare-india',
    industry: 'Healthcare / Wellness / Fitness',
    region: 'India',
    currency: 'INR',
    minCpm: 150,
    maxCpm: 290,
    avgCtrPercent: 1.5,
    description: 'Consultation bookings, wellness trials, and health plan lead campaigns.'
  },
  'saas-india': {
    id: 'saas-india',
    industry: 'B2B SaaS / Enterprise Tech',
    region: 'India & Global',
    currency: 'INR',
    minCpm: 400,
    maxCpm: 850,
    avgCtrPercent: 0.9,
    description: 'High-value decision maker targeting across Meta with downloadable assets and demo calls.'
  },
  'marketing-agency-india': {
    id: 'marketing-agency-india',
    industry: 'Marketing / Digital Agency / B2B Services',
    region: 'India',
    currency: 'INR',
    minCpm: 220,
    maxCpm: 450,
    avgCtrPercent: 1.0,
    description: 'Lead-gen for founder-led service brands — free audits, consult bookings, and case-study-led video ads targeting business owners and marketing decision makers.'
  },
  'real-estate-india': {
    id: 'real-estate-india',
    industry: 'Real Estate / Property Developers',
    region: 'India',
    currency: 'INR',
    minCpm: 180,
    maxCpm: 380,
    avgCtrPercent: 1.2,
    description: 'Project launch and site-visit lead campaigns — carousel/video walkthroughs targeting affluent metro and NRI audiences, often with high-value single-lead economics.'
  },
  'global-general': {
    id: 'global-general',
    industry: 'General Commercial Benchmark',
    region: 'Global / US / UK',
    currency: 'USD',
    minCpm: 14,
    maxCpm: 28,
    avgCtrPercent: 1.4,
    description: 'Tier-1 international Meta audience CPM auction baseline.'
  }
};

export function getBenchmarkForQuery(industryHint?: string, locationHint?: string): CpmBenchmark {
  const normLoc = (locationHint || '').toLowerCase();
  const normInd = (industryHint || '').toLowerCase();

  const isIndia = normLoc.includes('india') || normLoc.includes('delhi') || normLoc.includes('mumbai') || normLoc.includes('bangalore') || normLoc.includes('tier') || !locationHint;

  if (isIndia) {
    if (normInd.includes('edtech') || normInd.includes('educat') || normInd.includes('school') || normInd.includes('student') || normInd.includes('exam') || normInd.includes('parent')) {
      return CPM_BENCHMARKS['edtech-india'];
    }
    if (normInd.includes('fintech') || normInd.includes('finance') || normInd.includes('loan') || normInd.includes('bank') || normInd.includes('invest') || normInd.includes('crypto')) {
      return CPM_BENCHMARKS['fintech-india'];
    }
    if (normInd.includes('health') || normInd.includes('medical') || normInd.includes('fitness') || normInd.includes('ayur') || normInd.includes('pharma')) {
      return CPM_BENCHMARKS['healthcare-india'];
    }
    if (normInd.includes('agency') || normInd.includes('marketing') || normInd.includes('digital marketing') || normInd.includes('consult') || normInd.includes('freelanc')) {
      return CPM_BENCHMARKS['marketing-agency-india'];
    }
    if (normInd.includes('real estate') || normInd.includes('realestate') || normInd.includes('property') || normInd.includes('realty') || normInd.includes('builder') || normInd.includes('flat') || normInd.includes('apartment')) {
      return CPM_BENCHMARKS['real-estate-india'];
    }
    if (normInd.includes('saas') || normInd.includes('software') || normInd.includes('b2b') || normInd.includes('tech')) {
      return CPM_BENCHMARKS['saas-india'];
    }
    // Default to D2C / E-commerce for general commercial brands
    return CPM_BENCHMARKS['d2c-india'];
  }

  return CPM_BENCHMARKS['global-general'];
}
