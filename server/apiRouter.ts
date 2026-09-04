import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { scraper } from './scraper.js';
import { generateStrategicAnalysis } from './geminiAnalysis.js';
import { db } from './db.js';
import { CPM_BENCHMARKS } from './benchmarks.js';
import { estimateMonthlySpendRange } from './budgetEstimator.js';
import { AdIntelPayload, ScrapeJobStatus, CompetitorScrapeRecord } from './types.js';

export const apiRouter = express.Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// In-memory active job tracker for live status & telemetry stream
const activeJobs = new Map<string, ScrapeJobStatus>();

// Helper to push logs to job
function addJobLog(jobId: string, message: string, level: 'info' | 'warn' | 'success' | 'error' = 'info') {
  const job = activeJobs.get(jobId);
  if (job) {
    job.logs.push({
      timestamp: new Date().toLocaleTimeString(),
      message,
      level
    });
  }
}

/**
 * POST /api/research
 * Main research trigger: scrapes competitors, calculates heuristic budgets, calls Gemini, persists to DB
 */
apiRouter.post('/research', async (req: Request, res: Response) => {
  try {
    const payload: AdIntelPayload = req.body;

    if (!payload.brandName || !payload.competitorNames || payload.competitorNames.length === 0) {
      return res.status(400).json({
        error: 'Missing required parameters: brandName and at least 1 competitor name are required.'
      });
    }

    const filteredCompetitors = payload.competitorNames
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (filteredCompetitors.length === 0) {
      return res.status(400).json({ error: 'Please provide at least 1 valid competitor brand.' });
    }

    const jobId = crypto.randomUUID();
    const jobStatus: ScrapeJobStatus = {
      jobId,
      status: 'queued',
      completedCompetitors: [],
      totalCompetitors: filteredCompetitors.length,
      logs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `Research session initialized for "${payload.brandName}" targeting [${filteredCompetitors.join(', ')}]`,
          level: 'info'
        }
      ]
    };
    activeJobs.set(jobId, jobStatus);

    // Run scraping with progress tracking
    addJobLog(jobId, `Starting Meta Ad Library scraping with randomized 3-8s anti-bot delay queue...`, 'info');

    const scrapedCompetitors = await scraper.executeCompetitorBatch(payload, (update) => {
      const currentJob = activeJobs.get(jobId);
      if (currentJob) {
        currentJob.status = update.status;
        if (update.currentCompetitor) currentJob.currentCompetitor = update.currentCompetitor;
        if (update.delaySeconds !== undefined) currentJob.delayRemainingSeconds = update.delaySeconds;
        currentJob.logs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: update.message,
          level: update.level || 'info'
        });
      }
    });

    // 2. Generate Strategic Analysis with Gemini
    const currentJob = activeJobs.get(jobId);
    if (currentJob) {
      currentJob.status = 'analyzing';
      currentJob.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        message: 'Synthesizing competitor ad creative patterns and calling Gemini strategic marketing engine...',
        level: 'info'
      });
    }

    const analysis = await generateStrategicAnalysis(payload, scrapedCompetitors);

    // 3. Save full campaign dossier
    db.saveAnalysis(jobId, payload, analysis, scrapedCompetitors);

    if (currentJob) {
      currentJob.status = 'completed';
      currentJob.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        message: 'Strategic competitive intelligence report generated successfully.',
        level: 'success'
      });
      currentJob.results = {
        competitors: scrapedCompetitors,
        analysis,
        searchParams: payload
      };
    }

    res.json({
      success: true,
      jobId,
      competitors: scrapedCompetitors,
      analysis,
      searchParams: payload
    });
  } catch (error: any) {
    console.error('[API] /research error:', error);
    res.status(500).json({
      error: error.message || 'An unexpected error occurred during research execution.'
    });
  }
});

/**
 * GET /api/job-status/:jobId
 * Real-time polling endpoint for scraper queue and live logs
 */
apiRouter.get('/job-status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

/**
 * GET /api/benchmarks
 * Returns hardcoded CPM benchmark table by industry/region
 */
apiRouter.get('/benchmarks', (_req: Request, res: Response) => {
  res.json({
    benchmarks: Object.values(CPM_BENCHMARKS)
  });
});

/**
 * POST /api/re-estimate
 * Recalculates spend range for a competitor with custom CPM numbers
 */
apiRouter.post('/re-estimate', (req: Request, res: Response) => {
  const { ads, industry, location, customMinCpm, customMaxCpm } = req.body;
  const customBenchmark = (customMinCpm && customMaxCpm) ? {
    id: 'custom',
    industry: industry || 'Custom Industry',
    region: location || 'Custom Region',
    currency: 'INR' as const,
    minCpm: Number(customMinCpm),
    maxCpm: Number(customMaxCpm),
    avgCtrPercent: 1.5,
    description: 'Custom user-specified CPM parameters'
  } : undefined;

  const spendRange = estimateMonthlySpendRange(ads || [], industry, location, customBenchmark);
  res.json({ spendRange });
});

/**
 * GET /api/history
 * Returns recent searches and past dossiers
 */
apiRouter.get('/history', (_req: Request, res: Response) => {
  const analyses = db.getRecentAnalyses();
  const records = db.getAllRecords();
  res.json({
    analyses,
    recordsCount: records.length
  });
});

/**
 * GET /api/dossier/:id
 * Retrieve specific saved campaign dossier
 */
apiRouter.get('/dossier/:id', (req: Request, res: Response) => {
  const dossier = db.getAnalysisById(req.params.id);
  if (!dossier) {
    return res.status(404).json({ error: 'Dossier not found' });
  }
  res.json(dossier);
});

/**
 * GET /api/records
 * Returns all competitor records in database
 */
apiRouter.get('/records', (_req: Request, res: Response) => {
  res.json({
    records: db.getAllRecords()
  });
});
