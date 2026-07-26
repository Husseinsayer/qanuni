"use client";

import { useState, useEffect, useCallback } from "react";
import { seoDefaults } from "./seo-defaults";
import { analyticsDefaults, type AnalyticsSettings } from "./analytics";
import {
  type Law,
  type Lawyer,
  type Article,
  type LawFirm,
  type SampleArticle,
  type ArticleBlock,
  laws as defaultLaws,
  lawyers as defaultLawyers,
  articles as defaultArticles,
  lawFirms as defaultLawFirms,
  services as defaultServices,
  features as defaultFeatures,
  testimonials as defaultTestimonials,
  faqs as defaultFaqs,
  stats as defaultStats,
  navLinks as defaultNavLinks,
  cities as defaultCities,
  specializations as defaultSpecializations,
  sampleArticles as defaultSampleArticles,
  articleBodies as defaultArticleBodies,
} from "@/lib/data";
import { iconMap, serializeIcon as _serializeIcon, resolveIcon } from "@/lib/icons";

function serializeIcon(icon: React.ComponentType<{ className?: string }>): string {
  return _serializeIcon(icon as any);
}

function deserializeIcon(name: string): React.ComponentType<{ className?: string }> {
  return resolveIcon(name);
}

export interface AdminHero {
  badge: string;
  title: string;
  subtitle: string;
  btnPrimary: string;
  btnSecondary: string;
}

export interface AdminFooter {
  description: string;
  newsletterText: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  legalLinks?: { label: string; href: string }[];
}

/* =========================================================================
 * SEO system
 * ======================================================================= */

export type SeoSchemaType =
  | "Organization"
  | "LegalService"
  | "Attorney"
  | "Blog"
  | "NewsMediaOrganization"
  | "LocalBusiness"
  | "WebSite"
  | "CollectionPage"
  | "Person"
  | "GovernmentOrganization"
  | "FAQPage"
  | "BreadcrumbList"
  | "Article"
  | "NewsArticle"
  | "BlogPosting"
  | "Review"
  | "Rating"
  | "SearchAction"
  | "VideoObject"
  | "ImageObject"
  | "Speakable"
  | "Dataset"
  | "HowTo"
  | "Event"
  | "Book"
  | "ProfilePage"
  | "QAPage"
  | "DiscussionForumPosting";

export interface SeoGeneral {
  siteName: string;
  shortName: string;
  tagline: string;
  companyName: string;
  legalOrganization: string;
  country: string; // ISO, e.g. "IQ"
  language: string; // e.g. "ar"
  timezone: string; // e.g. "Asia/Baghdad"
  logo: string;
  defaultImage: string;
  email: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    whatsapp: string;
    telegram: string;
  };
  analytics: {
    googleAnalytics: string;
    googleTagManager: string;
    searchConsole: string;
    bingWebmaster: string;
    yandex: string;
    pinterestVerification: string;
    facebookVerification: string;
  };
}

export interface SeoMeta {
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  titleSeparator: string; // e.g. "|" or "-"
  titleTemplate: string; // e.g. "%title% | %sitename%"
  descriptionTemplate: string;
  autoGenerateMeta: boolean;
  autoTrimDescription: boolean;
  metaCharset: string; // "utf-8"
  robotsDefault: string; // "index,follow"
  canonicalDefault: boolean;
  authorMeta: string;
  publisherMeta: string;
  generatorMeta: string;
  themeColor: string;
  metadataBase: string;
}

export interface SeoOpenGraph {
  facebookTitle: string;
  facebookDescription: string;
  facebookImage: string;
  twitterCard: "summary" | "summary_large_image" | "app" | "player";
  twitterImage: string;
  twitterCreator: string;
  twitterSite: string;
  ogLocale: string; // "ar_IQ"
  ogType: string; // "website" | "article" ...
  ogSiteName: string;
}

export interface SeoRobots {
  global: string; // "index,follow" etc.
  maxImagePreview: "none" | "standard" | "large" | "max" | string;
  maxSnippet: number; // -1 = unlimited
  maxVideoPreview: number;
}

export interface SeoCanonical {
  auto: boolean;
  custom: string;
  ignoreParameters: string[]; // query params to strip
  pagination: boolean;
  search: boolean;
  categories: boolean;
}

