// Client-side website analytics — no backend.
// Events are stored in a SEPARATE localStorage key (not AdminData) so tracking
// works on public pages without the admin provider. This module is server-safe:
// NO "use client", NO React imports — browser APIs only inside guarded functions.

export type DeviceType = "desktop" | "tablet" | "mobile";

export interface VisitEvent {
  t: number; // epoch ms
  path: string; // e.g. "/lawyers/x"
  ref: string; // document.referrer
  src: string; // source bucket
  medium: string; // medium bucket
  campaign: string; // utm_campaign
  device: DeviceType;
  browser: string;
  os: string;
  country: string; // ISO-2
  lang: string; // navigator.language
  vid: string; // visitor id
  sid?: string; // session id (set for first event of a session)
  dur?: number; // session duration in ms (set on session finalize)
  bounce?: boolean; // true if session had a single pageview
}

export interface AnalyticsSettings {
  enabled: boolean;
  trackPublic: boolean;
  retentionDays: number;
  defaultCountry: string;
  ignoreBots: boolean;
  ignorePaths: string[];
  sampleRate: number; // 1..100
  exposeSchema: boolean; // emit JSON-LD Dataset on public site
}

export interface AnalyticsSummary {
  total: number;
  visitors: number;
  pageviews: number;
  avgDuration: number; // average session duration (ms) for finalized sessions
  bounceRate: number; // 0..100 percentage of single-page sessions
  byDay: { date: string; visits: number }[];
  byDevice: { name: string; value: number }[];
  byBrowser: { name: string; value: number }[];
  byCountry: { name: string; value: number }[];
  bySource: { name: string; value: number }[];
  byMedium: { name: string; value: number }[];
  topPages: { name: string; value: number }[];
  byHour: { hour: number; visits: number }[];
  byLang: { name: string; value: number }[];
}

const ANALYTICS_KEY = "site_analytics_v1";
const VISITOR_KEY = "site_visitor_id";
const SESSION_KEY = "site_session_v1"; // per-tab session marker
const MAX_EVENTS = 50000;

