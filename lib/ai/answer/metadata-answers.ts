// ===== Iraqi Legal Assistant - Database Answer Engine =====
// PRIMARY answer generator: uses local law data (articles, metadata, knowledge center).
// AI is used ONLY as a fallback when DB data is insufficient.
import type { QuestionType, SearchResult, MetadataMatch } from "../types";

// === Answer type + quality ===
export type DBAnswer = {
  answer: string;
  quality: "high" | "medium" | "low";
  reason: string;
};

// ============================================================
// 1. LAW METADATA QUESTIONS (article count, dates, sources)
// ============================================================
export function answerLawMetadata(metadata: MetadataMatch, _questionType: QuestionType): DBAnswer {
  const { law } = metadata;
  const parts: string[] = [];

  parts.push(`## ${law.name}`);
  parts.push("");

  parts.push(`**اسم القانون:** ${law.name}`);
  parts.push(`**عدد المواد:** ${law.articles.toLocaleString("ar-IQ")} مادة`);
  parts.push(`**آخر تحديث:** ${law.updated}`);
  if (law.source) parts.push(`**المصدر:** ${law.source}`);
  parts.push("");
  parts.push(`قانون **${law.name}** يحتوي على **${law.articles.toLocaleString("ar-IQ")} مادة**،`);
  parts.push(`آخر تحديث له كان في ${law.updated}.`);
  parts.push("");
  parts.push(`---\n*المصدر: ${law.source || "الوقائع العراقية"}*`);

  return {
    answer: parts.join("\n"),
    quality: "high",
    reason: "بيانات القانون متوفرة بالكامل",
  };
}

// ============================================================
// 2. ARTICLE CONTENT QUESTIONS
// ============================================================
export function answerArticleContent(articles: SearchResult[], matchedLaw?: MetadataMatch | null): DBAnswer {
  if (articles.length === 0 && matchedLaw) {
    return {
      answer: `## نص المادة\n\nلم يتم العثور على نص المادة المطلوبة في **${matchedLaw.law.name}**. يتوفر في قاعدة البيانات ${matchedLaw.law.articles} مادة، لكن النصوص النموذجية المتاحة محدودة.\n\n---\n*يرجى الرجوع إلى المصدر الرسمي للاطلاع على النص الكامل.*`,
      quality: "medium",
      reason: "القانون معروف لكن النص غير متوفر",
    };
  }
  if (articles.length === 0) {
    return {
      answer: "## نص المادة\n\nلم يتم العثور على المادة المطلوبة في قاعدة البيانات.",
      quality: "low",
      reason: "لا توجد مواد مطابقة",
    };
  }

  const parts: string[] = [];
  parts.push(`## المواد القانونية ذات الصلة`);
  parts.push("");

  for (const article of articles) {
    parts.push(`### **المادة ${article.articleNumber}** من ${article.lawName}`);
    parts.push("");
    parts.push(article.articleText);
    parts.push("");
  }

  parts.push("---");
  parts.push(`*المصدر: ${articles[0].lawName} - ${articles[0].lawId === "civil" ? "الوقائع العراقية" : "الوقائع العراقية"}*`);

  return {
    answer: parts.join("\n"),
    quality: "high",
    reason: `تم العثور على ${articles.length} مواد مطابقة`,
  };
}