export interface SeoImage {
  autoAlt: boolean;
  autoTitle: boolean;
  autoCaption: boolean;
  autoDescription: boolean;
  webp: boolean;
  lazyLoad: boolean;
  imageSitemap: boolean;
  imageSchema: boolean;
}

export interface SeoBreadcrumb {
  enabled: boolean;
  schema: boolean;
  separator: string;
  showHome: boolean;
  showCategory: boolean;
  showAuthor: boolean;
}

export interface SeoPerformance {
  minifyCss: boolean;
  minifyJs: boolean;
  criticalCss: boolean;
  deferJs: boolean;
  lazyLoad: boolean;
  preloadFonts: boolean;
  dnsPrefetch: boolean;
  preconnect: boolean;
  http3: boolean;
  brotli: boolean;
  gzip: boolean;
}

export interface SeoLocal {
  companyName: string;
  profession: string;
  services: string[];
  workingHours: string;
  lat: string;
  lng: string;
  cities: string[];
  governorates: string[];
  googleMaps: string;
  whatsapp: string;
  telegram: string;
}

export interface SeoDirectory {
  // fields captured per lawyer for schema/SEO
  enableAttorneySchema: boolean;
  enableLegalServiceSchema: boolean;
  defaultSpecialization: string;
}

export interface SeoSitemap {
  auto: boolean;
  split: boolean;
  compress: boolean;
  include: {
    articles: boolean;
    lawyers: boolean;
    lawFirms: boolean;
    courts: boolean;
    categories: boolean;
    tags: boolean;
    questions: boolean;
    pages: boolean;
    images: boolean;
    videos: boolean;
    news: boolean;
  };
  lastGenerated?: string;
}

export interface SeoRedirect {
  id: string;
  from: string;
  to: string;
  type: 301 | 302 | 307 | 410 | 451;
  regex: boolean;
  enabled: boolean;
  hits: number;
  createdAt: string;
}

export interface Seo404Entry {
  id: string;
  url: string;
  hits: number;
  lastSeen: string;
  suggestedRedirect?: string;
}

export interface SeoIndexing {
  googleIndexApi: boolean;
  bingIndexNow: boolean;
  instantIndex: boolean;
  indexNowKey: string;
}

export interface SeoAi {
  enabled: boolean;
  provider: string;
  apiKey: string;
  autoTitle: boolean;
  autoDescription: boolean;
  autoAlt: boolean;
  suggestH2: boolean;
  suggestFaq: boolean;
  suggestKeywords: boolean;
  suggestLsi: boolean;
  suggestInternalLinks: boolean;
}

export interface SeoBulkJob {
  id: string;
  type: "meta" | "alt" | "slug" | "schema";
  target: string; // content type
  status: "pending" | "done";
  createdAt: string;
}

export interface SeoMonitoring {
  lastCrawl?: string;
  lastModified?: string;
  editLog: {
    id: string;
    actor: string;
    action: string;
    entity: string;
    timestamp: string;
    detail?: string;
  }[];
  crawlErrors: { id: string; url: string; error: string; timestamp: string }[];
  alerts: { id: string; level: "info" | "warning" | "error"; message: string; timestamp: string }[];
}

export interface AdminSeo {
  general: SeoGeneral;
  meta: SeoMeta;
  openGraph: SeoOpenGraph;
  schema: {
    siteType: SeoSchemaType;
    enabled: Partial<Record<SeoSchemaType, boolean>>;
  };
  robots: SeoRobots;
  canonical: SeoCanonical;
  image: SeoImage;
  breadcrumb: SeoBreadcrumb;
  performance: SeoPerformance;
  local: SeoLocal;
  directory: SeoDirectory;
  sitemap: SeoSitemap;
  redirects: SeoRedirect[];
  notFoundMonitor: Seo404Entry[];
  indexing: SeoIndexing;
  ai: SeoAi;
  bulk: SeoBulkJob[];
  monitoring: SeoMonitoring;
}

export interface AdminTheme {
  accentColor: string;
  secondaryColor: string;
  goldColor: string;
  marqueeSpeed: number;
  darkMode: boolean;
}

