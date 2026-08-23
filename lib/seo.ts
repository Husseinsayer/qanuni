import type { AdminSeo } from "./admin-data";

/** Trim a description to the safe snippet length (Google shows ~155–160 chars). */
export function buildDescription(desc: string | undefined, seo: AdminSeo): string {
  const base = desc || seo.meta.defaultDescription || "";
  if (!seo.meta.autoTrimDescription) return base;
  return base.length > 160 ? base.slice(0, 157) + "…" : base;
}

/** Absolute URL helper using metadataBase. */
export function absoluteUrl(path: string, seo: AdminSeo): string {
  const root = seo.meta.metadataBase || "https://qanuni.iq";
  if (/^https?:\/\//.test(path)) return path;
  return root.replace(/\/$/, "") + (path.startsWith("/") ? path : "/" + path);
}

/* ----------------------------------------------------------------------- *
 * Content analysis (client-side SEO score)
 * ----------------------------------------------------------------------- */

export interface ContentAnalysis {
  wordCount: number;
  keyword: string;
  keywordCount: number;
  keywordDensity: number;
  headings: { h1: number; h2: number; h3: number };
  missingAlt: number;
  images: number;
  paragraphs: number;
  avgParagraphWords: number;
  fleschReading: number;
  score: number;
  checks: { label: string; pass: boolean; weight: number; detail: string }[];
}

export function analyzeContent(opts: {
  title: string;
  description: string;
  html: string;
  keyword?: string;
  h1?: string;
}): ContentAnalysis {
  const text = opts.html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const keyword = (opts.keyword || "").trim();
  const kwLower = keyword.toLowerCase();
  const keywordCount = kwLower
    ? words.filter((w) => w.toLowerCase() === kwLower).length
    : 0;
  const keywordDensity = wordCount ? Math.round((keywordCount / wordCount) * 1000) / 10 : 0;

  const h1 = (opts.html.match(/<h1[\s>]/gi) || []).length;
  const h2 = (opts.html.match(/<h2[\s>]/gi) || []).length;
  const h3 = (opts.html.match(/<h3[\s>]/gi) || []).length;
  const imgs = opts.html.match(/<img[\s>]/gi) || [];
  const images = imgs.length;
  const missingAlt = (opts.html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length;
  const paragraphs = (opts.html.match(/<p[\s>]/gi) || []).length;
  const paraWords = paragraphs ? Math.round(wordCount / paragraphs) : 0;

  // crude Arabic readability: average sentence length by punctuation
  const sentences = text.split(/[.\n!؟]/).filter((s) => s.trim().length > 0).length || 1;
  const avgSentence = wordCount / sentences;
  const fleschReading = Math.max(0, Math.round(100 - avgSentence * 1.5));

  const checks: ContentAnalysis["checks"] = [];
  const add = (label: string, pass: boolean, weight: number, detail: string) =>
    checks.push({ label, pass, weight, detail });

  add("العنوان (Title) بين 30–60 حرف", (opts.title.length >= 10 && opts.title.length <= 60), 10, `${opts.title.length} حرف`);
  add("الوصف (Description) بين 70–160 حرف", (opts.description.length >= 50 && opts.description.length <= 160), 10, `${opts.description.length} حرف`);
  add("وجود H1 واحد", h1 === 1, 10, `H1: ${h1}`);
  add("وجود عناوين H2", h2 >= 1, 10, `H2: ${h2}`);
  add("وجود عناوين H3", h3 >= 1, 5, `H3: ${h3}`);
  add("طول المحتوى ≥ 300 كلمة", wordCount >= 300, 15, `${wordCount} كلمة`);
  add("جميع الصور تحتوي على Alt", missingAlt === 0 && images > 0, 10, `بدون Alt: ${missingAlt}/${images}`);
  add("كلمة مفتاحية محددة", keyword.length > 0, 10, keyword || "غير محددة");
  add("الكلمة المفتاحية في العنوان", keyword.length > 0 && opts.title.toLowerCase().includes(kwLower), 10, keyword ? (opts.title.toLowerCase().includes(kwLower) ? "نعم" : "لا") : "—");
  add("فقرات بطول معقول (≤ 120 كلمة)", paraWords <= 120 || paragraphs === 0, 5, `متوسط: ${paraWords}`);
  add("سهولة القراءة مقبولة", fleschReading >= 40, 5, `مؤشر: ${fleschReading}`);

  const score = checks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);

  return {
    wordCount,
    keyword,
    keywordCount,
    keywordDensity,
    headings: { h1, h2, h3 },
    missingAlt,
    images,
    paragraphs,
    avgParagraphWords: paraWords,
    fleschReading,
    score,
    checks,
  };
}

/* ----------------------------------------------------------------------- *
 * Site-wide SEO audit derived from known content
 * ----------------------------------------------------------------------- */

export interface SeoAuditRow {
  section: string;
  total: number;
  missingTitle: number;
  missingDesc: number;
  missingH1: number;
  score: number;
}

export function scoreFromIssues(total: number, issues: number): number {
  if (total === 0) return 100;
  return Math.round(((total - issues) / total) * 100);
}
