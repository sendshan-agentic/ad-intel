import fs from 'fs';
import path from 'path';
import { CompetitorScrapeRecord, StrategicAnalysisResult, AdIntelPayload } from './types.js';

interface DatabaseSchema {
  records: Record<string, CompetitorScrapeRecord>; // key: `${brand.toLowerCase()}_${date}`
  analyses: Record<string, {
    id: string;
    searchParams: AdIntelPayload;
    analysis: StrategicAnalysisResult;
    competitorIds: string[];
    createdAt: string;
  }>;
  recentSearches: Array<{
    id: string;
    brandName: string;
    competitors: string[];
    timestamp: string;
  }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'ad_intel_database.json');

class DatabaseService {
  private data: DatabaseSchema = {
    records: {},
    analyses: {},
    recentSearches: []
  };
  private isLoaded = false;

  private ensureLoaded() {
    if (this.isLoaded) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.persist();
      }
    } catch (err) {
      console.warn('[DB] Failed to load database file, initializing in-memory store:', err);
    }
    this.isLoaded = true;
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error persisting database:', err);
    }
  }

  public generateRecordKey(brand: string, date: string): string {
    return `${brand.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}_${date}`;
  }

  public upsertCompetitorRecord(record: CompetitorScrapeRecord): CompetitorScrapeRecord {
    this.ensureLoaded();
    const key = this.generateRecordKey(record.brand, record.scrapeDate);
    const existing = this.data.records[key];

    const updatedRecord: CompetitorScrapeRecord = {
      ...record,
      id: key,
      updatedAt: new Date().toISOString(),
      // Preserve history if re-running
      ads: record.ads.length > 0 ? record.ads : (existing?.ads || [])
    };

    this.data.records[key] = updatedRecord;
    this.persist();
    console.log(`[DB] Upserted record for "${record.brand}" on ${record.scrapeDate} (key: ${key})`);
    return updatedRecord;
  }

  public getRecord(brand: string, date: string): CompetitorScrapeRecord | null {
    this.ensureLoaded();
    const key = this.generateRecordKey(brand, date);
    return this.data.records[key] || null;
  }

  public getLatestRecordForBrand(brand: string): CompetitorScrapeRecord | null {
    this.ensureLoaded();
    const normalized = brand.toLowerCase().trim();
    const matches = Object.values(this.data.records).filter(
      r => r.brand.toLowerCase().trim() === normalized
    );
    if (matches.length === 0) return null;
    matches.sort((a, b) => new Date(b.scrapeDate).getTime() - new Date(a.scrapeDate).getTime());
    return matches[0];
  }

  public getAllRecords(): CompetitorScrapeRecord[] {
    this.ensureLoaded();
    return Object.values(this.data.records);
  }

  public saveAnalysis(
    analysisId: string,
    params: AdIntelPayload,
    analysis: StrategicAnalysisResult,
    competitors: CompetitorScrapeRecord[]
  ) {
    this.ensureLoaded();
    const recordKeys = competitors.map(c => this.generateRecordKey(c.brand, c.scrapeDate));

    this.data.analyses[analysisId] = {
      id: analysisId,
      searchParams: params,
      analysis,
      competitorIds: recordKeys,
      createdAt: new Date().toISOString()
    };

    // Update recent searches
    this.data.recentSearches.unshift({
      id: analysisId,
      brandName: params.brandName,
      competitors: params.competitorNames,
      timestamp: new Date().toISOString()
    });

    // Keep top 20
    if (this.data.recentSearches.length > 20) {
      this.data.recentSearches = this.data.recentSearches.slice(0, 20);
    }

    this.persist();
  }

  public getRecentAnalyses() {
    this.ensureLoaded();
    return Object.values(this.data.analyses).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getAnalysisById(id: string) {
    this.ensureLoaded();
    const entry = this.data.analyses[id];
    if (!entry) return null;
    const competitors = entry.competitorIds
      .map(k => this.data.records[k])
      .filter(Boolean);
    return {
      ...entry,
      competitors
    };
  }
}

export const db = new DatabaseService();
