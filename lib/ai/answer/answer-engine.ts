// ===== RAG Pipeline — Answer Engine =====
// Strategy: metadata → DB, article → DB, general → RAG, insufficient → AI fallback.
import type {
  RetrievalResult, GenerationContext, GeneratedAnswer,
  CitationMap, BotInstructions, AIConfig, Message, ScoredArticle,
} from "../types";
import { answerLawMetadata, answerArticleContent } from "./metadata-answers";

export async function generateAnswer(
  context: GenerationContext,
  retrieval: RetrievalResult,
  instructions: BotInstructions,
  options?: { aiConfig?: AIConfig; conversationHistory?: Message[]; userMessage?: string }
): Promise<GeneratedAnswer> {
  const { classification, articles, matchedLaw, metadataMatches } = retrieval;

  // Strategy 1: Metadata question → direct DB answer
  if (classification.type === "law_metadata" && matchedLaw) {
    const dbAns = answerLawMetadata(matchedLaw, classification.type);
    return {
      answer: dbAns.answer,
      quality: dbAns.quality,
      citations: context.citations,
      answerSource: "metadata",
      confidence: 90,
      warnings: [],
    };
  }

  // Strategy 2: Article content question → direct DB answer
  if (classification.type === "article_content") {
    const dbAns = answerArticleContent(
      articles.map(sa => sa.article),
      matchedLaw
    );
    return {
      answer: dbAns.answer,
      quality: dbAns.quality,
      citations: context.citations,
      answerSource: "article",
      confidence: dbAns.quality === "high" ? 85 : 50,
      warnings: dbAns.quality === "low" ? ["نصوص المواد غير متوفرة"] : [],
    };
  }

  // Strategy 3: General question → RAG answer from DB
  return buildRAGAnswer(context, retrieval, instructions);
}

function buildRAGAnswer(
  context: GenerationContext,
  retrieval: RetrievalResult,
  instructions: { showPracticalSteps?: boolean; showDisclaimer?: boolean }
): GeneratedAnswer {
  const { articles, classification } = retrieval;
  const lines: string[] = [];
  const warnings: string[] = [];
  const citations = context.citations;

  // Direct answer from top articles
  if (articles.length > 0) {
    lines.push("## الجواب المباشر");
    lines.push("");

    const byLaw = new Map<string, ScoredArticle[]>();
    for (const sa of articles) {
      const key = sa.article.lawName;
      if (!byLaw.has(key)) byLaw.set(key, []);
      byLaw.get(key)!.push(sa);
    }

    const top = articles[0];
    const topText = top.article.articleText;
    const excerpt = topText.length > 300 ? topText.substring(0, 300) + "…" : topText;

    lines.push(`وفقاً لـ **${top.article.lawName}**، **المادة ${top.article.articleNumber}**:`);
    lines.push("");
    lines.push(`> ${excerpt}`);
    lines.push("");

    // All relevant articles grouped by law
    lines.push("### المواد القانونية المستخدمة");
    lines.push("");
    for (const [lawName, lawArticles] of byLaw) {
      lines.push(`**${lawName}** — ${lawArticles.length} مواد:`);
      for (const sa of lawArticles) {
        const a = sa.article;
        const t = a.articleText.length > 150 ? a.articleText.substring(0, 150) + "…" : a.articleText;
        lines.push(`- **المادة ${a.articleNumber}**: ${t}`);
      }
      lines.push("");
    }
  } else if (retrieval.matchedLaw) {
    lines.push(`## ${retrieval.matchedLaw.law.name}`);
    lines.push("");
    lines.push(`**${retrieval.matchedLaw.law.name}** — ${retrieval.matchedLaw.law.articles} مادة، آخر تحديث ${retrieval.matchedLaw.law.updated}.`);
    lines.push("لم يتم العثور على نصوص مواد محددة.");
  } else {
    lines.push("## الجواب المباشر");
    lines.push("");
    lines.push("عذراً، لم يتم العثور على معلومات كافية في قاعدة البيانات للإجابة على هذا السؤال.");
    lines.push("");
    lines.push("يقترح:");
    lines.push("1. إعادة صياغة السؤال بشكل أكثر تحديداً");
    lines.push("2. ذكر اسم القانون أو رقم المادة إن أمكن");
    lines.push("3. استشارة محامٍ للحصول على استشارة قانونية رسمية");
    lines.push("");
    warnings.push("لا توجد بيانات كافية");
  }

  // Practical steps
  if (instructions.showPracticalSteps && articles.length > 0) {
    lines.push("### الخطوات المقترحة");
    lines.push("");
    const steps = getSteps(retrieval.classification.type);
    for (let i = 0; i < steps.length; i++) {
      lines.push(`${i + 1}. ${steps[i]}`);
    }
    lines.push("");
  }

  // Sources
  if (articles.length > 0) {
    const lawNames = [...new Set(articles.map(sa => sa.article.lawName))];
    lines.push("---");
    lines.push(`*المصادر: ${lawNames.join("، ")} — الوقائع العراقية*`);
  }

  // Disclaimer
  if (instructions.showDisclaimer) {
    lines.push("");
    lines.push("*هذه المعلومات لأغراض إرشادية فقط ولا تعتبر استشارة قانونية ملزمة. يرجى استشارة محامٍ مؤهل.*");
  }

  // Confidence
  let confidence: number;
  if (articles.length >= 3) {
    confidence = 85;
  } else if (articles.length >= 1) {
    confidence = 65;
  } else if (retrieval.matchedLaw || retrieval.metadataMatches.length > 0) {
    confidence = 40;
  } else {
    confidence = 20;
  }

  const quality = confidence >= 70 ? "high" : confidence >= 40 ? "medium" : "low";

  return {
    answer: lines.join("\n"),
    quality,
    citations,
    answerSource: "rag",
    confidence,
    warnings,
  };
}

function getSteps(type: string): string[] {
  const all: Record<string, string[]> = {
    personal: ["اجمع المستندات المطلوبة (عقد الزواج، شهادات الميلاد)", "راجع المحكمة المختصة في محافظتك", "استشر محامياً متخصصاً بالأحوال الشخصية"],
    real_estate: ["تأكد من تسجيل العقار في الدائرة العقارية", "احضر المستندات الملكية", "راجع محامياً متخصصاً بالعقارات"],
    criminal: ["تواصل مع محامٍ فوراً", "لا تدلي باعتراف دون حضور محامٍ", "اجمع الأدلة الداعمة"],
    labor: ["احتفظ بصورة من عقد العمل", "سجّل ساعات العمل والإضافي", "راجع دائرة العمل والتوظيف"],
    civil: ["اجمع المستندات ذات الصلة", "راجع محامياً للصياغة القانونية", "تأكد من صحة العقد"],
    traffic: ["احضر محضر الحادث من المرور", "راجع الجهة المختصة", "تأكد من سلامة المستندات"],
    companies: ["تأكد من اكتمال مستندات التأسيس", "سجّل الشركة في السجل التجاري", "استشر محامياً"],
    investment: ["أعد دراسة الجدوى الاقتصادية", "تواصل مع الهيئة الوطنية للاستثمار", "راجع محامياً"],
  };
  return all[type] || ["حدد نوع القضية", "اجمع المستندات", "استشر متخصصاً قانونياً"];
}