export type AdType = "custom" | "adsense" | "html";

export type AdSenseFormat = "auto" | "horizontal" | "vertical" | "rectangle";

/** Which devices an ad targets */
export interface AdTargetDevices {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

/** Show ad only to matching context */
export interface AdTargeting {
  countries: string[]; // ISO codes, empty = all
  languages: string[]; // empty = all
  categories: string[]; // empty = all
  tags: string[]; // empty = all
  authors: string[]; // empty = all
  pageTypes: string[]; // "home" | "article" | "category" | "search" | "author" | "tag" | "law" | "lawyer"
}

/** Runtime statistics per banner */
export interface AdStats {
  impressions: number;
  clicks: number;
  lastShown?: string;
  lastClicked?: string;
}

export interface AdminAd {
  id: string;
  name: string;
  enabled: boolean;
  adType: AdType;
  /** Banner (custom) fields */
  title?: string;
  subtitle?: string;
  cta?: string;
  gradient?: string;
  image?: string; // URL or data URI
  linkUrl?: string;
  openInNew?: boolean;
  startAt?: string; // ISO date
  endAt?: string; // ISO date
  priority?: number;
  /** AdSense fields */
  slotId?: string;
  format?: AdSenseFormat;
  /** HTML code snippet fields */
  htmlCode?: string;
  /** Shared targeting & stats */
  devices: AdTargetDevices;
  targeting: AdTargeting;
  stats: AdStats;
}

/** A fixed placement slot in the site UI */
export type AdPlacementType = "adsense" | "banner" | "html" | "none";

export interface AdminAdPlacement {
  key: string;
  label: string; // Arabic label
  type: AdPlacementType;
  enabled: boolean;
  /** Which ad id is bound (for banner/html). For adsense, uses global adsense config. */
  adId?: string;
}

export interface AdminHtmlCode {
  id: string;
  name: string;
  code: string; // raw HTML/JS
  enabled: boolean;
  location: string; // human label of where it is injected
}

export interface AdminAdSenseConfig {
  enabled: boolean;
  publisherId: string;
  verificationCode: string; // meta/verification snippet
  autoAdsCode: string; // full auto-ads snippet
  autoAdsEnabled: boolean;
  /** Which page types AdSense appears on */
  pages: {
    home: boolean;
    articles: boolean;
    categories: boolean;
    search: boolean;
    authors: boolean;
    tags: boolean;
  };
}

export interface AdminActivityLogEntry {
  id: string;
  entity: "banner" | "placement" | "html" | "adsense" | "settings" | "analytics" | "seo";
  entityId: string;
  actor: string;
  action: "create" | "update" | "delete" | "restore";
  timestamp: string;
  oldValues?: unknown;
  newValues?: unknown;
}

export interface AdminPerformance {
  lazyLoad: boolean;
  loadOnScroll: boolean;
  webpBanners: boolean;
  deferNonCriticalJs: boolean;
}

export interface AdminFloatingAI {
  greeting: string;
  example: string;
  placeholder: string;
  soonText: string;
  enabled: boolean;
}

export interface AdminContact {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
}

export interface SerializableLaw {
  id: string;
  name: string;
  articles: number;
  updated: string;
  icon: string;
  color: string;
  category?: string;
  source?: string;
}

export interface SerializableService {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

export interface SerializableFeature {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export type AdminRole = {
  id: string;
  name: string;
  permissions: string[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
};

export type AdminData = {
  lawyers: Lawyer[];
  articles: Article[];
  laws: SerializableLaw[];
  lawFirms: LawFirm[];
  services: SerializableService[];
  features: SerializableFeature[];
  testimonials: typeof defaultTestimonials;
  faqs: typeof defaultFaqs;
  stats: typeof defaultStats;
  navLinks: typeof defaultNavLinks;
  cities: string[];
  specializations: string[];
  sampleArticles: Record<string, SampleArticle[]>;
  articleBodies: Record<string, ArticleBlock[]>;
  categories: { id: string; name: string; icon: string }[];
  hero: AdminHero;
  footer: AdminFooter;
  seo: AdminSeo;
  analytics: AnalyticsSettings;
  theme: AdminTheme;
  ads: AdminAd[];
  adsense: AdminAdSenseConfig;
  adPlacements: AdminAdPlacement[];
  htmlCodes: AdminHtmlCode[];
  activityLog: AdminActivityLogEntry[];
  performance: AdminPerformance;
  floatingAI: AdminFloatingAI;
  contact: AdminContact;
  users: AdminUser[];
  roles: AdminRole[];
  adminAuth: {
    username: string;
    passwordHash: string;
    sessionToken: string;
    sessionExpiry: number;
  };
};

/** SHA‑256 hash via Web Crypto API */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Generate a cryptographically‑secure token */
export function secureToken(): string {
  return crypto.randomUUID();
}

export function buildDefaults(): AdminData {
  return {
    lawyers: JSON.parse(JSON.stringify(defaultLawyers)),
    articles: JSON.parse(JSON.stringify(defaultArticles)),
    laws: defaultLaws.map((l) => ({
      id: l.id,
      name: l.name,
      articles: l.articles,
      updated: l.updated,
      icon: serializeIcon(l.icon),
      color: l.color,
      category: l.category || l.id,
    })),
    lawFirms: JSON.parse(JSON.stringify(defaultLawFirms)),
    services: defaultServices.map((s) => ({
      id: s.id,
      title: s.title,
      icon: serializeIcon(s.icon),
      desc: s.desc,
    })),
    features: defaultFeatures.map((f) => ({
      id: f.id,
      title: f.title,
      desc: f.desc,
      icon: serializeIcon(f.icon),
    })),
    testimonials: JSON.parse(JSON.stringify(defaultTestimonials)),
    faqs: JSON.parse(JSON.stringify(defaultFaqs)),
    stats: JSON.parse(JSON.stringify(defaultStats)),
    navLinks: JSON.parse(JSON.stringify(defaultNavLinks)),
    cities: [...defaultCities],
    specializations: [...defaultSpecializations],
    sampleArticles: JSON.parse(JSON.stringify(defaultSampleArticles)),
    articleBodies: JSON.parse(JSON.stringify(defaultArticleBodies)),
    categories: [
      { id: "civil", name: "القانون المدني", icon: "Scale" },
      { id: "penal", name: "قانون العقوبات", icon: "Gavel" },
      { id: "personal", name: "الأحوال الشخصية", icon: "HeartHandshake" },
      { id: "labor", name: "قانون العمل", icon: "Users" },
      { id: "traffic", name: "قانون المرور", icon: "Car" },
      { id: "companies", name: "قانون الشركات", icon: "Building2" },
      { id: "investment", name: "قانون الاستثمار", icon: "Landmark" },
      { id: "commercial", name: "القانون التجاري", icon: "Briefcase" },
    ],
    hero: {
      badge: "المنصة القانونية الأولى في العراق",
      title: "دليلك الذكي للقوانين العراقية",
      subtitle:
        "ابحث في آلاف المواد القانونية، اعثر على أفضل المحامين، واحصل على استشارة قانونية موثوقة.",
      btnPrimary: "ابحث عن محامٍ",
      btnSecondary: "تصفح القوانين",
    },
    footer: {
      description:
        "منصة قانوني هي دليلك الشامل للقوانين العراقية والمحامين المعتمدين في جميع المحافظات.",
      newsletterText: "اشترك لتصلك آخر التحديثات القانونية والمقالات.",
      phone: "+964 770 000 0000",
      email: "info@qanuni.iq",
      address: "بغداد، العراق — شارع الرشيد",
      workingHours: "السبت - الخميس: 8:00 ص - 5:00 م",
      socials: {
        facebook: "https://facebook.com/qanuni",
        twitter: "https://twitter.com/qanuni",
        instagram: "https://instagram.com/qanuni",
        linkedin: "https://linkedin.com/company/qanuni",
        youtube: "https://youtube.com/@qanuni",
      },
      legalLinks: [
        { label: "سياسة الخصوصية", href: "/privacy" },
        { label: "شروط الاستخدام", href: "/terms" },
      ],
    },
    seo: seoDefaults,
    analytics: analyticsDefaults,
    theme: {
      accentColor: "#3B82F6",
      secondaryColor: "#1E3A8A",
      goldColor: "#F59E0B",
      marqueeSpeed: 32,
      darkMode: false,
    },
    ads: [
      {
        id: "ad1",
        name: "استشارة قانونية مجانية",
        title: "استشارة قانونية مجانية",
        subtitle: "احصل على استشارتك الأولى مجاناً مع أفضل المحامين",
        cta: "احجز الآن",
        gradient: "from-blue-600 to-indigo-700",
        enabled: true,
        adType: "custom",
        linkUrl: "#contact",
        openInNew: false,
        priority: 5,
        devices: { desktop: true, tablet: true, mobile: true },
        targeting: { countries: [], languages: [], categories: [], tags: [], authors: [], pageTypes: [] },
        stats: { impressions: 0, clicks: 0 },
      },
      {
        id: "ad2",
        name: "دليل المحامين المعتمدين",
        title: "دليل المحامين المعتمدين",
        subtitle: "أكثر من 5000 محامٍ موثق في جميع المحافظات العراقية",
        cta: "تصفح المحامين",
        gradient: "from-amber-500 to-orange-600",
        enabled: true,
        adType: "custom",
        linkUrl: "/lawyers",
        openInNew: false,
        priority: 4,
        devices: { desktop: true, tablet: true, mobile: true },
        targeting: { countries: [], languages: [], categories: [], tags: [], authors: [], pageTypes: [] },
        stats: { impressions: 0, clicks: 0 },
      },
    ],
    adsense: {
      enabled: false,
      publisherId: "",
      verificationCode: "",
      autoAdsCode: "",
      autoAdsEnabled: false,
      pages: {
        home: true,
        articles: true,
        categories: true,
        search: true,
        authors: true,
        tags: true,
      },
    },
    adPlacements: [
      { key: "top-site", label: "أعلى الموقع", type: "adsense", enabled: true },
      { key: "below-header", label: "أسفل الهيدر", type: "adsense", enabled: true },
      { key: "in-article-2", label: "داخل المقال بعد الفقرة 2", type: "adsense", enabled: true },
      { key: "in-article-5", label: "داخل المقال بعد الفقرة 5", type: "banner", enabled: true },
      { key: "article-end", label: "نهاية المقال", type: "adsense", enabled: true },
      { key: "before-comments", label: "قبل التعليقات", type: "banner", enabled: false },
      { key: "sidebar-top", label: "الشريط الجانبي أعلى", type: "adsense", enabled: true },
      { key: "sidebar-mid", label: "الشريط الجانبي وسط", type: "banner", enabled: true },
      { key: "footer", label: "الفوتر", type: "html", enabled: true },
    ],
    htmlCodes: [],
    activityLog: [],
    performance: {
      lazyLoad: true,
      loadOnScroll: true,
      webpBanners: true,
      deferNonCriticalJs: true,
    },
    floatingAI: {
      greeting: "مرحباً! كيف يمكنني مساعدتك؟",
      example: "ما هي حقوق العامل عند الفصل التعسفي؟",
      placeholder: "اكتب سؤالك القانوني هنا...",
      soonText: "المساعد الذكي قريباً",
      enabled: true,
    },
    contact: {
      phone: "+964 770 000 0000",
      email: "info@qanuni.iq",
      address: "بغداد، العراق — شارع الرشيد",
      workingHours: "السبت - الخميس: 8:00 ص - 5:00 م",
    },
    users: [
      { id: 'u1', name: 'مدير النظام', email: 'admin@qanuni.iq', role: 'admin', active: true, createdAt: '2025-01-01' },
      { id: 'u2', name: 'محمد المحامي', email: 'lawyer@qanuni.iq', role: 'lawyer', active: true, createdAt: '2025-03-15', lastLogin: '2025-12-20' },
    ],
    roles: [
      { id: 'admin', name: 'مدير النظام', permissions: ['manage_lawyers','manage_articles','manage_laws','manage_content','manage_ads','manage_users','view_stats'] },
      { id: 'lawyer', name: 'محامي', permissions: ['manage_articles','view_stats'] },
      { id: 'editor', name: 'محرر', permissions: ['manage_articles','manage_content','view_stats'] },
      { id: 'viewer', name: 'مشاهد', permissions: ['view_stats'] },
    ],
    adminAuth: {
      username: "admin",
      passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
      sessionToken: "",
      sessionExpiry: 0,
    },
  };
}

const STORAGE_KEY = "admin_site_data";

/** Deep-merge two objects, recursing into nested keys (skips arrays & null) */
function deepMerge<T extends Record<string, unknown>>(a: T, b: Partial<T>): T {
  const out = { ...a } as Record<string, unknown>;
  for (const key of Object.keys(b)) {
    const v = b[key as keyof T];
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) || typeof v !== "object") {
      out[key] = v;
    } else {
      out[key] = deepMerge((a[key] ?? {}) as Record<string, unknown>, v as Record<string, unknown>);
    }
  }
  return out as T;
}

export function getAdminData(): AdminData {
  if (typeof window === "undefined") return buildDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaults();
    const parsed = JSON.parse(raw) as AdminData;
    // Merge with defaults to ensure all fields exist (backward compatibility)
    const defaults = buildDefaults();
    return deepMerge(defaults, parsed);
  } catch {
    return buildDefaults();
  }
}

export function saveAdminData(data: AdminData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetAdminData(): AdminData {
  const defaults = buildDefaults();
  saveAdminData(defaults);
  return defaults;
}

export function getLawsWithIcons(): Law[] {
  return defaultLaws.map((l) => ({ ...l }));
}

export function getServicesWithIcons() {
  return defaultServices.map((s) => ({
    ...s,
    icon: serializeIcon(s.icon),
  }));
}

export function getFeaturesWithIcons() {
  return defaultFeatures.map((f) => ({
    ...f,
    icon: serializeIcon(f.icon),
  }));
}

export function useAdminData() {
  const [data, setData] = useState<AdminData>(getAdminData);

  const update = useCallback(
    <K extends keyof AdminData>(field: K, value: AdminData[K]) => {
      setData((prev) => {
        const next = { ...prev, [field]: value };
        saveAdminData(next);
        return next;
      });
    },
    []
  );

  const reset = useCallback(() => {
    const defaults = resetAdminData();
    setData(defaults);
  }, []);

  return { data, update, reset };
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem("admin_session");
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { token: string; expiry: number };
    return !!parsed.token && parsed.expiry > Date.now();
  } catch {
    return false;
  }
}

export async function adminLogin(username: string, password: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const defaults = buildDefaults();
  if (username !== defaults.adminAuth.username) return false;
  const hash = await hashPassword(password);
  if (hash !== defaults.adminAuth.passwordHash) return false;
  const expiry = Date.now() + 1000 * 60 * 60 * 24;
  const token = secureToken();
  localStorage.setItem(
    "admin_session",
    JSON.stringify({ token, expiry })
  );
  return true;
}

export function adminLogout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_session");
}

