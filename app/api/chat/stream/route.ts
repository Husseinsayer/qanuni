// ===== Iraqi Legal Assistant - Streaming API =====
// ragQuery() handles retrieve → augment → generate → verify.
// SSE events for real-time progress visibility.
import { NextRequest } from "next/server";
import type { Message, AIConfig, BotInstructions, RAGResponse } from "@/lib/ai/types";
import { ragQuery } from "@/lib/ai/rag/pipeline";
import { detectDialect } from "@/lib/ai/language/dialect";
import { detectCaseType } from "@/lib/ai/rag/search";
import { getProvider } from "@/lib/ai/providers/base";
import "@/lib/ai/providers/openai";
import { defaultAIConfig, defaultBotInstructions as defaultBI } from "@/lib/ai/config";

type StreamRequest = {
  message: string;
  conversationHistory?: Message[];
  aiConfig?: AIConfig;
  botInstructions?: BotInstructions;
};

export async function POST(request: NextRequest) {
  try {
    const body: StreamRequest = await request.json();
    const { message, conversationHistory = [], aiConfig, botInstructions } = body;

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "الرسالة مطلوبة" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const config: AIConfig = defaultAIConfig; // Server-side only — never accept apiKey from client
    const instructions: BotInstructions = botInstructions || defaultBI;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // --- Step 1: Dialect ---
          sendEvent("step", { step: "كشف اللهجة", status: "running" });
          const dialectResult = detectDialect(message);
          sendEvent("step", { step: "كشف اللهجة", status: "complete", result: dialectResult });

          // --- Step 2: Detect case type ---
          sendEvent("step", { step: "تصنيف السؤال", status: "running" });
          const caseType = detectCaseType(message);
          sendEvent("step", {
            step: "تصنيف السؤال",
            status: "complete",
            result: { caseType },
          });

          // --- Step 3: Run RAG pipeline ---
          sendEvent("step", { step: "البحث والتوليد", status: "running" });

          const ragResult: RAGResponse = await ragQuery(message, {
            caseType,
            conversationHistory,
            instructions,
            aiConfig: config,
          });

          sendEvent("step", { step: "البحث والتوليد", status: "complete" });

          // --- Step 4: AI enhancement if needed ---
          let finalAnswer = ragResult.answer;
          let answerSource = ragResult.answerSource;

          if (ragResult.quality !== "high" && !!config.apiKey && ragResult.answerSource !== "ai") {
            sendEvent("step", { step: "تحسين الإجابة بالذكاء الاصطناعي", status: "running" });
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
                finalAnswer = aiResponse.content;
                answerSource = "ai";
              }
            } catch {
              // Keep DB answer on AI failure
            }
            sendEvent("step", { step: "تحسين الإجابة بالذكاء الاصطناعي", status: "complete" });
          }

          // --- Step 5: Stream tokens ---
          const words = finalAnswer.split(" ");
          for (const word of words) {
            sendEvent("token", { content: word + " " });
            await new Promise((resolve) => setTimeout(resolve, 15));
          }

          // --- Step 6: Done ---
          sendEvent("done", {
            caseType,
            confidence: ragResult.confidence,
            dialect: dialectResult.dialect,
            answerSource,
            classification: ragResult.classification,
          });

          controller.close();
        } catch {
          sendEvent("error", { message: "حدث خطأ أثناء التوليد" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "حدث خطأ في الخادم" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
