// ===== RAG Pipeline — Context Builder =====
// Takes retrieval results → builds structured context with citation tracking.
import type { RetrievalResult, GenerationContext, ContextFormat, CitationMap } from "../types";

function detectFormat(type: string): ContextFormat {
  switch (type) {
    case "law_metadata": return "metadata_table";
    case "article_content": return "article_quote";
    case "legal_rule": return "rule_evidence";
    case "procedure": return "procedure_steps";
    case "comparison": return "comparison_table";
    case "explanation": return "general";
    default: return "general";
  }
}

export function buildGenerationContext(retrieval: RetrievalResult): GenerationContext {
  const { classification, articles, matchedLaw, metadataMatches, knowledgeContext } = retrieval;
  const format = detectFormat(classification.type);
  const lines: string[] = [];
  const citations: CitationMap = {};
  let citeIndex = 0;

  lines.push("## المواد القانونية المسترجعة");
  lines.push("");

  // Matched law info
  if (matchedLaw) {
    lines.push(`### القانون: ${matchedLaw.law.name}`);
    lines.push(`- عدد المواد: ${matchedLaw.law.articles}`);
    lines.push(`- آخر تحديث: ${matchedLaw.law.updated}`);
    if (matchedLaw.law.source) lines.push(`- المصدر: ${matchedLaw.law.source}`);
    lines.push("");
  } else if (metadataMatches.length > 0) {
    lines.push(`### القوانين ذات الصلة:`);
    for (const m of metadataMatches.slice(0, 3)) {
      lines.push(`- ${m.law.name} (${m.law.articles} مادة)`);
    }
    lines.push("");
  }

  // Articles with citation tags
  if (articles.length > 0) {
    lines.push(`### المواد:`);
    lines.push("");
    for (const sa of articles.slice(0, 8)) {
      citeIndex++;
      const tag = `[${citeIndex}]`;
      const a = sa.article;
      citations[tag] = {
        articleNum: a.articleNumber,
        lawName: a.lawName,
        lawId: a.lawId,
        text: a.articleText,
      };
      lines.push(`${tag} **المادة ${a.articleNumber}** من ${a.lawName} (ثقة: ${sa.hybridScore}%)`);
      lines.push(`   ${a.articleText}`);
      if (sa.boostFactors.length > 0) {
        lines.push(`   *عوامل الترجيح: ${sa.boostFactors.join("، ")}*`);
      }
      lines.push("");
    }
  }

  // Knowledge context
  if (knowledgeContext) {
    lines.push(`### معلومات إضافية من مركز المعرفة:`);
    lines.push(knowledgeContext.length > 400 ? knowledgeContext.substring(0, 400) + "…" : knowledgeContext);
    lines.push("");
  }

  // No data note
  if (articles.length === 0 && !matchedLaw && metadataMatches.length === 0) {
    lines.push("لم يتم العثور على معلومات كافية في قاعدة البيانات.");
    lines.push("");
  }

  // Estimate tokens (rough: Arabic chars / 4)
  const fullText = lines.join("\n");
  const tokenEstimate = Math.ceil(fullText.length / 4);

  return {
    formattedContext: fullText,
    citations,
    tokenEstimate,
    format,
    hasSufficientData: articles.length > 0 || matchedLaw !== null,
  };
}
