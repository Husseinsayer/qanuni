// ===== Iraqi Legal Assistant - Chat API Route =====
// Strategy: ragQuery() orchestrates retrieve → augment → generate → verify.
// Database-first, AI-last: AI API used ONLY when DB data is insufficient.
import { NextRequest, NextResponse } from "next/server";
import type { Message, AIConfig, BotInstructions, RAGResponse, LawReference, CitationEntry } from "@/lib/ai/types";
import { ragQuery } from "@/lib/ai/rag/pipeline";
import { detectDialect } from "@/lib/ai/language/dialect";
import { getProvider } from "@/lib/ai/providers/base";
import "@/lib/ai/providers/openai";
import { defaultAIConfig, defaultBotInstructions as defaultBI } from "@/lib/ai/config";
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit";

type ChatRequest = {
  message: string;
  conversationHistory?: Message[];
  conversationId?: string;
  debug?: boolean;
  aiConfig?: AIConfig;
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = checkRateLimit(`chat:${ip}`, RATE_LIMITS.chat);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "تم تجاوز حد الطلبات. يرجى الانتظار قليلاً." },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body: ChatRequest = await request.json();
    const { message, conversationHistory = [], debug = false, aiConfig: _aiConfig } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "الرسالة طويلة جداً" }, { status: 400 });
    }

    const startTime = Date.now();
    const config: AIConfig = defaultAIConfig; // Server-side only — never accept apiKey from client
    const instructions: BotInstructions = defaultBI; // Always use server-side defaults

    // === Step 1: Detect dialect ===
    const dialectResult = detectDialect(message);

    // === Step 2: Run full RAG pipeline ===
    const ragResult: RAGResponse = await ragQuery(message, {
      conversationHistory,
      instructions,
      aiConfig: config,
    });

    // === Step 3: If DB quality not high and API key exists, enhance ===
    let answer = ragResult.answer;
    let answerSource = ragResult.answerSource;

    if (ragResult.quality !== "high" && !!config.apiKey && ragResult.answerSource !== "ai") {
      try {
        const provider = getProvider(config.provider);
        if (provider) {
          const systemMsg: Message = {
            id: "system",
            role: "system",
            content: instructions.generalBehavior,
            timestamp: Date.now(),
          };
          const contextMsg: Message = {
            id: "rag_context",
            role: "user",
            content: `المعلومات المسترجعة من قاعدة البيانات:\n\n${ragResult.answer}\n\nالسؤال الأصلي: ${message}`,
            timestamp: Date.now(),
          };
          const aiResponse = await provider.chat([systemMsg, contextMsg, ...conversationHistory], "", config);
          answer = aiResponse.content;
          answerSource = "ai";
        }
      } catch {
        // Keep DB answer on AI failure
      }
    }

    // === Step 4: Build response (backward-compatible) ===
    const lawReferences: LawReference[] = Object.values(ragResult.citations).map(
      (c: CitationEntry) => ({
        lawId: c.lawId,
        lawName: c.lawName,
        articleNumber: c.articleNum,
        articleText: c.text,
        relevance: 0.8,
        url: `/laws/${c.lawId}`,
      })
    );

    const response: Record<string, unknown> = {
      answer,
      caseType: ragResult.classification.type,
      confidence: ragResult.confidence,
      dialect: dialectResult.dialect,
      answerSource,
      quality: ragResult.quality,
      lawReferences,
      classification: ragResult.classification,
    };

    if (debug) {
      response.debug = {
        totalDuration: Date.now() - startTime,
        citations: ragResult.citations,
        verification: ragResult.verification,
      };
    }

    return NextResponse.json(response, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch {
    return NextResponse.json(
      {
        answer: "عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى لاحقاً.",
        error: "حدث خطأ في الخادم",
      },
      { status: 500 }
    );
  }
}
