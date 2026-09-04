import { ScrapedAd, SpendRange } from './types.js';
import { CpmBenchmark, getBenchmarkForQuery } from './benchmarks.js';

/**
 * Heuristic budget ESTIMATION module
 * (not real spend data — Meta does not expose this for commercial ads)
 *
 * Input:
 * - ad count
 * - days each ad has been live
 * - ad format (video: 1.35x auction weight, carousel: 1.20x, image: 1.00x)
 * - hardcoded CPM benchmark table by industry/region
 *
 * Output:
 * - estimated monthly spend RANGE per competitor, clearly labeled as "Estimated — not actual Meta data"
 */
export function estimateMonthlySpendRange(
  ads: ScrapedAd[],
  industryHint?: string,
  locationHint?: string,
  customBenchmark?: CpmBenchmark
): SpendRange {
  const benchmark = customBenchmark || getBenchmarkForQuery(industryHint, locationHint);

  if (ads.length === 0) {
    return {
      minMonthlyInr: 0,
      maxMonthlyInr: 0,
      minMonthlyUsd: 0,
      maxMonthlyUsd: 0,
      currency: benchmark.currency,
      formattedRange: '₹0 (0 active ads detected)',
      methodologyNote: 'Estimated — not actual Meta data. Based on 0 active ad creatives.',
      cpmBenchmarkUsed: {
        industry: benchmark.industry,
        region: benchmark.region,
        cpmMin: benchmark.minCpm,
        cpmMax: benchmark.maxCpm,
        currency: benchmark.currency
      }
    };
  }

  // Currency exchange baseline: ~84 INR = 1 USD
  const INR_TO_USD = 1 / 84;
  const USD_TO_INR = 84;

  let totalDailyMinInr = 0;
  let totalDailyMaxInr = 0;

  for (const ad of ads) {
    // 1. Determine life-stage weighting
    // Fresh ads (< 5 days) are typically lower budget/testing.
    // Mature ads (5 - 30 days) are scaled ad sets.
    // Evergreen ads (> 30 days) are high-performing flagship winners with heavy daily budget allocation.
    const days = Math.max(1, ad.daysActive || 1);
    let dailyImpressionsMin = 5000;
    let dailyImpressionsMax = 18000;

    if (days >= 5 && days <= 20) {
      dailyImpressionsMin = 14000;
      dailyImpressionsMax = 38000;
    } else if (days > 20 && days <= 60) {
      dailyImpressionsMin = 28000;
      dailyImpressionsMax = 75000;
    } else if (days > 60) {
      dailyImpressionsMin = 45000;
      dailyImpressionsMax = 120000;
    }

    // 2. Format multiplier
    let formatWeight = 1.0;
    if (ad.formatType === 'video') {
      formatWeight = 1.35; // Meta video view & reel bidding requires higher CPM/ad spend
    } else if (ad.formatType === 'carousel') {
      formatWeight = 1.20; // Multi-card interactive format
    }

    // 3. CPM baseline in INR
    let minCpmInr = benchmark.minCpm;
    let maxCpmInr = benchmark.maxCpm;
    if (benchmark.currency === 'USD') {
      minCpmInr = benchmark.minCpm * USD_TO_INR;
      maxCpmInr = benchmark.maxCpm * USD_TO_INR;
    }

    // Spend = (Impressions / 1,000) * CPM * formatWeight
    const adDailyMin = (dailyImpressionsMin / 1000) * minCpmInr * formatWeight;
    const adDailyMax = (dailyImpressionsMax / 1000) * maxCpmInr * formatWeight;

    totalDailyMinInr += adDailyMin;
    totalDailyMaxInr += adDailyMax;
  }

  // Monthly projection (30-day run rate with account diversification discounting)
  // Accounts running multiple ads receive shared audience frequency cap discounts
  const accountSizeDiscount = Math.max(0.65, 1 - Math.min(0.35, ads.length * 0.015));
  const minMonthlyInr = Math.round(totalDailyMinInr * 30 * accountSizeDiscount);
  const maxMonthlyInr = Math.round(totalDailyMaxInr * 30 * accountSizeDiscount);

  const minMonthlyUsd = Math.round(minMonthlyInr * INR_TO_USD);
  const maxMonthlyUsd = Math.round(maxMonthlyInr * INR_TO_USD);

  // Formatting for Indian number system (Lakhs / Crores) or Thousands / Millions
  const formatInr = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formattedRange = `${formatInr(minMonthlyInr)} – ${formatInr(maxMonthlyInr)} / month (approx. $${minMonthlyUsd.toLocaleString()} – $${maxMonthlyUsd.toLocaleString()})`;

  return {
    minMonthlyInr,
    maxMonthlyInr,
    minMonthlyUsd,
    maxMonthlyUsd,
    currency: benchmark.currency,
    formattedRange,
    methodologyNote: `Estimated — not actual Meta data. Calculated using ${ads.length} active ads, duration weighting, format tier multipliers (${benchmark.industry}), and benchmark CPM of ₹${benchmark.minCpm}–₹${benchmark.maxCpm}.`,
    cpmBenchmarkUsed: {
      industry: benchmark.industry,
      region: benchmark.region,
      cpmMin: benchmark.minCpm,
      cpmMax: benchmark.maxCpm,
      currency: benchmark.currency
    }
  };
}
