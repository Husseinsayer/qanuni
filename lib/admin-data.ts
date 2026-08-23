"use client";

import { useState, useEffect, useCallback } from "react";
import { seoDefaults } from "./seo-defaults";
import { analyticsDefaults, type AnalyticsSettings } from "./analytics";
import {
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
  articleHtml as defaultArticleHtml,
} from "@/lib/data";
import { serializeIcon as _serializeIcon } from "@/lib/icons";

function serializeIcon(icon: React.ComponentType<{ className?: string }>): string {
  return _serializeIcon(icon as any);
}

export interface AdminHero {
  badge: string;
  title: string;
  titleGradient: string;
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

/** IAB-standard ad sizes */
export type AdSize =
  | "responsive"
  | "leaderboard"       // 728x90
  | "large-leaderboard" // 970x90
  | "billboard"         // 970x250
  | "medium-rectangle"  // 300x250
  | "large-rectangle"   // 336x280
  | "skyscraper"        // 160x600
  | "wide-skyscraper"   // 300x600
  | "mobile-banner"     // 320x50
  | "inline"            // 468x60
  | "full-page"         // interstitial
  | "sticky-bottom"     // anchored mobile
  | "native";           // native ad

export type AdType = "adsense" | "custom-image" | "custom-gradient" | "html" | "script" | "affiliate";

export type AdSenseFormat = "auto" | "horizontal" | "vertical" | "rectangle";

/** Which devices an ad targets */
export interface AdTargetDevices {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

/** Show ad only to matching context */
export interface AdTargeting {
  countries: string[];
  languages: string[];
  categories: string[];
  tags: string[];
  pageTypes: string[];
  deviceTypes: string[];
  loggedUsers: "all" | "logged-in" | "guests";
  dateRange?: { start?: string; end?: string };
}

/** Runtime statistics per ad */
export interface AdStats {
  impressions: number;
  clicks: number;
  ctr: number;
  lastShown?: string;
  lastClicked?: string;
  dailyStats?: { date: string; impressions: number; clicks: number }[];
}

export interface AdminAd {
  id: string;
  name: string;
  enabled: boolean;
  adType: AdType;
  /** Size */
  size: AdSize;
  /** Banner fields */
  title?: string;
  subtitle?: string;
  cta?: string;
  gradient?: string;
  image?: string;
  linkUrl?: string;
  openInNew?: boolean;
  /** Scheduling */
  startAt?: string;
  endAt?: string;
  priority?: number;
  weight?: number;
  /** AdSense fields */
  slotId?: string;
  format?: AdSenseFormat;
  /** HTML/script fields */
  htmlCode?: string;
  /** Shared targeting & stats */
  devices: AdTargetDevices;
  targeting: AdTargeting;
  stats: AdStats;
}

/** A fixed placement slot in the site UI */
export type AdPlacementType = "adsense" | "banner" | "html" | "script" | "none";

export interface AdminAdPlacement {
  key: string;
  label: string;
  page: string;
  description: string;
  recommendedSize: AdSize;
  type: AdPlacementType;
  enabled: boolean;
  adId?: string;
}

export interface AdminHtmlCode {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  location: string;
}

export interface AdminAdSenseConfig {
  enabled: boolean;
  publisherId: string;
  verificationCode: string;
  autoAdsCode: string;
  autoAdsEnabled: boolean;
  autoAdsMaxHeight: number;
  adSizeOptimization: boolean;
  pages: {
    home: boolean;
    articles: boolean;
    categories: boolean;
    search: boolean;
    lawyers: boolean;
    laws: boolean;
    services: boolean;
    contact: boolean;
  };
}

export interface AdminActivityLogEntry {
  id: string;
  entity: "ad" | "placement" | "html" | "adsense" | "settings" | "analytics" | "seo";
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
  maxAdsPerPage: number;
  adRefreshInterval: number;
  stickyAdsEnabled: boolean;
  stickyAdsHeight: number;
  consentRequired: boolean;
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
  status?: string;
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
  phone?: string;
  status?: "pending" | "approved" | "rejected";
  notes?: string;
};

export type LawPageTab = {
  id: string;
  name: string;
  filterCategory?: string; // Show laws matching this category (empty=all)
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
  articleHtml: Record<string, string>;
  categories: { id: string; name: string; icon: string }[];
  lawPageTabs: LawPageTab[];
  hero: AdminHero;
  footer: AdminFooter;
  partners: { id: string; name: string; title: string; icon: string; url: string }[];
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
  registrationEnabled: boolean;
  lawTypeVisibility: Record<string, boolean>;
  adminAuth: {
    username: string;
    passwordHash: string;
    sessionToken: string;
    sessionExpiry: number;
  };
};

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
    articleHtml: JSON.parse(JSON.stringify(defaultArticleHtml)),
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
    lawPageTabs: [
      { id: "all", name: "القوانين العراقية" },
      { id: "decisions", name: "قرارات محكمة التمييز", filterCategory: "cassation" },
      { id: "regulations", name: "التعليمات", filterCategory: "regulation" },
      { id: "systems", name: "الأنظمة", filterCategory: "system" },
    ],
    hero: {
      badge: "المنصة القانونية الأولى في العراق",
      title: "دليلك الذكي للقوانين",
      titleGradient: "العراقية والمحامين",
      subtitle:
        "ابحث في آلاف المواد القانونية، اعثر على أفضل المحامين، واحصل على استشارة قانونية موثوقة.",
      btnPrimary: "تصفح القوانين",
      btnSecondary: "ابحث عن محامٍ",
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
        { label: "سياسة الخصوصية", href: "/legal/privacy" },
        { label: "شروط الاستخدام", href: "/legal/terms" },
      ],
    },
    partners: [
      { id: "p1", name: "وزارة العدل العراقية", title: "شريك استراتيجي", icon: "Landmark", url: "#" },
      { id: "p2", name: "مجلس القضاء الأعلى", title: "شريك مؤسسي", icon: "Scale", url: "#" },
      { id: "p3", name: "نقابة المحامين العراقيين", title: "شريك رسمي", icon: "Users", url: "#" },
      { id: "p4", name: "هيئة ال찡اف العراقية", title: "شريك مؤسسي", icon: "ShieldCheck", url: "#" },
    ],
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
      // ── Leaderboard 728×90 ──
      { id: "ad-lb-1", name: "استشارة قانونية مجانية", title: "استشارة قانونية مجانية", subtitle: "احصل على استشارتك الأولى مجاناً مع أفضل المحامين", cta: "احجز الآن", gradient: "from-blue-600 to-indigo-700", enabled: true, adType: "custom-gradient", size: "leaderboard", linkUrl: "#contact", openInNew: false, priority: 5, weight: 3, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 1240, clicks: 89, ctr: 7.2, dailyStats: [] } },
      { id: "ad-lb-2", name: "دليل المحامين المعتمدين", title: "دليل المحامين المعتمدين", subtitle: "أكثر من 5000 محامٍ موثق في جميع المحافظات العراقية", cta: "تصفح المحامين", gradient: "from-emerald-500 to-teal-600", enabled: true, adType: "custom-gradient", size: "leaderboard", linkUrl: "/lawyers", openInNew: false, priority: 4, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 870, clicks: 54, ctr: 6.2, dailyStats: [] } },
      { id: "ad-lb-3", name: "القوانين العراقية النافذة", title: "القوانين العراقية النافذة", subtitle: "جميع القوانين في مكان واحد", cta: "تصفح القوانين", gradient: "from-violet-500 to-purple-700", enabled: true, adType: "custom-gradient", size: "leaderboard", linkUrl: "/laws", openInNew: false, priority: 3, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 650, clicks: 38, ctr: 5.8, dailyStats: [] } },
      // ── Large Leaderboard 970×90 ──
      { id: "ad-llb-1", name: "مكتب المحاماة المتقدم", title: "مكتب المحاماة المتقدم", subtitle: "خبرة تمتد لأكثر من 20 عاماً في القانون المدني", cta: "تواصل معنا", gradient: "from-amber-500 to-orange-600", enabled: true, adType: "custom-gradient", size: "large-leaderboard", linkUrl: "/law-firms", openInNew: false, priority: 4, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 530, clicks: 31, ctr: 5.8, dailyStats: [] } },
      { id: "ad-llb-2", name: "خدمات التوثيق القانوني", title: "خدمات التوثيق القانوني", subtitle: "توثيق العقود والمحاضر الرسمية", cta: "اطلب الخدمة", gradient: "from-rose-500 to-pink-600", enabled: true, adType: "custom-gradient", size: "large-leaderboard", linkUrl: "/services", openInNew: false, priority: 3, weight: 1, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 320, clicks: 18, ctr: 5.6, dailyStats: [] } },
      // ── Billboard 970×250 ──
      { id: "ad-bb-1", name: "منصة قانوني", title: "منصة قانوني", subtitle: "دليلك الذكي للقوانين العراقية — أكثر من 100,000 مادة قانونية و5000 محامٍ معتمد", cta: "ابدأ الآن", gradient: "from-blue-600 via-indigo-600 to-purple-700", enabled: true, adType: "custom-gradient", size: "billboard", linkUrl: "/", openInNew: false, priority: 6, weight: 3, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 2100, clicks: 156, ctr: 7.4, dailyStats: [] } },
      { id: "ad-bb-2", name: "مركز الدومز للقانون", title: "مركز الدومز للقانون", subtitle: "نقدم أفضل الخدمات القانونية في بغداد — استشارات، توثيق، تمثيل قضائي", cta: "تواصل الآن", gradient: "from-emerald-600 via-teal-500 to-cyan-600", enabled: true, adType: "custom-gradient", size: "billboard", linkUrl: "/law-firms", openInNew: false, priority: 5, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 980, clicks: 67, ctr: 6.8, dailyStats: [] } },
      // ── Medium Rectangle 300×250 ──
      { id: "ad-mr-1", name: "دورة القانون المدني", title: "دورة في القانون المدني", subtitle: "تعلم أساسيات القانون المدني العراقي", cta: "سجّل الآن", gradient: "from-sky-500 to-blue-600", enabled: true, adType: "custom-gradient", size: "medium-rectangle", linkUrl: "/services", openInNew: false, priority: 4, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 420, clicks: 28, ctr: 6.7, dailyStats: [] } },
      { id: "ad-mr-2", name: "حقوق العامل", title: "حقوق العامل", subtitle: "هل تعرف حقوقك كعامل في القانون العراقي؟", cta: "اقرأ المزيد", gradient: "from-lime-500 to-green-600", enabled: true, adType: "custom-gradient", size: "medium-rectangle", linkUrl: "/blog", openInNew: false, priority: 3, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 380, clicks: 22, ctr: 5.8, dailyStats: [] } },
      { id: "ad-mr-3", name: "قانون المرور الجديد", title: "قانون المرور الجديد", subtitle: "التعديلات الأخيرة على قانون المرور العراقي", cta: "اعرف تفاصيلك", gradient: "from-yellow-500 to-amber-600", enabled: true, adType: "custom-gradient", size: "medium-rectangle", linkUrl: "/laws", openInNew: false, priority: 3, weight: 1, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 290, clicks: 15, ctr: 5.2, dailyStats: [] } },
      { id: "ad-mr-4", name: "الاستشارة القانونية", title: "الاستشارة القانونية", subtitle: "احصل على رأي قانوني متخصص", cta: "ابدأ الآن", gradient: "from-fuchsia-500 to-pink-600", enabled: true, adType: "custom-gradient", size: "medium-rectangle", linkUrl: "#contact", openInNew: false, priority: 4, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 350, clicks: 20, ctr: 5.7, dailyStats: [] } },
      // ── Large Rectangle 336×280 ──
      { id: "ad-lr-1", name: "أبحاث قانونية", title: "أبحاث قانونية", subtitle: "أبحاث ودراسات قانونية متخصصة في القانون العراقي", cta: "حمّل البحث", gradient: "from-indigo-500 to-violet-600", enabled: true, adType: "custom-gradient", size: "large-rectangle", linkUrl: "/blog", openInNew: false, priority: 3, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 270, clicks: 14, ctr: 5.2, dailyStats: [] } },
      // ── Skyscraper 160×600 ──
      { id: "ad-sk-1", name: "قانوني", title: "قانوني", subtitle: "منصتك القانونية الموثوقة — استشارات، قوانين، محامين", cta: "ابدأ", gradient: "from-teal-500 to-emerald-600", enabled: true, adType: "custom-gradient", size: "skyscraper", linkUrl: "/", openInNew: false, priority: 4, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 190, clicks: 11, ctr: 5.8, dailyStats: [] } },
      // ── Wide Skyscraper 300×600 ──
      { id: "ad-wsk-1", name: "دليل القوانين العراقية", title: "دليل شامل للقوانين العراقية", subtitle: "جميع القوانين النافذة مع شروحات ومراجع قانونية موثوقة", cta: "ابدأ التصفح", gradient: "from-cyan-500 to-blue-600", enabled: true, adType: "custom-gradient", size: "wide-skyscraper", linkUrl: "/laws", openInNew: false, priority: 4, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 240, clicks: 16, ctr: 6.7, dailyStats: [] } },
      // ── Mobile Banner 320×50 ──
      { id: "ad-mob-1", name: "قانوني — دليلك القانوني", title: "قانوني — دليلك القانوني", subtitle: "", cta: "تحميل", gradient: "from-blue-500 to-indigo-600", enabled: true, adType: "custom-gradient", size: "mobile-banner", linkUrl: "/", openInNew: false, priority: 5, weight: 3, devices: { desktop: false, tablet: false, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 680, clicks: 45, ctr: 6.6, dailyStats: [] } },
      // ── Responsive ──
      { id: "ad-resp-1", name: "الاستشارات القانونية", title: "الاستشارات القانونية", subtitle: "احصل على استشارة قانونية من أفضل المحامين", cta: "احجز استشارتك", gradient: "from-rose-500 to-red-600", enabled: true, adType: "custom-gradient", size: "responsive", linkUrl: "#contact", openInNew: false, priority: 5, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 560, clicks: 35, ctr: 6.3, dailyStats: [] } },
      { id: "ad-resp-2", name: "الخط الساخن القانوني", title: "الخط الساخن القانوني", subtitle: "الخط الساخن المجاني للاستشارات القانونية", cta: "اتصل الآن", gradient: "from-orange-500 to-red-500", enabled: true, adType: "custom-gradient", size: "responsive", linkUrl: "#contact", openInNew: false, priority: 4, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 410, clicks: 26, ctr: 6.3, dailyStats: [] } },
      // ── Sticky Bottom ──
      { id: "ad-stky-1", name: "حمّل تطبيق قانوني", title: "حمّل تطبيق قانوني", subtitle: "متاح على Android و iOS", cta: "تحميل مجاني", gradient: "from-blue-600 to-violet-600", enabled: true, adType: "custom-gradient", size: "sticky-bottom", linkUrl: "/", openInNew: false, priority: 5, weight: 3, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 780, clicks: 52, ctr: 6.7, dailyStats: [] } },
      // ── Native ──
      { id: "ad-nat-1", name: "محامٍ تجاري متخصص", title: "محامٍ متخصص في القانون التجاري", subtitle: "خبرة 15 عاماً في التعاملات التجارية الكبرى", cta: "تواصل", gradient: "from-emerald-500 to-green-600", enabled: true, adType: "custom-gradient", size: "native", linkUrl: "/lawyers", openInNew: false, priority: 4, weight: 2, devices: { desktop: true, tablet: true, mobile: true }, targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" }, stats: { impressions: 310, clicks: 19, ctr: 6.1, dailyStats: [] } },
    ],
    adsense: {
      enabled: false,
      publisherId: "",
      verificationCode: "",
      autoAdsCode: "",
      autoAdsEnabled: false,
      autoAdsMaxHeight: 0,
      adSizeOptimization: true,
      pages: {
        home: true,
        articles: true,
        categories: true,
        search: true,
        lawyers: true,
        laws: true,
        services: true,
        contact: true,
      },
    },
    adPlacements: [
      { key: "top-banner", label: "أعلى الموقع", page: "الكل", description: "أسفل الهيدر — leaderboard", recommendedSize: "leaderboard", type: "banner", enabled: true, adId: "ad-lb-1" },
      { key: "below-hero", label: "أسفل البانر الرئيسي", page: "الرئيسية", description: "تحت قسم Hero — billboard", recommendedSize: "billboard", type: "banner", enabled: true, adId: "ad-bb-1" },
      { key: "mid-content", label: "وسط المحتوى", page: "الرئيسية", description: "داخل المحتوى — medium-rectangle", recommendedSize: "medium-rectangle", type: "banner", enabled: true, adId: "ad-mr-1" },
      { key: "laws-top", label: "أعلى القوانين", page: "القوانين", description: "أعلى صفحة القوانين — leaderboard", recommendedSize: "leaderboard", type: "banner", enabled: true, adId: "ad-lb-2" },
      { key: "laws-inline", label: "داخل شبكة القوانين", page: "القوانين", description: "داخل الشبكة — medium-rectangle", recommendedSize: "medium-rectangle", type: "banner", enabled: true, adId: "ad-mr-3" },
      { key: "law-detail-top", label: "أعلى تفاصيل القانون", page: "تفاصيل القانون", description: "أعلى الصفحة — large-leaderboard", recommendedSize: "large-leaderboard", type: "banner", enabled: true, adId: "ad-llb-1" },
      { key: "law-detail-mid", label: "داخل مواد القانون", page: "تفاصيل القانون", description: "بعد المادة الخامسة — responsive", recommendedSize: "responsive", type: "banner", enabled: true, adId: "ad-resp-1" },
      { key: "lawyers-top", label: "أعلى المحامين", page: "المحامون", description: "أعلى الدليل — leaderboard", recommendedSize: "leaderboard", type: "banner", enabled: true, adId: "ad-lb-3" },
      { key: "lawyers-inline", label: "داخل شبكة المحامين", page: "المحامون", description: "داخل الشبكة — medium-rectangle", recommendedSize: "medium-rectangle", type: "banner", enabled: true, adId: "ad-mr-2" },
      { key: "lawyer-promo", label: "إعلان محامٍ ممول", page: "المحامون", description: "داخل القائمة — native", recommendedSize: "native", type: "banner", enabled: true, adId: "ad-nat-1" },
      { key: "lawyer-sidebar", label: "الشريط الجانبي للمحامي", page: "تفاصيل المحامي", description: "أسفل حجز — skyscraper", recommendedSize: "skyscraper", type: "banner", enabled: true, adId: "ad-sk-1" },
      { key: "law-firms-top", label: "أعلى المكاتب", page: "المكاتب", description: "أعلى الصفحة — leaderboard", recommendedSize: "leaderboard", type: "banner", enabled: true, adId: "ad-lb-1" },
      { key: "law-firm-sidebar", label: "الشريط الجانبي للمكتب", page: "تفاصيل المكتب", description: "جانب المحتوى — wide-skyscraper", recommendedSize: "wide-skyscraper", type: "banner", enabled: true, adId: "ad-wsk-1" },
      { key: "blog-top", label: "أعلى المدونة", page: "المدونة", description: "أعلى الصفحة — leaderboard", recommendedSize: "leaderboard", type: "banner", enabled: true, adId: "ad-lb-2" },
      { key: "blog-inline", label: "داخل المقالات", page: "المدونة", description: "داخل الشبكة — medium-rectangle", recommendedSize: "medium-rectangle", type: "banner", enabled: true, adId: "ad-mr-4" },
      { key: "article-mid", label: "داخل المقال", page: "تفاصيل المقال", description: "بعد الفقرة الثالثة — responsive", recommendedSize: "responsive", type: "banner", enabled: true, adId: "ad-resp-2" },
      { key: "article-end", label: "نهاية المقال", page: "تفاصيل المقال", description: "نهاية المحتوى — large-rectangle", recommendedSize: "large-rectangle", type: "banner", enabled: true, adId: "ad-lr-1" },
      { key: "services-top", label: "أعلى الخدمات", page: "الخدمات", description: "أعلى الصفحة — large-leaderboard", recommendedSize: "large-leaderboard", type: "banner", enabled: true, adId: "ad-llb-2" },
      { key: "search-top", label: "أعلى البحث", page: "البحث", description: "أعلى النتائج — large-leaderboard", recommendedSize: "large-leaderboard", type: "banner", enabled: true, adId: "ad-llb-1" },
      { key: "sticky-mobile", label: "شريط مثبت (جوال)", page: "الكل", description: "أسفل الشاشة — mobile-banner", recommendedSize: "mobile-banner", type: "banner", enabled: true, adId: "ad-mob-1" },
      { key: "page-footer", label: "أسفل الموقع", page: "الكل", description: "قبل الفوتر — billboard", recommendedSize: "billboard", type: "banner", enabled: true, adId: "ad-bb-2" },
    ],
    htmlCodes: [],
    activityLog: [],
    performance: {
      lazyLoad: true,
      loadOnScroll: false,
      webpBanners: true,
      deferNonCriticalJs: true,
      maxAdsPerPage: 20,
      adRefreshInterval: 0,
      stickyAdsEnabled: true,
      stickyAdsHeight: 60,
      consentRequired: false,
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
    registrationEnabled: true,
    lawTypeVisibility: {
      all: true,
      decisions: true,
      regulations: true,
      systems: true,
    },
    adminAuth: {
      username: "admin",
      passwordHash: "",
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
    const defaults = buildDefaults();
    const merged = deepMerge(defaults, parsed);
    // Force placement types and enabled states from defaults so banner ads always work
    const defaultPlacementMap = new Map(defaults.adPlacements.map(p => [p.key, p]));
    merged.adPlacements = merged.adPlacements.map(p => {
      const def = defaultPlacementMap.get(p.key);
      if (def) {
        return { ...p, type: def.type, recommendedSize: def.recommendedSize, enabled: def.enabled, adId: p.adId || def.adId };
      }
      return p;
    });
    return merged;
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

export function useAdminData() {
  const [data, setData] = useState<AdminData>(buildDefaults);

  // Load the single source of truth (Prisma DB) on mount.
  useEffect(() => {
    let active = true;
    fetch("/api/admin/data", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && typeof d === "object") {
          setData({ ...buildDefaults(), ...(d as Partial<AdminData>) } as AdminData);
        }
      })
      .catch(() => {
        /* keep defaults if API unavailable */
      });
    return () => {
      active = false;
    };
  }, []);

  // Persist every edit to the database (single source of truth).
  const persist = useCallback((field: keyof AdminData, value: AdminData[keyof AdminData]) => {
    fetch("/api/admin/data", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value }),
    }).catch(() => {
      /* non-fatal */
    });
  }, []);

  // Batch persist multiple fields in a single request to avoid race conditions.
  const persistBatch = useCallback((updates: Record<string, unknown>) => {
    fetch("/api/admin/data", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: updates }),
    }).catch(() => {
      /* non-fatal */
    });
  }, []);

  const update = useCallback(
    <K extends keyof AdminData>(field: K, value: AdminData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      persist(field, value as AdminData[keyof AdminData]);
    },
    [persist]
  );

  // Batch update multiple fields in one request.
  const updateBatch = useCallback(
    (updates: Partial<AdminData>) => {
      setData((prev) => ({ ...prev, ...updates }));
      persistBatch(updates as Record<string, unknown>);
    },
    [persistBatch]
  );

  const reset = useCallback(() => {
    setData(buildDefaults());
  }, []);

  return { data, update, updateBatch, reset };
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
    const today = new Date().toISOString().slice(0, 10);
    const ads = parsed.ads.map((a) => {
      if (a.id !== adId) return a;
      const impressions = a.stats.impressions + 1;
      const dailyStats = [...(a.stats.dailyStats || [])];
      const existing = dailyStats.find((d) => d.date === today);
      if (existing) {
        existing.impressions++;
      } else {
        dailyStats.push({ date: today, impressions: 1, clicks: 0 });
      }
      return {
        ...a,
        stats: {
          ...a.stats,
          impressions,
          ctr: a.stats.clicks > 0 ? Math.round((a.stats.clicks / impressions) * 1000) / 10 : 0,
          lastShown: new Date().toISOString(),
          dailyStats: dailyStats.slice(-30),
        },
      };
    });
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
    const today = new Date().toISOString().slice(0, 10);
    const ads = parsed.ads.map((a) => {
      if (a.id !== adId) return a;
      const clicks = a.stats.clicks + 1;
      const dailyStats = [...(a.stats.dailyStats || [])];
      const existing = dailyStats.find((d) => d.date === today);
      if (existing) {
        existing.clicks++;
      } else {
        dailyStats.push({ date: today, impressions: 0, clicks: 1 });
      }
      return {
        ...a,
        stats: {
          ...a.stats,
          clicks,
          ctr: a.stats.impressions > 0 ? Math.round((clicks / a.stats.impressions) * 1000) / 10 : 0,
          lastClicked: new Date().toISOString(),
          dailyStats: dailyStats.slice(-30),
        },
      };
    });
    saveAdminData({ ...parsed, ads });
  } catch {
    /* noop */
  }
}

export function adCtr(stats?: AdStats): number {
  if (!stats || stats.impressions === 0) return 0;
  return stats.ctr || Math.round((stats.clicks / stats.impressions) * 1000) / 10;
}

export function isAdActive(ad: AdminAd): boolean {
  if (!ad.enabled) return false;
  const now = new Date().toISOString();
  if (ad.startAt && now < ad.startAt) return false;
  if (ad.endAt && now > ad.endAt) return false;
  return true;
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