"use client";

import { useState, useEffect, useCallback } from "react";

export interface SiteHero {
  badge: string;
  title: string;
  titleGradient: string;
  subtitle: string;
  btnPrimary: string;
  btnSecondary: string;
}

export interface SiteFooter {
  description: string;
  newsletterText: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  socials: string;
  legalLinks: string;
}

export interface SiteService {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

export interface SiteLaw {
  id: string;
  name: string;
  articles: number;
  updated: string;
  icon: string;
  color: string;
  category: string;
  source: string;
  status: string;
}

export interface SiteLawyer {
  id: string;
  name: string;
  slug: string;
  city: string;
  specialization: string;
  experience: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  online: boolean;
  price: number;
  gender: string;
  languages: string;
  bio: string;
  initials: string;
  hue: string;
  whatsapp: string;
  telegram: string;
  facebook: string;
  instagram: string;
  promoted: boolean;
  photoUrl: string;
}

export interface SampleArticle {
  num: number;
  text: string;
}

export interface SiteLawArticle {
  id: string;
  lawId: string;
  number: number;
  text: string;
}

export interface LawPageTab {
  id: string;
  name: string;
  filterCategory?: string;
  count?: number;
}

export interface SiteLawFirm {
  id: string;
  name: string;
  city: string;
  address: string;
  phones: string;
  email: string;
  hue: string;
}

export interface SiteArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  lawyerId: string;
  date: string;
  readingTime: number;
  hue: string;
  views: number;
  status: string;
}

export interface SiteData {
  laws: SiteLaw[];
  services: SiteService[];
  lawyers: SiteLawyer[];
  lawFirms: SiteLawFirm[];
  articles: SiteArticle[];
  lawArticles: SiteLawArticle[];
  hero: SiteHero;
  footer: SiteFooter;
  stats: { value: number; suffix: string; label: string }[];
  features: { id: string; title: string; desc: string; icon: string }[];
  testimonials: { id: string; name: string; role: string; rating: number; text: string; initials: string; hue: string }[];
  faqs: { q: string; a: string }[];
  partners: { id: string; name: string; title: string; icon: string; url: string }[];
  categories: { id: string; name: string; icon: string }[];
  logo: string;
  siteName: string;
  lawPageTabs: LawPageTab[];
  registrationEnabled: boolean;
  lawTypeVisibility: Record<string, boolean>;
}

/** Map DB lawyer to the shape expected by existing components (lib/data.ts Lawyer type) */
function mapLawyer(l: SiteLawyer) {
  let langs: string[] = [];
  try { langs = JSON.parse(l.languages); } catch { langs = [l.languages]; }
  return {
    id: l.id,
    name: l.name,
    slug: l.slug,
    city: l.city,
    specialization: l.specialization,
    experience: l.experience,
    rating: l.rating,
    reviews: l.reviewCount,
    verified: l.verified,
    price: l.price,
    online: l.online,
    gender: l.gender as "male" | "female",
    languages: langs,
    bio: l.bio,
    initials: l.initials,
    hue: l.hue,
    whatsapp: l.whatsapp || undefined,
    telegram: l.telegram || undefined,
    facebook: l.facebook || undefined,
    instagram: l.instagram || undefined,
    promoted: l.promoted || undefined,
    photoUrl: l.photoUrl || undefined,
  };
}

// Module-level shared cache: ALL useSiteData() consumers across a page share a
// SINGLE network request + server hit. Previously every section (header, hero,
// laws, lawyers, services, faq, ...) fired its own fetch to /api/site-data,
// causing 8–10 separate server requests (× 16 DB queries each) per page load.
const SITE_DATA_CLIENT_TTL = 10_000; // ms
let cachedSiteData: { data: SiteData; ts: number } | null = null;
let inflightSiteData: Promise<SiteData | null> | null = null;

async function fetchSiteData(): Promise<SiteData | null> {
  if (cachedSiteData && Date.now() - cachedSiteData.ts < SITE_DATA_CLIENT_TTL) {
    return cachedSiteData.data;
  }
  if (inflightSiteData) return inflightSiteData;
  inflightSiteData = (async () => {
    try {
      const res = await fetch("/api/site-data", { cache: "no-store" });
      if (!res.ok) return cachedSiteData?.data ?? null;
      const json = (await res.json()) as SiteData;
      cachedSiteData = { data: json, ts: Date.now() };
      return json;
    } catch {
      return cachedSiteData?.data ?? null;
    } finally {
      inflightSiteData = null;
    }
  })();
  return inflightSiteData;
}

export function useSiteData() {
  const [data, setData] = useState<SiteData | null>(cachedSiteData?.data ?? null);
  const [isLoading, setIsLoading] = useState(!cachedSiteData?.data);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const json = await fetchSiteData();
      if (json) setData(json);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onFocus = () => {
      load(false);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const lawyers = (data?.lawyers || []).map(mapLawyer);

  return {
    laws: data?.laws || [],
    services: data?.services || [],
    lawyers,
    lawFirms: data?.lawFirms || [],
    articles: data?.articles || [],
    lawArticles: data?.lawArticles || [],
    hero: data?.hero || { badge: "", title: "", titleGradient: "", subtitle: "", btnPrimary: "", btnSecondary: "" },
    footer: data?.footer || { description: "", newsletterText: "", phone: "", email: "", address: "", workingHours: "", socials: "{}", legalLinks: "[]" },
    stats: data?.stats || [],
    features: data?.features || [],
    testimonials: data?.testimonials || [],
    faqs: data?.faqs || [],
    partners: data?.partners || [],
    categories: data?.categories || [],
    logo: data?.logo || "/qanuni/logo.png",
    siteName: data?.siteName || "قانوني",
    lawPageTabs: data?.lawPageTabs || [
      { id: "all", name: "القوانين العراقية", count: (data?.laws || []).length },
      { id: "decisions", name: "قرارات محكمة التمييز", filterCategory: "cassation" },
      { id: "regulations", name: "التعليمات", filterCategory: "regulation" },
      { id: "systems", name: "الأنظمة", filterCategory: "system" },
    ],
    registrationEnabled: data?.registrationEnabled ?? true,
    lawTypeVisibility: data?.lawTypeVisibility ?? { all: true, decisions: true, regulations: true, systems: true },
    isLoading,
    reload: load,
  };
}