export const analyticsDefaults: AnalyticsSettings = {
  enabled: true,
  trackPublic: true,
  retentionDays: 180,
  defaultCountry: "IQ",
  ignoreBots: true,
  ignorePaths: ["/admin"],
  sampleRate: 100,
  exposeSchema: false,
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getVisitorId(): string {
  if (!isBrowser()) return "ssr";
  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = "v-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    try {
      window.localStorage.setItem(VISITOR_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

export function detectDevice(ua: string): DeviceType {
  if (/tablet|ipad|kindle/i.test(ua)) return "tablet";
  if (/mobi|android.*mobile|iphone|ipod|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

export function detectBrowser(ua: string): string {
  if (/edg/i.test(ua)) return "edge";
  if (/opr|opera/i.test(ua)) return "opera";
  if (/chrome|chromium/i.test(ua) && !/edg/i.test(ua)) return "chrome";
  if (/samsungbrowser/i.test(ua)) return "samsung";
  if (/firefox|fxios/i.test(ua)) return "firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "safari";
  return "other";
}

export function detectOs(ua: string): string {
  if (/windows nt/i.test(ua)) return "windows";
  if (/mac os x|macintosh/i.test(ua)) return "macos";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  if (/linux/i.test(ua)) return "linux";
  return "other";
}

const SEARCH_HOSTS = ["google", "bing", "duckduckgo", "yahoo", "yandex", "ecosia", "baidu"];
const SOCIAL_HOSTS: Record<string, string> = {
  facebook: "facebook",
  fb: "facebook",
  instagram: "instagram",
  twitter: "twitter",
  x: "twitter",
  linkedin: "linkedin",
  youtube: "youtube",
  t: "telegram",
  telegram: "telegram",
  pinterest: "pinterest",
  reddit: "reddit",
  tiktok: "tiktok",
};

export function resolveSource(
  referrer: string,
  utm?: { source?: string; medium?: string; campaign?: string }
): { src: string; medium: string } {
  const src = (utm?.source || "").trim().toLowerCase();
  const med = (utm?.medium || "").trim().toLowerCase();
  if (src) {
    let bucket = src;
    for (const key of Object.keys(SOCIAL_HOSTS)) {
      if (src.includes(key)) bucket = SOCIAL_HOSTS[key];
    }
    const mediumBucket = med || (SOCIAL_HOSTS[src] ? "social" : "referral");
    return { src: bucket, medium: mediumBucket };
  }
  if (!referrer) return { src: "direct", medium: "direct" };
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    for (const s of SEARCH_HOSTS) {
      if (host.includes(s)) return { src: s, medium: "organic" };
    }
    for (const key of Object.keys(SOCIAL_HOSTS)) {
      if (host.includes(key)) return { src: SOCIAL_HOSTS[key], medium: "social" };
    }
    return { src: host, medium: "referral" };
  } catch {
    return { src: "referral", medium: "referral" };
  }
}

function readUtm(): { source?: string; medium?: string; campaign?: string } {
  if (!isBrowser()) return {};
  const out: { source?: string; medium?: string; campaign?: string } = {};
  try {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("utm_source");
    const m = params.get("utm_medium");
    const c = params.get("utm_campaign");
    if (s) out.source = s;
    if (m) out.medium = m;
    if (c) out.campaign = c;
  } catch {
    /* ignore */
  }
  return out;
}

function isBot(ua: string): boolean {
  return /bot|spider|crawl|slurp|mediapartners|preview|headless|phantom/i.test(ua);
}

export function recordVisit(opts?: { settings?: AnalyticsSettings }): void {
  if (!isBrowser()) return;
  const settings = opts?.settings || analyticsDefaults;
  if (!settings.enabled) return;
  if (!settings.trackPublic) return;
  if (settings.sampleRate < 100 && Math.random() * 100 > settings.sampleRate) return;

  const ua = navigator.userAgent || "";
  if (settings.ignoreBots && isBot(ua)) return;

  const path = window.location.pathname || "/";
  if (settings.ignorePaths.some((p) => path === p || path.startsWith(p + "/"))) return;

  const referrer = document.referrer || "";
  const utm = readUtm();
  const { src, medium } = resolveSource(referrer, utm);

  // session tracking (per-tab, survives SPA navigations within the tab)
  const sid = beginSession();

  const event: VisitEvent = {
    t: Date.now(),
    path,
    ref: referrer,
    src,
    medium,
    campaign: utm.campaign || "",
    device: detectDevice(ua),
    browser: detectBrowser(ua),
    os: detectOs(ua),
    country: settings.defaultCountry || "IQ",
    lang: navigator.language || "ar-IQ",
    vid: getVisitorId(),
    sid,
  };

  try {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    const events: VisitEvent[] = raw ? (JSON.parse(raw) as VisitEvent[]) : [];
    events.push(event);
    // prune by retention
    const cutoff = Date.now() - settings.retentionDays * 86400000;
    let kept = events.filter((e) => e.t >= cutoff);
    if (kept.length > MAX_EVENTS) kept = kept.slice(kept.length - MAX_EVENTS);
    window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(kept));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

// Returns the active session id, creating one in sessionStorage on first call.
function beginSession(): string {
  if (!isBrowser()) return "ssr";
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const sid = "s-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.sessionStorage.setItem(SESSION_KEY, sid);
    return sid;
  } catch {
    return "ssr";
  }
}

// Called on page hide / tab close. Finalizes the session: computes duration and
// bounce flag, then writes them onto the first event sharing this session id.
export function finalizeSession(): void {
  if (!isBrowser()) return;
  let sid: string | null = null;
  try {
    sid = window.sessionStorage.getItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
  if (!sid) return;

  try {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    if (!raw) return;
    const events: VisitEvent[] = JSON.parse(raw) as VisitEvent[];
    const sessionEvents = events.filter((e) => e.sid === sid);
    if (sessionEvents.length === 0) return;

    const start = sessionEvents[0].t;
    const duration = Date.now() - start;
    const bounce = sessionEvents.length === 1;

    // tag the first event of the session (kept sorted by t)
    let done = false;
    const next = events.map((e) => {
      if (!done && e.sid === sid) {
        done = true;
        return { ...e, dur: duration, bounce };
      }
      return e;
    });

    window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function loadEvents(): VisitEvent[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    return raw ? (JSON.parse(raw) as VisitEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearEvents(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(ANALYTICS_KEY);
  } catch {
    /* ignore */
  }
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function countBy<T>(items: T[], key: (i: T) => string): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export interface DateRange {
  from: number; // epoch ms inclusive
  to: number; // epoch ms inclusive
}

export function summarizeRange(events: VisitEvent[], range: DateRange): AnalyticsSummary {
  const { from, to } = range;
  const windowEvents = events.filter((e) => e.t >= from && e.t <= to);

  const spanDays = Math.max(1, Math.ceil((to - from) / 86400000));
  // by day (fill gaps across the selected range)
  const dayMap = new Map<string, number>();
  for (const e of windowEvents) {
    const k = dayKey(e.t);
    dayMap.set(k, (dayMap.get(k) || 0) + 1);
  }
  const byDay: { date: string; visits: number }[] = [];
  for (let i = spanDays - 1; i >= 0; i--) {
    const d = new Date(to - i * 86400000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${day}`;
    byDay.push({ date: key, visits: dayMap.get(key) || 0 });
  }

  const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, visits: 0 }));
  for (const e of windowEvents) {
    const h = new Date(e.t).getHours();
    byHour[h].visits += 1;
  }

  const visitors = new Set(windowEvents.map((e) => e.vid)).size;

  // engagement: only finalized sessions (first event carries dur/bounce)
  const finalized = windowEvents.filter((e) => typeof e.dur === "number");
  const avgDuration =
    finalized.length > 0
      ? Math.round(finalized.reduce((sum, e) => sum + (e.dur || 0), 0) / finalized.length)
      : 0;
  const bounced = finalized.filter((e) => e.bounce).length;
  const bounceRate = finalized.length > 0 ? Math.round((bounced / finalized.length) * 100) : 0;

  return {
    total: windowEvents.length,
    visitors,
    pageviews: windowEvents.length,
    avgDuration,
    bounceRate,
    byDay,
    byDevice: countBy(windowEvents, (e) => e.device),
    byBrowser: countBy(windowEvents, (e) => e.browser),
    byCountry: countBy(windowEvents, (e) => e.country),
    bySource: countBy(windowEvents, (e) => e.src),
    byMedium: countBy(windowEvents, (e) => e.medium),
    topPages: countBy(windowEvents, (e) => e.path).slice(0, 15),
    byHour,
    byLang: countBy(windowEvents, (e) => e.lang),
  };
}

export function summarize(events: VisitEvent[], days = 30): AnalyticsSummary {
  const now = Date.now();
  const from = now - days * 86400000;
  return summarizeRange(events, { from, to: now });
}

export interface CompareResult {
  current: AnalyticsSummary;
  previous: AnalyticsSummary;
  delta: {
    pageviews: number; // percentage, e.g. +12.5 / -4.0
    visitors: number;
    total: number;
  };
}

function pctChange(cur: number, prev: number): number {
  if (prev === 0) return cur === 0 ? 0 : 100;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export function comparePeriods(
  events: VisitEvent[],
  current: DateRange,
  previous: DateRange
): CompareResult {
  const cur = summarizeRange(events, current);
  const prev = summarizeRange(events, previous);
  return {
    current: cur,
    previous: prev,
    delta: {
      pageviews: pctChange(cur.pageviews, prev.pageviews),
      visitors: pctChange(cur.visitors, prev.visitors),
      total: pctChange(cur.total, prev.total),
    },
  };
}

export function eventsToCsv(events: VisitEvent[]): string {
  const header = [
    "timestamp",
    "date",
    "path",
    "source",
    "medium",
    "campaign",
    "device",
    "browser",
    "os",
    "country",
    "lang",
    "visitor",
  ];
  const rows = events.map((e) => [
    new Date(e.t).toISOString(),
    dayKey(e.t),
    e.path,
    e.src,
    e.medium,
    e.campaign,
    e.device,
    e.browser,
    e.os,
    e.country,
    e.lang,
    e.vid,
  ]);
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [header.join(","), ...rows.map((r) => r.map((c) => esc(String(c))).join(","))].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  try {
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    /* ignore */
  }
}

// JSON-LD Dataset describing aggregate analytics for search engines / data catalogs.
export function analyticsToJsonLd(summary: AnalyticsSummary, siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `إحصائيات زيارات ${siteName}`,
    description: `مجموعة بيانات تصف زيارات الموقع: ${summary.pageviews} مشاهدة و${summary.visitors} زائر فريد.`,
    creator: { "@type": "Organization", name: siteName },
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: "/sitemap.xml",
      },
    ],
    variableMeasured: [
      { "@type": "PropertyValue", name: "pageviews", value: summary.pageviews },
      { "@type": "PropertyValue", name: "visitors", value: summary.visitors },
    ],
  };
}
