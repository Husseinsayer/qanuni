// ===== RAG Pipeline — Orchestrator =====
// Single entry point: retrieve → augment → generate → verify.
import type {
  Message, CaseType, AIConfig, BotInstructions,
  RAGResponse, RetrievalResult, GenerationContext,
} from "../types";
import { detectCaseType } from "./search";
import { retrieve } from "./retriever";
import { buildGenerationContext } from "./context-builder";
import { generateAnswer } from "../answer/answer-engine";
import { verifyAnswer } from "../engine/verifier";

export async function ragQuery(
  message: string,
  options: {
    caseType?: CaseType;
    conversationHistory?: Message[];
    instructions: BotInstructions;
    aiConfig?: AIConfig;
  }
): Promise<RAGResponse> {
  const caseType = options.caseType || detectCaseType(message);
  const convHistory = options.conversationHistory || [];
  const instructions = options.instructions;

  // Step 1: Retrieve
  const retrieval: RetrievalResult = await retrieve(message, caseType);

  // Step 2: Augment (build context with citations)
  const context: GenerationContext = buildGenerationContext(retrieval);

  // Step 3: Generate
  const generated = await generateAnswer(
    context,
    retrieval,
    instructions,
    {
      aiConfig: options.aiConfig,
      conversationHistory: convHistory,
      userMessage: message,
    }
  );

  // Step 4: Verify
  const verification = verifyAnswer(generated, retrieval.classification);

  // Build response
  const response: RAGResponse = {
    answer: generated.answer,
    quality: generated.quality,
    answerSource: generated.answerSource,
    confidence: generated.confidence,
    classification: retrieval.classification,
    citations: generated.citations,
  };

  // Include verification issues only if severe
  if (!verification.passed) {
    const severeIssues: string[] = [];
    if (verification.citationAccuracy < 50) {
      severeIssues.push(`دقة الاستشهادات منخفضة (${verification.citationAccuracy}%)`);
    }
    if (verification.completenessScore < 30) {
      severeIssues.push("الإجابة غير مكتملة");
    }
    if (severeIssues.length > 0) {
      response.verification = severeIssues;
    }
  }

  return response;
}
