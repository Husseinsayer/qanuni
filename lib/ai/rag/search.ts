// ===== Iraqi Legal Assistant - RAG Search Engine =====
import type { SearchQuery, SearchResult, CaseType, MetadataMatch, EnhancedSearchResult, QuestionClassification } from "../types";
import { sampleArticles, laws } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { getKnowledgeContext, searchKnowledgeCenter } from "@/lib/knowledge-center/search";
import { classifyQuestion } from "./question-classifier";

// Effective articles = static base overlaid with admin-edited articles from the
// unified store (SiteConfig "adminData"). Cached briefly to avoid a DB hit on
// every retrieval.
type ArticleShape = { num: number; text: string };
let _articlesCache: { data: Record<string, ArticleShape[]>; ts: number } | null = null;
const ARTICLES_TTL = 30_000;

async function getEffectiveArticles(): Promise<Record<string, ArticleShape[]>> {
  if (_articlesCache && Date.now() - _articlesCache.ts < ARTICLES_TTL) {
    return _articlesCache.data;
  }
  const base = sampleArticles as Record<string, ArticleShape[]>;
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: "adminData" } });
    if (row?.value) {
      const ad = JSON.parse(row.value) as { sampleArticles?: Record<string, ArticleShape[]> };
      if (ad.sampleArticles && typeof ad.sampleArticles === "object") {
        const merged: Record<string, ArticleShape[]> = { ...base };
        for (const [k, v] of Object.entries(ad.sampleArticles)) {
          if (Array.isArray(v)) merged[k] = v;
        }
        _articlesCache = { data: merged, ts: Date.now() };
        return merged;
      }
    }
  } catch {
    /* ignore */
  }
  _articlesCache = { data: base, ts: Date.now() };
  return base;
}

// === Keyword Mapping for Case Types ===
const caseTypeKeywords: Record<CaseType, string[]> = {
  personal: ["زواج", "طلاق", "حضانة", "نفقة", "نسب", "ميراث", "أحوال شخصية", "زوجة", "زوج"],
  real_estate: ["عقار", "أرض", "تسجيل", "ملكية", "رهن", "قسمة", "بيع عقار", "صفح"],
  criminal: ["جريمة", "عقوبة", "سجن", "تحقيق", "متهم", "إعدام", "غرامة", "عقوبات"],
  labor: ["عمل", "عامل", "فصل", "مكافأة", "خدمة", "عقد عمل", "أجر", "ساعات عمل"],
  civil: ["عقد", "ضمان", "تعويض", "مسؤولية", "ملكية", "ديون", "emand", "civil"],
  commercial: ["تاجر", "شركة تجارية", "إفلاس", "كمبيالة", "شيك", "سند أمر"],
  traffic: ["مرور", "مخالفة", "سرعة", "حادث", "رخصة", "سيارة"],
  companies: ["تأسيس شركة", "مساهمة", "محدودة", "تضامن", "مجلس إدارة", "جمعية عامة"],
  investment: ["استثمار", "مستثمر", "إعفاء", "هيئة الاستثمار", "دراسة جدوى"],
  unknown: [],
};

// === Article Search Result with Context ===
export type ArticleSearchResult = SearchResult & {
  lawId: string;
  lawName: string;
  category: string;
};

