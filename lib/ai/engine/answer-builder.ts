// ===== Iraqi Legal Assistant - Answer Builder =====
import type {
  LawReference,
  ConfidenceScore,
} from "../types";
import { getServerAnswerSettings } from "../server-settings";

// === Answer Sections ===
export type AnswerSections = {
  directAnswer: string;
  simplifiedExplanation: string;
  legalInterpretation: string;
  suggestedSteps: string[];
  differentCases: string[];
  lawReferences: LawReference[];
  lawLinks: { text: string; url: string }[];
};

// === Build Answer from Sections ===
export function buildAnswer(sections: AnswerSections): string {
  const settings = getServerAnswerSettings();
  const parts: string[] = [];

  // 1. Direct Answer
  if (sections.directAnswer) {
    parts.push(`## الجواب المباشر\n\n${sections.directAnswer}`);
  }

  // 2. Simplified Explanation
  if (settings.showExplanation && sections.simplifiedExplanation) {
    parts.push(`## شرح مبسط\n\n${sections.simplifiedExplanation}`);
  }

  // 3. Legal Interpretation
  if (sections.legalInterpretation) {
    parts.push(`## التفسير القانوني\n\n${sections.legalInterpretation}`);
  }

  // 4. Suggested Steps
  if (settings.showSteps && sections.suggestedSteps.length > 0) {
    const stepsList = sections.suggestedSteps
      .map((step, idx) => `${idx + 1}. ${step}`)
      .join("\n");
    parts.push(`## الخطوات المقترحة\n\n${stepsList}`);
  }

  // 5. Different Cases
  if (sections.differentCases.length > 0) {
    const casesList = sections.differentCases
      .map((c) => `- ${c}`)
      .join("\n");
    parts.push(`## حالات مختلفة\n\n${casesList}`);
  }

  // 6. Law References
  if (settings.showLawReferences && sections.lawReferences.length > 0) {
    const refsList = sections.lawReferences
      .map(
        (ref) =>
          `- **المادة ${ref.articleNumber}** - ${ref.lawName}: ${ref.articleText.substring(0, 100)}...`
      )
      .join("\n");
    parts.push(`## المواد القانونية\n\n${refsList}`);
  }

  // 7. Law Links
  if (settings.showLawLinks && sections.lawLinks.length > 0) {
    const linksList = sections.lawLinks
      .map((link) => `- [${link.text}](${link.url})`)
      .join("\n");
    parts.push(`## روابط المواد\n\n${linksList}`);
  }

  return parts.join("\n\n---\n\n");
}

// === Build System Prompt with Context ===
export function buildSystemPromptWithContext(
  basePrompt: string,
  lawReferences: LawReference[],
  confidence: ConfidenceScore
): string {
  const contextParts: string[] = [basePrompt];

  // Add law context
  if (lawReferences.length > 0) {
    contextParts.push("\n\n## المواد القانونية المتاحة:");
    for (const ref of lawReferences) {
      contextParts.push(
        `\n### المادة ${ref.articleNumber} - ${ref.lawName}:\n${ref.articleText}`
      );
    }
  }

  // Add confidence context
  contextParts.push(
    `\n\n## درجة الثقة الحالية: ${confidence.overall}% (${confidence.level})`
  );
  contextParts.push(`\n${confidence.message}`);

  // Add instructions based on confidence
  if (confidence.level === "low" || confidence.level === "very_low") {
    contextParts.push(
      "\n\n## تعليمات هامة:\nالثقة منخفضة. يرجى طلب معلومات إضافية من المستخدم قبل تقديم الإجابة النهائية."
    );
  }

  return contextParts.join("");
}

// === Format Confidence Badge ===
export function formatConfidenceBadge(confidence: ConfidenceScore): string {
  return `🎯 درجة الثقة: ${confidence.overall}% - ${confidence.message}`;
}

// === Format Law Reference for Display ===
export function formatLawReference(ref: LawReference): string {
  return `📚 **${ref.lawName}** - المادة ${ref.articleNumber}\n${ref.articleText}`;
}

// === Build Streaming Answer ===
export function* buildStreamingAnswer(
  sections: AnswerSections
): Generator<string, void, unknown> {
  const settings = getServerAnswerSettings();

  // Yield sections one by one
  if (sections.directAnswer) {
    yield `## الجواب المباشر\n\n`;
    yield* streamText(sections.directAnswer);
    yield "\n\n---\n\n";
  }

  if (settings.showExplanation && sections.simplifiedExplanation) {
    yield `## شرح مبسط\n\n`;
    yield* streamText(sections.simplifiedExplanation);
    yield "\n\n---\n\n";
  }

  if (sections.legalInterpretation) {
    yield `## التفسير القانوني\n\n`;
    yield* streamText(sections.legalInterpretation);
    yield "\n\n---\n\n";
  }

  if (settings.showSteps && sections.suggestedSteps.length > 0) {
    yield `## الخطوات المقترحة\n\n`;
    for (let i = 0; i < sections.suggestedSteps.length; i++) {
      yield `${i + 1}. ${sections.suggestedSteps[i]}\n`;
    }
    yield "\n---\n\n";
  }

  if (sections.differentCases.length > 0) {
    yield `## حالات مختلفة\n\n`;
    for (const c of sections.differentCases) {
      yield `- ${c}\n`;
    }
    yield "\n---\n\n";
  }

  if (settings.showLawReferences && sections.lawReferences.length > 0) {
    yield `## المواد القانونية\n\n`;
    for (const ref of sections.lawReferences) {
      yield `- **المادة ${ref.articleNumber}** - ${ref.lawName}\n`;
      yield `  ${ref.articleText.substring(0, 150)}...\n\n`;
    }
  }

  if (settings.showLawLinks && sections.lawLinks.length > 0) {
    yield `## روابط المواد\n\n`;
    for (const link of sections.lawLinks) {
      yield `- [${link.text}](${link.url})\n`;
    }
  }
}

function* streamText(text: string): Generator<string, void, unknown> {
  const words = text.split(" ");
  for (const word of words) {
    yield word + " ";
  }
}
