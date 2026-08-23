/**
 * Shared server-side cache for the site-data payload.
 * Both /api/site-data and /api/admin/data import this module so
 * admin saves can invalidate the cache immediately.
 */
const SITE_DATA_SERVER_TTL = 30_000; // ms

interface SiteDataCache {
  payload: unknown;
  ts: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __siteDataCache: SiteDataCache | null | undefined;
}

const cache: SiteDataCache | null = global.__siteDataCache ?? null;
if (typeof global.__siteDataCache === "undefined") {
  global.__siteDataCache = cache;
}

export function getSiteDataCache(): SiteDataCache | null {
  return global.__siteDataCache ?? null;
}

export function setSiteDataCache(payload: unknown) {
  global.__siteDataCache = { payload, ts: Date.now() };
}

export function isSiteDataCacheValid(): boolean {
  const c = global.__siteDataCache;
  return !!c && Date.now() - c.ts < SITE_DATA_SERVER_TTL;
}

export function invalidateSiteDataCache() {
  global.__siteDataCache = null;
}
