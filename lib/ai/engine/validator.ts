// ===== Iraqi Legal Assistant - Answer Validator =====
import type {
  Message,
  LawReference,
  ConfidenceScore,
} from "../types";

// === Validation Result ===
export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
};

export type ValidationError = {
  type: "missing_reference" | "unsupported_claim" | "contradiction" | "wrong_article" | "wrong_law";
  message: string;
  severity: "high" | "medium" | "low";
};

export type ValidationWarning = {
  type: "low_confidence" | "incomplete_info" | "outdated_reference";
  message: string;
};

// === Main Validator Function ===
export function validateAnswer(
  answer: string,
  lawReferences: LawReference[],
  confidence: ConfidenceScore
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Check if answer has law references when needed
  if (confidence.overall >= 60 && lawReferences.length === 0) {
    errors.push({
      type: "missing_reference",
      message: "الإجابة لا تحتوي على مواد قانونية رغم أن الثقة عالية",
      severity: "high",
    });
  }

  // 2. Check for unsupported claims
  const unsupportedClaims = detectUnsupportedClaims(answer, lawReferences);
  for (const claim of unsupportedClaims) {
    errors.push({
      type: "unsupported_claim",
      message: `ادعاء غير مدعوم: "${claim}"`,
      severity: "medium",
    });
  }

  // 3. Check for contradictions in law references
  const contradictions = detectContradictions(lawReferences);
  for (const contradiction of contradictions) {
    errors.push({
      type: "contradiction",
      message: `تناقض في المواد: ${contradiction}`,
      severity: "high",
    });
  }

  // 4. Check if article numbers exist
  for (const ref of lawReferences) {
    if (ref.articleNumber <= 0) {
      errors.push({
        type: "wrong_article",
        message: `رقم المادة غير صالح: ${ref.articleNumber}`,
        severity: "high",
      });
    }
  }

  // 5. Check confidence level
  if (confidence.level === "low" || confidence.level === "very_low") {
    warnings.push({
      type: "low_confidence",
      message: `درجة الثقة منخفضة: ${confidence.overall}%`,
    });
  }

  // 6. Check for outdated references
  // (In real implementation, this would check article dates)

  // Calculate validation score
  let score = 100;
  for (const error of errors) {
    if (error.severity === "high") score -= 30;
    else if (error.severity === "medium") score -= 15;
    else score -= 5;
  }
  for (const warning of warnings) {
    score -= 5;
  }
  score = Math.max(0, score);

  return {
    valid: errors.filter((e) => e.severity === "high").length === 0,
    errors,
    warnings,
    score,
  };
}

// === Detect Unsupported Claims ===
function detectUnsupportedClaims(
  answer: string,
  lawReferences: LawReference[]
): string[] {
  const claims: string[] = [];

  // Extract potential claims (sentences with legal terms)
  const sentences = answer.split(/[.!?؟]/).filter((s) => s.trim().length > 10);
  const legalTerms = ["قانون", "مادة", "حكم", "محكمة", "حق", "التزام"];

  for (const sentence of sentences) {
    const hasLegalTerm = legalTerms.some((term) => sentence.includes(term));
    if (hasLegalTerm) {
      // Check if this claim is supported by any reference
      const isSupported = lawReferences.some(
        (ref) =>
          ref.articleText.includes(sentence.trim()) ||
          sentence.includes(`المادة ${ref.articleNumber}`)
      );
      if (!isSupported && sentence.length > 30) {
        claims.push(sentence.trim().substring(0, 50) + "...");
      }
    }
  }

  return claims.slice(0, 3); // Return top 3
}

// === Detect Contradictions ===
function detectContradictions(lawReferences: LawReference[]): string[] {
  const contradictions: string[] = [];

  // Group references by law
  const byLaw = new Map<string, LawReference[]>();
  for (const ref of lawReferences) {
    const existing = byLaw.get(ref.lawId) || [];
    existing.push(ref);
    byLaw.set(ref.lawId, existing);
  }

  // Check for same article number appearing twice
  for (const [, refs] of byLaw) {
    const articleNums = refs.map((r) => r.articleNumber);
    const duplicates = articleNums.filter(
      (num, idx) => articleNums.indexOf(num) !== idx
    );
    if (duplicates.length > 0) {
      contradictions.push(
        `المادة ${duplicates[0]} تظهر مرتين في نفس القانون`
      );
    }
  }

  return contradictions;
}

// === Fix Answer (Auto-correction) ===
export function fixAnswer(
  answer: string,
  validation: ValidationResult
): string {
  let fixed = answer;

  // Remove unsupported claims
  for (const error of validation.errors) {
    if (error.type === "unsupported_claim") {
      // Extract the claim text and remove it
      const match = error.message.match(/"(.+)"/);
      if (match) {
        fixed = fixed.replace(match[1], "");
      }
    }
  }

  // Add disclaimer for low confidence
  if (validation.warnings.some((w) => w.type === "low_confidence")) {
    fixed += "\n\n⚠️ ملاحظة: هذه الإجابة قد تحتاج تأكيد من متخصص قانوني.";
  }

  return fixed;
}