// === Main Search Function ===
export async function searchLaws(query: SearchQuery): Promise<ArticleSearchResult[]> {
  const results: ArticleSearchResult[] = [];
  const queryLower = query.text.toLowerCase();
  const queryWords = extractWords(queryLower);
  const articlesMap = await getEffectiveArticles();

  // Search through all laws and their articles
  for (const law of laws) {
    const lawId = law.id;
    const articles = articlesMap[lawId] || [];

    for (const article of articles) {
      const articleText = article.text.toLowerCase();
      const articleNum = article.num;

      // Calculate relevance score
      let score = 0;
      let matchType: "semantic" | "exact" | "hybrid" = "exact";

      // 1. Exact phrase match (highest weight)
      if (articleText.includes(queryLower)) {
        score += 100;
        matchType = "exact";
      }

      // 2. Word matching
      const matchedWords = queryWords.filter((w) => articleText.includes(w));
      if (matchedWords.length > 0) {
        score += (matchedWords.length / queryWords.length) * 80;
        if (score > 50) matchType = "hybrid";
      }

      // 3. Semantic similarity (keyword-based)
      if (query.caseType) {
        const caseKeywords = caseTypeKeywords[query.caseType] || [];
        const caseMatches = caseKeywords.filter((k) =>
          articleText.includes(k.toLowerCase())
        );
        if (caseMatches.length > 0) {
          score += (caseMatches.length / caseKeywords.length) * 30;
        }
      }

      // 4. Article number match
      if (String(articleNum) === queryLower.trim()) {
        score += 90;
      }

      // Add to results if above threshold
      if (score >= query.threshold) {
        results.push({
          lawId,
          lawName: law.name,
          articleNumber: articleNum,
          articleText: article.text,
          score: Math.min(score, 100),
          matchType,
          category: law.category || lawId,
        });
      }
    }
  }

  // Sort by score (descending) and limit results
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, query.limit);
}

// === Get Articles by Law ID ===
export async function getArticlesByLaw(lawId: string): Promise<ArticleSearchResult[]> {
  const law = laws.find((l) => l.id === lawId);
  if (!law) return [];

  const articles = (await getEffectiveArticles())[lawId] || [];
  return articles.map((article) => ({
    lawId,
    lawName: law.name,
    articleNumber: article.num,
    articleText: article.text,
    score: 100,
    matchType: "exact" as const,
    category: law.category || lawId,
  }));
}

// === Get Article by Law ID and Number ===
export async function getArticle(
  lawId: string,
  articleNumber: number
): Promise<ArticleSearchResult | null> {
  const law = laws.find((l) => l.id === lawId);
  if (!law) return null;

  const articles = (await getEffectiveArticles())[lawId] || [];
  const article = articles.find((a) => a.num === articleNumber);
  if (!article) return null;

  return {
    lawId,
    lawName: law.name,
    articleNumber: article.num,
    articleText: article.text,
    score: 100,
    matchType: "exact",
    category: law.category || lawId,
  };
}

// === Detect Case Type from Query ===
export function detectCaseType(query: string): CaseType {
  const queryLower = query.toLowerCase();

  // Score each case type
  const scores: Record<CaseType, number> = {
    personal: 0,
    real_estate: 0,
    criminal: 0,
    labor: 0,
    civil: 0,
    commercial: 0,
    traffic: 0,
    companies: 0,
    investment: 0,
    unknown: 0,
  };

  for (const [type, keywords] of Object.entries(caseTypeKeywords)) {
    for (const keyword of keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        scores[type as CaseType] += 1;
      }
    }
  }

  // Find the highest scoring case type
  let maxScore = 0;
  let detectedType: CaseType = "unknown";

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type as CaseType;
    }
  }

  return maxScore >= 1 ? detectedType : "unknown";
}

// === Extract Words from Query ===
function extractWords(query: string): string[] {
  // Split by spaces and remove common stop words
  const stopWords = new Set([
    "في",
    "من",
    "إلى",
    "على",
    "عن",
    "مع",
    "هذا",
    "هذه",
    "التي",
    "الذي",
    "هل",
    "ما",
    "كيف",
    "لماذا",
    "متى",
    "أين",
    "من",
    "كان",
    "يكون",
    "كيف",
    "لا",
    "لم",
    "لن",
    "قد",
    "و",
    "أو",
    "ثم",
    "بل",
    "لا",
    "ما",
    "هل",
    "أنا",
    "أنت",
    "هو",
    "هي",
    "نحن",
    "هم",
  ]);

  return query
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));
}

