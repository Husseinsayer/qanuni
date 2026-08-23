// ===== Iraqi Legal Assistant - Fact Analyzer =====
// Note: Heavy search operations moved to enhancedSearch() in rag/search.ts.
// This module does light fact extraction + strength assessment only.
import type {
  CaseType,
  QuestionAnswer,
  LawReference,
  SearchResult,
} from "../types";
import { detectCaseType } from "../rag/search";

// === Analyzed Facts ===
export type AnalyzedFacts = {
  caseType: CaseType;
  keyFacts: string[];
  legalIssues: string[];
  relevantLaws: LawReference[];
  missingInfo: string[];
  strength: "strong" | "moderate" | "weak";
};

// === Main Analyzer Function (lightweight: accepts pre-searched results) ===
export function analyzeFacts(
  query: string,
  answers: QuestionAnswer[],
  preSearchedArticles?: SearchResult[]
): AnalyzedFacts {
  // 1. Detect case type
  const caseType = detectCaseType(query);

  // 2. Extract key facts from query and answers
  const keyFacts = extractKeyFacts(query, answers);

  // 3. Identify legal issues
  const legalIssues = identifyLegalIssues(query, caseType);

  // 4. Map pre-searched articles (or empty if not provided — avoids duplicate searchLaws call)
  const relevantLaws: LawReference[] = (preSearchedArticles || []).map((result) => ({
    lawId: result.lawId,
    lawName: result.lawName,
    articleNumber: result.articleNumber,
    articleText: result.articleText,
    relevance: result.score / 100,
    url: `/laws/${result.lawId}#article-${result.articleNumber}`,
  }));

  // 5. Identify missing information
  const missingInfo = identifyMissingInfo(caseType, answers);

  // 6. Assess strength
  const strength = assessStrength(relevantLaws, keyFacts, missingInfo);

  return {
    caseType,
    keyFacts,
    legalIssues,
    relevantLaws,
    missingInfo,
    strength,
  };
}

// === Extract Key Facts ===
function extractKeyFacts(
  query: string,
  answers: QuestionAnswer[]
): string[] {
  const facts: string[] = [];

  // Add query as primary fact
  facts.push(`السؤال: ${query}`);

  // Add answers as facts
  for (const answer of answers) {
    facts.push(`${answer.questionId}: ${answer.answer}`);
  }

  return facts;
}

// === Identify Legal Issues ===
function identifyLegalIssues(query: string, caseType: CaseType): string[] {
  const issues: string[] = [];
  const queryLower = query.toLowerCase();

  // Personal status issues
  if (caseType === "personal") {
    if (queryLower.includes("طلاق")) issues.push("طلاق");
    if (queryLower.includes("حضانة")) issues.push("حضانة أطفال");
    if (queryLower.includes("نفقة")) issues.push("نفقة");
    if (queryLower.includes("نسب")) issues.push("إثبات نسب");
    if (queryLower.includes("ميراث")) issues.push("تقسيم تركة");
    if (queryLower.includes("زواج")) issues.push("زواج");
  }

  // Real estate issues
  if (caseType === "real_estate") {
    if (queryLower.includes("تسجيل")) issues.push("تسجيل عقار");
    if (queryLower.includes("ملكية")) issues.push("ملكية عقارية");
    if (queryLower.includes("قسمة")) issues.push("قسمة عقار");
    if (queryLower.includes("رهن")) issues.push("رهن عقاري");
    if (queryLower.includes("بيع")) issues.push("بيع عقار");
  }

  // Criminal issues
  if (caseType === "criminal") {
    if (queryLower.includes("تهمة")) issues.push("تهمة جنائية");
    if (queryLower.includes("تحقيق")) issues.push("تحقيق جنائي");
    if (queryLower.includes("عقوبة")) issues.push("عقوبة");
    if (queryLower.includes("سجن")) issues.push("سجن");
  }

  // Labor issues
  if (caseType === "labor") {
    if (queryLower.includes("فصل")) issues.push("فصل تعسفي");
    if (queryLower.includes("مكافأة")) issues.push("مكافأة نهاية الخدمة");
    if (queryLower.includes("أجر")) issues.push("أجر مستحق");
    if (queryLower.includes("عمل")) issues.push("عقد عمل");
  }

  // Traffic issues
  if (caseType === "traffic") {
    if (queryLower.includes("مخالفة")) issues.push("مخالفة مرورية");
    if (queryLower.includes("حادث")) issues.push("حادث مروري");
    if (queryLower.includes("سرعة")) issues.push("سرعة زائدة");
  }

  return issues.length > 0 ? issues : ["问题 قانوني عام"];
}

// === Identify Missing Information ===
function identifyMissingInfo(
  caseType: CaseType,
  answers: QuestionAnswer[]
): string[] {
  const missing: string[] = [];
  // const answeredIds = new Set(answers.map((a) => a.questionId));

  // Required info by case type
  const requiredInfo: Record<CaseType, string[]> = {
    personal: ["علاقة المدعي", "سبب المشكلة", "هل هناك عقد زواج"],
    real_estate: ["نوع العقار", "هل مسجل", "المشكلة تحديداً"],
    criminal: ["التهمة", "هل المتهم موقوف", "المرحلة الحالية"],
    labor: ["نوع العقد", "مدة الخدمة", "سبب المطالبة"],
    civil: ["نوع العقد", "طرفان العقد", "موضوع النزاع"],
    commercial: ["نوع النشاط التجاري", "نوع المشكلة"],
    traffic: ["نوع المخالفة", "تفاصيل الحادث"],
    companies: ["نوع الشركة", "الإجراء المطلوب"],
    investment: ["نوع المشروع", "الهيئة المستثمرة"],
    unknown: [],
  };

  const required = requiredInfo[caseType] || [];
  // Simple heuristic: if less than 2 answers, consider info missing
  if (answers.length < 2) {
    missing.push(...required.slice(answers.length));
  }

  return missing;
}

// === Assess Strength ===
function assessStrength(
  laws: LawReference[],
  keyFacts: string[],
  missingInfo: string[]
): "strong" | "moderate" | "weak" {
  let score = 0;

  // Laws found
  if (laws.length >= 3) score += 40;
  else if (laws.length >= 1) score += 20;

  // Facts available
  if (keyFacts.length >= 3) score += 30;
  else if (keyFacts.length >= 1) score += 15;

  // Missing info penalty
  if (missingInfo.length === 0) score += 30;
  else if (missingInfo.length <= 2) score += 15;

  if (score >= 70) return "strong";
  if (score >= 40) return "moderate";
  return "weak";
}
