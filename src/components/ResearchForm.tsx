import React, { useState } from 'react';
import { AdIntelPayload } from '../types';
import { Plus, Trash2, Search, Sparkles, Building, MapPin, Users, Target, ShieldAlert } from 'lucide-react';

interface ResearchFormProps {
  onSubmit: (payload: AdIntelPayload) => void;
  isLoading: boolean;
}

export const PRESETS: Array<{
  name: string;
  industry: string;
  data: AdIntelPayload;
}> = [
  {
    name: 'EdTech India (Board/NEET/JEE)',
    industry: 'EdTech',
    data: {
      brandName: 'NextGen Academy',
      targetAudience: 'Parents of students aged 15-18, tier 2/3 cities India',
      targetLocation: 'India (Tier 2 & Tier 3 Cities)',
      adTopics: 'Class 10 & 12 Board Exam Prep + NEET/JEE Foundation, affordable live coaching with 1-on-1 doubt solving',
      competitorNames: ['PhysicsWallah', 'Vedantu', 'Allen Career Institute'],
      industry: 'EdTech / Test Prep'
    }
  },
  {
    name: 'Quick Commerce & Grocery',
    industry: 'Q-Commerce',
    data: {
      brandName: 'SpeedGrocer',
      targetAudience: 'Working professionals, students & nuclear families aged 20-38',
      targetLocation: 'India (Tier 1 Metros: Bengaluru, Mumbai, Delhi-NCR)',
      adTopics: '10-minute fresh produce, midnight snacking, dairy essentials and zero minimum order delivery',
      competitorNames: ['Zepto', 'Blinkit', 'Swiggy Instamart'],
      industry: 'D2C / E-Commerce'
    }
  },
  {
    name: 'D2C Men’s Fashion & Streetwear',
    industry: 'D2C Fashion',
    data: {
      brandName: 'StitchCore',
      targetAudience: 'Men aged 18-28 seeking premium modern fits and affordable streetwear',
      targetLocation: 'Pan-India (Tier 1 & Tier 2 hubs)',
      adTopics: 'Oversized heavy-blend tees, structured linen shirts, breathable utility cargo pants',
      competitorNames: ['Snitch', 'Bewakoof', 'The Souled Store'],
      industry: 'D2C / Fashion'
    }
  }
];

export const ResearchForm: React.FC<ResearchFormProps> = ({ onSubmit, isLoading }) => {
  const [brandName, setBrandName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [adTopics, setAdTopics] = useState('');
  const [competitors, setCompetitors] = useState<string[]>(['']);
  const [selectedIndustry, setSelectedIndustry] = useState('EdTech / K-12 / Test Prep');

  const addCompetitorField = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, '']);
    }
  };

  const removeCompetitorField = (index: number) => {
    if (competitors.length > 1) {
      const updated = competitors.filter((_, i) => i !== index);
      setCompetitors(updated);
    }
  };

  const updateCompetitor = (index: number, val: string) => {
    const updated = [...competitors];
    updated[index] = val;
    setCompetitors(updated);
  };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setBrandName(preset.data.brandName);
    setTargetAudience(preset.data.targetAudience);
    setTargetLocation(preset.data.targetLocation);
    setAdTopics(preset.data.adTopics);
    setCompetitors([...preset.data.competitorNames]);
    setSelectedIndustry(preset.data.industry || 'EdTech');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validCompetitors = competitors.map(c => c.trim()).filter(Boolean);
    if (!brandName.trim() || validCompetitors.length === 0) return;

    onSubmit({
      brandName: brandName.trim(),
      targetAudience: targetAudience.trim(),
      targetLocation: targetLocation.trim(),
      adTopics: adTopics.trim(),
      competitorNames: validCompetitors,
      industry: selectedIndustry
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-900">
      {/* Header & Preset Quickloader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Competitive Research Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure target market parameters and competitor brands to scrape from Meta Ad Library
          </p>
        </div>

        {/* 1-Click Preset Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Presets:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(p)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-md font-medium transition active:scale-95 disabled:opacity-50"
            >
              {p.industry}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Brand & Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              My Brand Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. NextGen Academy"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 placeholder-slate-400 font-medium transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              Target Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              placeholder="e.g. India (Tier 2/3 Cities), Pan-India, US"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 placeholder-slate-400 transition"
            />
          </div>
        </div>

        {/* Target Audience & Industry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Target Audience <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder='e.g. parents of students aged 15-18, tier 2/3 cities India'
              className="w-full px-3.5 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 placeholder-slate-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
              Industry Domain
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 transition"
            >
              <option value="EdTech / K-12 / Test Prep">EdTech / K-12 / Test Prep</option>
              <option value="D2C / E-Commerce / Consumer Goods">D2C / E-Commerce / Consumer Goods</option>
              <option value="Fintech / BFSI / Lending / Wealth">Fintech / BFSI / Lending / Wealth</option>
              <option value="Healthcare / Wellness / Fitness">Healthcare / Wellness / Fitness</option>
              <option value="B2B SaaS / Enterprise Tech">B2B SaaS / Enterprise Tech</option>
              <option value="Marketing / Digital Agency / B2B Services">Marketing / Digital Agency / B2B Services</option>
              <option value="Real Estate / Property Developers">Real Estate / Property Developers</option>
              <option value="General Commercial Benchmark">General Commercial Benchmark</option>
            </select>
          </div>
        </div>

        {/* Ad Topics / Campaign Focus */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
            Ad Topics & Campaign Focus <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={adTopics}
            onChange={(e) => setAdTopics(e.target.value)}
            placeholder="e.g. Class 10 & 12 Board Prep, NEET/JEE Foundation batches, 1-on-1 doubt solving, scholarship tests"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 placeholder-slate-400 resize-none leading-relaxed transition"
          />
        </div>

        {/* Competitor Brand Names (Dynamic Add / Remove) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
              Competitor Brand Names (2–3 brands to scrape from Meta Ad Library) <span className="text-rose-500">*</span>
            </label>
            {competitors.length < 5 && (
              <button
                type="button"
                onClick={addCompetitorField}
                disabled={isLoading}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Competitor
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {competitors.map((comp, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-400 select-none">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    required
                    value={comp}
                    onChange={(e) => updateCompetitor(idx, e.target.value)}
                    placeholder={`Competitor ${idx + 1}`}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-medium placeholder-slate-400 transition"
                  />
                </div>
                {competitors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompetitorField(idx)}
                    disabled={isLoading}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                    title="Remove competitor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scraper & Queue Protocol Notice */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-800">Anti-Block Scraper Queue Protocol:</span>
            <span className="ml-1">
              Requests execute sequentially with randomized <strong>3–8 second delays</strong> between competitors, reverse-engineering Meta Ad Library GraphQL and DOM pagination to extract active creatives, formats, and start dates.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-500 font-mono">
            Desktop Shortcut: <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 text-[11px] font-semibold">Ctrl / Cmd + Enter</kbd> to launch
          </span>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Scraping Meta Ad Library...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Launch Competitive Research</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