// === Highlight Matching Text ===
export function highlightText(text: string, query: string): string {
  const words = extractWords(query.toLowerCase());
  let highlighted = text;

  for (const word of words) {
    const regex = new RegExp(`(${escapeRegex(word)})`, "gi");
    highlighted = highlighted.replace(
      regex,
      '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>'
    );
  }

  return highlighted;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// === Combined Search: Laws + Knowledge Center ===
export async function combinedSearch(query: SearchQuery): Promise<{
  laws: ArticleSearchResult[];
  knowledgeContext: string;
  knowledgeResults: ReturnType<typeof searchKnowledgeCenter>;
}> {
  // Search laws
  const laws = await searchLaws(query);

  // Search Knowledge Center
  const knowledgeResults = searchKnowledgeCenter({
    text: query.text,
    threshold: query.threshold,
    limit: query.limit,
  });

  // Get formatted context for AI
  const knowledgeContext = getKnowledgeContext(query.text);

  return {
    laws,
    knowledgeContext,
    knowledgeResults,
  };
}

// ===== Enhanced Search Functions =====

// === Find a law by exact name or keyword ===
export function findLawByQuery(query: string): MetadataMatch | null {
  const normalized = query.replace(/\s+/g, " ").trim();
  for (const law of laws) {
    // Direct name match (highest score)
    if (normalized.includes(law.name)) {
      return { law, score: 100, matchField: "name" };
    }
    // Partial word match
    const lawWords = law.name.split(/\s+/).filter((w) => w.length > 2);
    const matchedWords = lawWords.filter((w) => normalized.includes(w));
    if (matchedWords.length >= 2) {
      return { law, score: 70, matchField: "name" };
    }
  }
  // Keyword-based fallback
  const lawKeywords: Record<string, string> = {
    "مدني": "civil", "مدنية": "civil",
    "عقوبات": "penal", "جنائي": "penal", "جنائية": "penal",
    "أحوال شخصية": "personal", "شخصية": "personal",
    "عمل": "labor", "عمال": "labor",
    "مرور": "traffic",
    "شركات": "companies",
    "استثمار": "investment",
    "تجاري": "commercial", "تجارة": "commercial",
  };
  for (const [keyword, id] of Object.entries(lawKeywords)) {
    if (normalized.includes(keyword)) {
      const law = laws.find((l) => l.id === id);
      if (law) return { law, score: 50, matchField: "category" };
    }
  }
  return null;
}

// === Search law metadata (names, categories) ===
export function searchLawMetadata(query: string): MetadataMatch[] {
  const results: MetadataMatch[] = [];
  const normalized = query.replace(/\s+/g, " ").trim();
  // const queryWords = normalized.split(/\s+/).filter((w) => w.length > 2);

  for (const law of laws) {
    let score = 0;
    let matchField: "name" | "id" | "category" = "name";

    // Check name
    if (normalized.includes(law.name)) {
      score = 80;
    } else {
      // Word-level matching against name
      const nameWords = law.name.split(/\s+/).filter((w) => w.length > 2);
      const nameMatches = nameWords.filter((w) => normalized.includes(w)).length;
      if (nameMatches > 0) {
        score = (nameMatches / nameWords.length) * 60;
      }
    }

    // Check category
    if (law.category && normalized.includes(law.category)) {
      score = Math.max(score, 40);
      if (!normalized.includes(law.name)) matchField = "category";
    }

    if (score > 0) {
      results.push({ law, score: Math.min(score, 100), matchField });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

// === Enhanced search: metadata + articles + classification ===
export async function enhancedSearch(
  text: string,
  caseType: CaseType,
  options?: { limit?: number; threshold?: number }
): Promise<EnhancedSearchResult> {
  const limit = options?.limit ?? 10;
  const threshold = options?.threshold ?? 20;

  // 1. Classify the question
  const classification: QuestionClassification = classifyQuestion(text);

  // 2. Search law metadata
  const metadataMatches = searchLawMetadata(text);
  const matchedLaw = findLawByQuery(text);

  // 3. Search article content
  const searchQuery: SearchQuery = {
    text,
    caseType,
    limit,
    threshold,
    useSemantic: true,
    useExact: true,
  };
  const articles = await searchLaws(searchQuery);

  // 4. Search knowledge center
  const knowledgeResults = searchKnowledgeCenter({
    text,
    threshold,
    limit,
  });
  const knowledgeContext = getKnowledgeContext(text);

  return {
    metadataMatches,
    articles,
    matchedLaw,
    classification,
    knowledgeContext,
    knowledgeResults,
  };
}