export function pushActivityLog(
  entry: Omit<AdminActivityLogEntry, "id" | "timestamp">
): AdminActivityLogEntry {
  const full: AdminActivityLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  return full;
}

export function recordAdImpression(adId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as AdminData;
    const ads = parsed.ads.map((a) =>
      a.id === adId
        ? { ...a, stats: { ...a.stats, impressions: a.stats.impressions + 1 } }
        : a
    );
    saveAdminData({ ...parsed, ads });
  } catch {
    /* noop */
  }
}

export function recordAdClick(adId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as AdminData;
    const ads = parsed.ads.map((a) =>
      a.id === adId
        ? { ...a, stats: { ...a.stats, clicks: a.stats.clicks + 1 } }
        : a
    );
    saveAdminData({ ...parsed, ads });
  } catch {
    /* noop */
  }
}

export function adCtr(stats?: AdStats): number {
  if (!stats || stats.impressions === 0) return 0;
  return (stats.clicks / stats.impressions) * 100;
}

export function deviceMatches(devices: AdTargetDevices, ua: string): boolean {
  const isMobile = /mobile/i.test(ua);
  const isTablet = /tablet|ipad/i.test(ua);
  const isDesktop = !isMobile && !isTablet;
  if (isDesktop && !devices.desktop) return false;
  if (isTablet && !devices.tablet) return false;
  if (isMobile && !devices.mobile) return false;
  return true;
}