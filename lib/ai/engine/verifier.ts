// ===== RAG Pipeline — Verifier =====
// Post-generation quality check: citation validity + completeness.
import type { GeneratedAnswer, QuestionClassification, VerificationResult } from "../types";

export function verifyAnswer(
  generated: GeneratedAnswer,
  classification: QuestionClassification
): VerificationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // 1. Citation validity check
  const answerText = generated.answer;
  const citeRegex = /\[(\d+)\]/g;
  const foundCites = new Set<string>();
  let match;
  while ((match = citeRegex.exec(answerText)) !== null) {
    foundCites.add(`[${match[1]}]`);
  }

  let citationAccuracy = 100;
  if (foundCites.size > 0) {
    let validCites = 0;
    for (const tag of foundCites) {
      if (generated.citations[tag]) validCites++;
    }
    citationAccuracy = Math.round((validCites / foundCites.size) * 100);
    if (citationAccuracy < 100) {
      issues.push(`بعض الاستشهادات لا تتطابق مع مواد موجودة (${citationAccuracy}% دقة)`);
      suggestions.push("تأكد من أن كل [N] في الإجابة يقابل مادة في قائمة الاستشهادات");
    }
  }

  // 2. Completeness check
  let completenessScore = 0;
  if (answerText.length > 50) completenessScore += 30;
  if (answerText.length > 200) completenessScore += 10;
  if (foundCites.size > 0) completenessScore += 20;
  if (/^## /.test(answerText)) completenessScore += 20; // starts with heading
  if (answerText.includes("المادة") || answerText.includes("قانون")) completenessScore += 20;

  if (completenessScore < 40) {
    issues.push("الإجابة ناقصة أو قصيرة جداً");
    suggestions.push("أضف مواد قانونية داعمة للإجابة");
  }

  // 3. Classification-specific checks
  if (classification.type === "article_content" && !answerText.includes("المادة")) {
    issues.push("السؤال يطلب نص مادة لكن الإجابة لا تذكره");
    suggestions.push("اعرض نص المادة مباشرة في بداية الإجابة");
  }

  if (classification.type === "legal_rule" && !answerText.includes("المادة") && !answerText.includes("ينص")) {
    issues.push("السؤال عن حكم قانوني لكن الإجابة لا تستند لنص مادة");
    suggestions.push("اذكر المادة القانونية التي تستند إليها");
  }

  return {
    passed: issues.length === 0,
    issues,
    citationAccuracy,
    completenessScore,
    suggestions,
  };
}
