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
    query: brandName,
    country: countryCode,
    category: 'all',
    mediaType: 'all',
    sortBy: 'mostRecent',
    activeStatus: 'active',
    advertisers: [],
    fetchDetails: false,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL']
    }
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
    console.log(`[Apify] Raw response for "${brandName}": ${Array.isArray(items) ? items.length : 'not-an-array'} items.`);
    if (!Array.isArray(items) || items.length === 0) {
      console.warn(`[Apify] No ads returned for "${brandName}". Raw sample: ${JSON.stringify(items).slice(0, 500)}`);
      return [];
    }

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const ads: ScrapedAd[] = items.slice(0, maxResults).map((item: any, idx: number) => {
      // Field names below are best-effort based on the actor's documented output schema.
      // Adjust these keys if the actor's actual field names differ.
      const startDateRaw = item.start_date;
      const startedRunningOn = startDateRaw
        ? new Date(startDateRaw * 1000).toISOString().split('T')[0]
        : new Date(now - 7 * dayMs).toISOString().split('T')[0];
      const daysActive = startDateRaw
        ? Math.max(1, Math.round((now - startDateRaw * 1000) / dayMs))
        : 7;

      const snapshot = item.snapshot || {};
      const images = snapshot.images || [];
      const videos = snapshot.videos || [];

      let formatType: ScrapedAd['formatType'] = 'image';
      if (videos.length > 0) formatType = 'video';
      else if (images.length > 1) formatType = 'carousel';

      const creativeUrl =
        images?.[0]?.original_image_url ||
        images?.[0]?.resized_image_url ||
        videos?.[0]?.video_preview_image_url ||
        snapshot.page_profile_picture_url ||
        '';

      return {
        id: item.ad_archive_id || `apify_${brandName}_${idx}`,
        pageName: snapshot.page_name || brandName,
        adArchiveId: item.ad_archive_id,
        creativeUrl,
        formatType,
        adCopy: (snapshot.body?.text || snapshot.caption || snapshot.title || '').replace(/<[^>]*>?/gm, ''),
        headline: snapshot.title,
        displayUrl: snapshot.link_description,
        startedRunningOn,
        daysActive,
        ctaText: snapshot.cta_text || 'Learn More',
        linkUrl: snapshot.link_url,
        platforms: ['facebook', 'instagram'],
        libraryUrl: `https://www.facebook.com/ads/library/?id=${item.ad_archive_id || ''}`
      };
    });

    console.log(`[Apify] Retrieved ${ads.length} real ads for "${brandName}".`);
    return ads;
  } catch (err: any) {
    console.error(`[Apify] Fetch failed for "${brandName}": ${err?.message || err}`);
    return [];
  }
}
