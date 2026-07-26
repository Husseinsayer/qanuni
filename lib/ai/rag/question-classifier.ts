// ===== Iraqi Legal Assistant - Question Type Classifier =====
// Classifies user questions into types for targeted answer generation.
import type { QuestionType, QuestionClassification } from "../types";
import { laws } from "@/lib/data";

// === Keyword maps per question type ===
const metadataKeywords: [string, string][] = [
  ["كم مادة", "law_metadata"],
  ["عدد المواد", "law_metadata"],
  ["كم باب", "law_metadata"],
  ["يتكون من", "law_metadata"],
  ["متى صدر", "law_metadata"],
  ["تاريخ صدور", "law_metadata"],
  ["تاريخ التحديث", "law_metadata"],
  ["آخر تحديث", "law_metadata"],
  ["كم فصل", "law_metadata"],
  ["أقسام", "law_metadata"],
];

const articleKeywords: [string, string][] = [
  ["المادة", "article_content"],
  ["نص المادة", "article_content"],
  ["تنص المادة", "article_content"],
  ["المواد", "article_content"],
];

const ruleKeywords: [string, string][] = [
  ["ما حكم", "legal_rule"],
  ["ما هي عقوبة", "legal_rule"],
  ["ما عقوبة", "legal_rule"],
  ["ما الحق", "legal_rule"],
  ["ما هي الحقوق", "legal_rule"],
  ["هل يحق", "legal_rule"],
  ["هل يجب", "legal_rule"],
  ["ما هي الواجبات", "legal_rule"],
  ["متى يحق", "legal_rule"],
  ["هل يجوز", "legal_rule"],
];

const procedureKeywords: [string, string][] = [
  ["كيف أقدم", "procedure"],
  ["كيفية", "procedure"],
  ["ما هي إجراءات", "procedure"],
  ["ما هي الخطوات", "procedure"],
  ["خطوات", "procedure"],
  ["أين أذهب", "procedure"],
  ["كيف أسجل", "procedure"],
  ["كيف أحصل", "procedure"],
  ["كيف أستخرج", "procedure"],
  ["إجراءات", "procedure"],
];

const definitionKeywords: [string, string][] = [
  ["ما هو", "legal_definition"],
  ["ما هي", "legal_definition"],
  ["عرف", "legal_definition"],
  ["تعريف", "legal_definition"],
  ["معنى", "legal_definition"],
  ["يقصد ب", "legal_definition"],
  ["المقصود", "legal_definition"],
];

const comparisonKeywords: [string, string][] = [
  ["الفرق بين", "comparison"],
  ["مقارنة", "comparison"],
  ["أيهما", "comparison"],
  ["الفرق", "comparison"],
];

const explanationKeywords: [string, string][] = [
  ["اشرح", "explanation"],
  ["فسر", "explanation"],
  ["وضح", "explanation"],
  ["بمعنى", "explanation"],
  ["شرح", "explanation"],
];

const allMaps: [string, string][][] = [
  metadataKeywords,
  articleKeywords,
  ruleKeywords,
  procedureKeywords,
  definitionKeywords,
  comparisonKeywords,
  explanationKeywords,
];

function getTypePriority(t: QuestionType): number {
  const order: Record<QuestionType, number> = {
    law_metadata: 1,
    article_content: 2,
    legal_rule: 3,
    procedure: 4,
    legal_definition: 5,
    comparison: 6,
    explanation: 7,
    general: 8,
  };
  return order[t] ?? 9;
}

// === Extract article number from query ===
function extractArticleNumber(query: string): number | undefined {
  // Pattern: "المادة X" or "مادة X" where X is a number
  const match = query.match(/(?:المادة|مادة)\s*(\d+)/);
  if (match) return parseInt(match[1], 10);
  // Pattern: just a standalone number after article-related terms
  const numMatch = query.match(/رقم\s*(\d+)/);
  if (numMatch) return parseInt(numMatch[1], 10);
  return undefined;
}

// === Find law name in query ===
function findLawInQuery(query: string): { name: string; id: string } | null {
  const normalized = query.replace(/\s+/g, " ").trim();
  for (const law of laws) {
    // Full name match
    if (normalized.includes(law.name)) {
      return { name: law.name, id: law.id };
    }
    // Partial name match: compare words
    const lawWords = law.name.split(/\s+/);
    const matchedWords = lawWords.filter((w) => w.length > 2 && normalized.includes(w));
    if (matchedWords.length >= 2) {
      return { name: law.name, id: law.id };
    }
  }
  // Try to match by keywords
  const lawKeywords: Record<string, string> = {
    "مدني": "civil",
    "مدنية": "civil",
    "عقوبات": "penal",
    "جنائي": "penal",
    "جنائية": "penal",
    "أحوال شخصية": "personal",
    "شخصية": "personal",
    "عمل": "labor",
    "عمال": "labor",
    "مرور": "traffic",
    "شركات": "companies",
    "استثمار": "investment",
    "تجاري": "commercial",
    "تجارة": "commercial",
  };
  for (const [keyword, id] of Object.entries(lawKeywords)) {
    if (normalized.includes(keyword)) {
      const law = laws.find((l) => l.id === id);
      if (law) return { name: law.name, id: law.id };
    }
  }
  return null;
}

// === Main classifier ===
export function classifyQuestion(query: string): QuestionClassification {
  const normalized = query.replace(/\s+/g, " ").trim();
  const detectedLaw = findLawInQuery(normalized);
  const articleNum = extractArticleNumber(normalized);

  // Score each type by keyword hits
  const scores = new Map<QuestionType, number>();
  for (const map of allMaps) {
    for (const [keyword, typeStr] of map) {
      if (normalized.includes(keyword)) {
        const type = typeStr as QuestionType;
        scores.set(type, (scores.get(type) || 0) + 1);
      }
    }
  }

  // Determine best type
  let bestType: QuestionType = "general";
  let bestScore = 0;

  // Priority: specific types beat general ones
  // If law_metadata keyword matched + law name found = high confidence
  for (const [type, score] of scores) {
    // Boost law_metadata if a law was found
    const adjusted = type === "law_metadata" && detectedLaw ? score + 2 : score;
    if (adjusted > bestScore) {
      bestScore = adjusted;
      bestType = type;
    } else if (adjusted === bestScore) {
      // Same score: more specific type wins (lower priority number)
      if (getTypePriority(type) < getTypePriority(bestType)) {
        bestType = type;
      }
    }
  }

  // If article keyword matched AND article number found, it's definitely article_content
  if (articleNum && normalized.match(/(?:المادة|مادة|رقم)/)) {
    bestType = "article_content";
    bestScore = Math.max(bestScore, 3);
  }

  // If law name found + metadata keywords → law_metadata
  if (detectedLaw && bestType !== "article_content") {
    const hasMetadata = metadataKeywords.some(([kw]) => normalized.includes(kw));
    if (hasMetadata) {
      bestType = "law_metadata";
      bestScore = Math.max(bestScore, 4);
    }
  }

  return {
    type: bestType,
    confidence: bestScore >= 3 ? 90 : bestScore >= 1 ? 60 : 30,
    lawName: detectedLaw?.name,
    lawId: detectedLaw?.id,
    articleNum,
  };
}
