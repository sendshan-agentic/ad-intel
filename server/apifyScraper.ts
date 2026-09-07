import { ScrapedAd } from './types.js';

/**
 * Fetches real, live ad data from Meta Ad Library via the Apify "Facebook (Meta) Ads
 * Library Scraper" actor by Iñigo Garcia Olaizola (apify.com/igolaizola/facebook-ad-library-scraper).
 *
 * Requires an APIFY_API_TOKEN environment variable. New Apify accounts include free trial
 * credit, and this actor is priced at $0.75 per 1,000 results, so a handful of test
 * searches cost effectively nothing.
 */
export async function fetchRealAdsFromApify(
  brandName: string,
  countryCode: string,
  maxResults: number = 6
): Promise<ScrapedAd[]> {
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    console.warn('[Apify] APIFY_API_TOKEN not set — skipping real scrape, falling back.');
    return [];
  }

  const actorId = 'igolaizola~facebook-ad-library-scraper';
  const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apiToken}`;

  const input = {
    maxItems: maxResults,
    searchQuery: brandName,
    country: countryCode
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // Apify runs can take longer than a typical API call

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[Apify] Request failed with status ${response.status}: ${await response.text()}`);
      return [];
    }

    const items: any[] = await response.json();
    if (!Array.isArray(items) || items.length === 0) {
      console.warn(`[Apify] No ads returned for "${brandName}".`);
      return [];
    }

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const ads: ScrapedAd[] = items.slice(0, maxResults).map((item: any, idx: number) => {
      // Field names below are best-effort based on the actor's documented output schema.
      // Adjust these keys if the actor's actual field names differ.
      const startDateRaw = item.startDate || item.start_date || item.ad_delivery_start_time || item.createdTime || item.created_time;
      const startedRunningOn = startDateRaw
        ? new Date(startDateRaw).toISOString().split('T')[0]
        : new Date(now - 7 * dayMs).toISOString().split('T')[0];
      const daysActive = startDateRaw
        ? Math.max(1, Math.round((now - new Date(startDateRaw).getTime()) / dayMs))
        : 7;

      let formatType: ScrapedAd['formatType'] = 'image';
      if (item.creativeType === 'video' || item.videos?.length > 0 || item.video_url || item.videoUrl) formatType = 'video';
      else if (item.creativeType === 'carousel' || (item.images && item.images.length > 1)) formatType = 'carousel';

      const creativeUrl =
        item.images?.[0]?.originalUrl ||
        item.images?.[0]?.resizedUrl ||
        item.images?.[0] ||
        item.imageUrl ||
        item.image_url ||
        item.videos?.[0]?.thumbnailUrl ||
        item.thumbnailUrl ||
        item.snapshot_url ||
        '';

      return {
        id: item.id || item.ad_id || item.adId || `apify_${brandName}_${idx}`,
        pageName: item.pageName || item.page_name || item.advertiser || brandName,
        adArchiveId: item.id || item.ad_id || item.adId,
        creativeUrl,
        formatType,
        adCopy: (item.body || item.ad_body_text || item.text || item.adText || item.title || '').replace(/<[^>]*>?/gm, ''),
        headline: item.title || item.ad_headline || item.headline,
        displayUrl: item.linkDomain || item.linkUrlClean || item.link,
        startedRunningOn,
        daysActive,
        ctaText: item.ctaText || item.cta_text || 'Learn More',
        linkUrl: item.linkUrlClean || item.landing_page_url || item.link,
        platforms: item.platforms || ['facebook', 'instagram'],
        libraryUrl: item.adLibraryUrl || item.ad_snapshot_url || item.snapshotUrl || `https://www.facebook.com/ads/library/?id=${item.id || item.ad_id || ''}`
      };
    });

    console.log(`[Apify] Retrieved ${ads.length} real ads for "${brandName}".`);
    return ads;
  } catch (err: any) {
    console.error(`[Apify] Fetch failed for "${brandName}": ${err?.message || err}`);
    return [];
  }
}

