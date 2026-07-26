// ===== Iraqi Legal Assistant - Confidence Scoring =====
import type {
  ConfidenceScore,
  ConfidenceFactor,
  LawReference,
  QuestionAnswer,
  CaseType,
} from "../types";

// === Calculate Confidence Score ===
export function calculateConfidence(params: {
  lawReferences: LawReference[];
  questionAnswers: QuestionAnswer[];
  caseType: CaseType;
  queryClarity: number; // 0-1
  completionPercentage: number; // 0-100
}): ConfidenceScore {
  const factors: ConfidenceFactor[] = [];

  // Factor 1: Number of law references found
  const lawCountScore = Math.min(params.lawReferences.length * 20, 100);
  factors.push({
    name: "عدد المواد القانونية",
    score: lawCountScore,
    weight: 0.3,
    description: `تم العثور على ${params.lawReferences.length} مادة قانونية`,
  });

  // Factor 2: Relevance of law references
  const avgRelevance =
    params.lawReferences.length > 0
      ? params.lawReferences.reduce((sum, ref) => sum + ref.relevance, 0) /
        params.lawReferences.length
      : 0;
  const relevanceScore = Math.round(avgRelevance * 100);
  factors.push({
    name: "صلة المواد بالسؤال",
    score: relevanceScore,
    weight: 0.25,
    description: `متوسط الصلة: ${relevanceScore}%`,
  });

  // Factor 3: Question answers completeness
  const completionScore = params.completionPercentage;
  factors.push({
    name: "اكتمال المعلومات",
    score: completionScore,
    weight: 0.2,
    description: `اكتمال المعلومات: ${completionScore}%`,
  });

  // Factor 4: Query clarity
  const clarityScore = Math.round(params.queryClarity * 100);
  factors.push({
    name: "وضوح السؤال",
    score: clarityScore,
    weight: 0.15,
    description: `وضوح السؤال: ${clarityScore}%`,
  });

  // Factor 5: Case type detection
  const caseTypeScore = params.caseType !== "unknown" ? 100 : 30;
  factors.push({
    name: "تحديد نوع القضية",
    score: caseTypeScore,
    weight: 0.1,
    description:
      params.caseType !== "unknown"
        ? `تم تحديد نوع القضية: ${getCaseTypeLabel(params.caseType)}`
        : "لم يتم تحديد نوع القضية بوضوح",
  });

  // Calculate overall score
  let overall = 0;
  for (const factor of factors) {
    overall += factor.score * factor.weight;
  }
  overall = Math.round(Math.min(overall, 100));

  // Determine level
  let level: ConfidenceScore["level"];
  let message: string;

  if (overall >= 80) {
    level = "high";
    message = "ثقة عالية - المعلومات كافية للإجابة";
  } else if (overall >= 60) {
    level = "medium";
    message = "ثقة متوسطة - قد تحتاج معلومات إضافية";
  } else if (overall >= 40) {
    level = "low";
    message = "ثقة منخفضة - يُنصح بطلب معلومات إضافية";
  } else {
    level = "very_low";
    message = "ثقة منخفضة جداً - لا يمكن تقديم إجابة موثوقة";
  }

  return {
    overall,
    factors,
    level,
    message,
  };
}

// === Calculate Query Clarity ===
export function calculateQueryClarity(query: string): number {
  let clarity = 0.5; // Base clarity

  // Length factor (longer queries tend to be clearer)
  if (query.length > 20) clarity += 0.1;
  if (query.length > 50) clarity += 0.1;
  if (query.length > 100) clarity += 0.1;

  // Question mark presence
  if (query.includes("?") || query.includes("؟")) clarity += 0.1;

  // Specific legal terms
  const legalTerms = [
    "قانون", "مادة", "حكم", "محكمة", "قانوني",
    "حق", " Obligation", "عقد", "اتفاقية",
  ];
  const hasLegalTerms = legalTerms.some((term) => query.includes(term));
  if (hasLegalTerms) clarity += 0.1;

  return Math.min(clarity, 1);
}

// === Get Case Type Label ===
function getCaseTypeLabel(caseType: CaseType): string {
  const labels: Record<CaseType, string> = {
    personal: "الأحوال الشخصية",
    real_estate: "العقارات",
    criminal: "الجنائية",
    labor: "قانون العمل",
    civil: "المدني",
    commercial: "التجاري",
    traffic: "المرور",
    companies: "الشركات",
    investment: "الاستثمار",
    unknown: "غير محدد",
  };
  return labels[caseType] || "غير محدد";
}

// === Get Confidence Color ===
export function getConfidenceColor(level: ConfidenceScore["level"]): string {
  const colors: Record<ConfidenceScore["level"], string> = {
    high: "text-green-600 bg-green-50",
    medium: "text-yellow-600 bg-yellow-50",
    low: "text-orange-600 bg-orange-50",
    very_low: "text-red-600 bg-red-50",
  };
  return colors[level];
}

// === Get Confidence Icon ===
export function getConfidenceIcon(level: ConfidenceScore["level"]): string {
  const icons: Record<ConfidenceScore["level"], string> = {
    high: "✓",
    medium: "⚠",
    low: "⚠",
    very_low: "✗",
  };
  return icons[level];
}
