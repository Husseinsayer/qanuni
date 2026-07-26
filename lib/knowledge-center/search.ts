// ===== Knowledge Center - Search Engine for AI Assistant =====

import {
  getKnowledgeData,
} from "./store";
import type {
  LegalProcedure,
  LegalTemplate,
  GovService,
  KnowledgeQA,
  LegalTerm,
  GovernmentBody,
  RequiredDocument,
  Keyword,
} from "./types";

// === Search Result Types ===
export type KnowledgeSearchResult = {
  type: "procedure" | "template" | "service" | "qa" | "term" | "government" | "document" | "keyword";
  id: string;
  title: string;
  content: string;
  score: number;
  category?: string;
  keywords?: string[];
};

// === Search Query ===
export type KnowledgeSearchQuery = {
  text: string;
  threshold?: number;
  limit?: number;
  types?: KnowledgeSearchResult["type"][];
  categories?: string[];
};

// === Helper: Extract words from text ===
function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// === Helper: Calculate relevance score ===
function calculateScore(text: string, queryWords: string[], exactMatch: boolean): number {
  const textLower = text.toLowerCase();
  let score = 0;

  // Exact phrase match (highest weight)
  if (exactMatch && textLower.includes(queryWords.join(" "))) {
    score += 100;
  }

  // Word matching
  const matchedWords = queryWords.filter((w) => textLower.includes(w));
  if (matchedWords.length > 0) {
    score += (matchedWords.length / queryWords.length) * 80;
  }

  return Math.min(score, 100);
}

// === Main Search Function ===
export function searchKnowledgeCenter(query: KnowledgeSearchQuery): KnowledgeSearchResult[] {
  const data = getKnowledgeData();
  const results: KnowledgeSearchResult[] = [];
  const queryWords = extractWords(query.text);
  const threshold = query.threshold ?? 30;
  const limit = query.limit ?? 20;
  const typeFilter = query.types;
  const categoryFilter = query.categories;

  if (queryWords.length === 0) return [];

  // 1. Search Procedures
  if (!typeFilter || typeFilter.includes("procedure")) {
    for (const proc of data.procedures) {
      if (proc.deletedAt || !proc.isActive) continue;
      if (categoryFilter && !categoryFilter.includes(proc.category)) continue;

      const searchText = [
        proc.name,
        proc.shortDescription,
        proc.detailedDescription,
        proc.steps.map((s) => s.title).join(" "),
        proc.requiredDocuments.join(" "),
        proc.conditions.join(" "),
        proc.competentAuthority,
        proc.keywords.join(" "),
      ].join(" ");

      const score = calculateScore(searchText, queryWords, true);
      if (score >= threshold) {
        results.push({
          type: "procedure",
          id: proc.id,
          title: proc.name,
          content: proc.shortDescription || proc.detailedDescription.substring(0, 200),
          score,
          category: proc.category,
          keywords: proc.keywords,
        });
      }
    }
  }

  // 2. Search Templates
  if (!typeFilter || typeFilter.includes("template")) {
    for (const tmpl of data.templates) {
      if (tmpl.deletedAt || !tmpl.isActive) continue;
      if (categoryFilter && !categoryFilter.includes(tmpl.category)) continue;

      const searchText = [
        tmpl.name,
        tmpl.description,
        tmpl.content,
        tmpl.keywords.join(" "),
      ].join(" ");

      const score = calculateScore(searchText, queryWords, true);
      if (score >= threshold) {
        results.push({
          type: "template",
          id: tmpl.id,
          title: tmpl.name,
          content: tmpl.description || tmpl.content.substring(0, 200),
          score,
          category: tmpl.category,
          keywords: tmpl.keywords,
        });
      }
    }
  }

  // 3. Search Services
  if (!typeFilter || typeFilter.includes("service")) {
    for (const svc of data.services) {
      if (svc.deletedAt || !svc.isActive) continue;
      if (categoryFilter && !categoryFilter.includes(svc.category)) continue;

      const searchText = [
        svc.name,
        svc.description,
        svc.governmentBody,
        svc.serviceType,
        svc.supportedGovernorates.join(" "),
      ].join(" ");

      const score = calculateScore(searchText, queryWords, true);
      if (score >= threshold) {
        results.push({
          type: "service",
          id: svc.id,
          title: svc.name,
          content: svc.description || `${svc.governmentBody} - ${svc.serviceType}`,
          score,
          category: svc.category,
        });
      }
    }
  }

  // 4. Search Q&A
  if (!typeFilter || typeFilter.includes("qa")) {
    for (const qa of data.qa) {
      if (qa.deletedAt || !qa.isActive) continue;
      if (categoryFilter && !categoryFilter.includes(qa.category)) continue;

      const searchText = [
        qa.question,
        qa.answer,
        qa.keywords.join(" "),
      ].join(" ");

      const score = calculateScore(searchText, queryWords, true);
      if (score >= threshold) {
        results.push({
          type: "qa",
          id: qa.id,
          title: qa.question,
          content: qa.answer.substring(0, 200),
          score,
          category: qa.category,
          keywords: qa.keywords,
        });
      }
    }
  }

  // 5. Search Terms (Books)
  if (!typeFilter || typeFilter.includes("term")) {
    for (const term of data.terms) {
      if (term.deletedAt || !term.isActive) continue;

      const searchText = [
        term.documentTitle,
        term.name,
        term.author,
        term.documentContent,
        term.simplifiedDefinition,
        term.legalDefinition,
        term.examples.join(" "),
        term.keywords.join(" "),
      ].join(" ");

      const score = calculateScore(searchText, queryWords, true);
      if (score >= threshold) {
        results.push({
          type: "term",
          id: term.id,
          title: term.documentTitle || term.name,
          content: term.documentContent
            ? term.documentContent.substring(0, 200)
            : (term.simplifiedDefinition || term.legalDefinition?.substring(0, 200) || ""),
          score,
          keywords: term.keywords,
        });
      }
    }
  }

  // 6. Search Government Bodies
  if (!typeFilter || typeFilter.includes("government")) {
    for (const gov of data.governments) {
      if (gov.deletedAt || !gov.isActive) continue;

      const searchText = [
        gov.name,
        gov.description,
        gov.jurisdiction,
        gov.address,
        gov.governorate,
      ].join(" ");

      const score = calculateScore(searchText, queryWords, true);
      if (score >= threshold) {
        results.push({
          type: "government",
          id: gov.id,
          title: gov.name,
          content: gov.description || `${gov.jurisdiction} - ${gov.governorate}`,
          score,
        });
      }
    }
  }

  // 7. Search Documents
  if (!typeFilter || typeFilter.includes("document")) {
    for (const doc of data.documents) {
      if (doc.deletedAt || !doc.isActive) continue;
      if (categoryFilter && !categoryFilter.includes(doc.category)) continue;

      const searchText = [doc.name, doc.description].join(" ");

      const score = calculateScore(searchText, queryWords, true);
      if (score >= threshold) {
        results.push({
          type: "document",
          id: doc.id,
          title: doc.name,
          content: doc.description,
          score,
          category: doc.category,
        });
      }
    }
  }

  // 8. Search Keywords
  if (!typeFilter || typeFilter.includes("keyword")) {
    for (const kw of data.keywords) {
      if (kw.deletedAt || !kw.isActive) continue;

      const score = calculateScore(kw.name, queryWords, true);
      if (score >= threshold) {
        results.push({
          type: "keyword",
          id: kw.id,
          title: kw.name,
          content: kw.notes || "",
          score,
          category: kw.category,
        });
      }
    }
  }

  // Sort by score (descending) and limit
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

// === Search by Specific Type ===
export function searchProcedures(text: string, limit = 10): LegalProcedure[] {
  const results = searchKnowledgeCenter({ text, types: ["procedure"], limit });
  const data = getKnowledgeData();
  return results
    .filter((r) => r.type === "procedure")
    .map((r) => data.procedures.find((p) => p.id === r.id))
    .filter((p): p is LegalProcedure => p !== undefined);
}

export function searchTemplates(text: string, limit = 10): LegalTemplate[] {
  const results = searchKnowledgeCenter({ text, types: ["template"], limit });
  const data = getKnowledgeData();
  return results
    .filter((r) => r.type === "template")
    .map((r) => data.templates.find((t) => t.id === r.id))
    .filter((t): t is LegalTemplate => t !== undefined);
}

export function searchQA(text: string, limit = 10): KnowledgeQA[] {
  const results = searchKnowledgeCenter({ text, types: ["qa"], limit });
  const data = getKnowledgeData();
  return results
    .filter((r) => r.type === "qa")
    .map((r) => data.qa.find((q) => q.id === r.id))
    .filter((q): q is KnowledgeQA => q !== undefined);
}

export function searchTerms(text: string, limit = 10): LegalTerm[] {
  const results = searchKnowledgeCenter({ text, types: ["term"], limit });
  const data = getKnowledgeData();
  return results
    .filter((r) => r.type === "term")
    .map((r) => data.terms.find((t) => t.id === r.id))
    .filter((t): t is LegalTerm => t !== undefined);
}

// === Get Context for AI Assistant ===
export function getKnowledgeContext(query: string): string {
  const results = searchKnowledgeCenter({ text: query, limit: 10 });

  if (results.length === 0) return "";

  const contextParts: string[] = ["\n\n## معلومات من مركز المعرفة القانونية:"];

  // Group by type
  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, KnowledgeSearchResult[]>);

  // Add procedures
  if (grouped.procedure) {
    contextParts.push("\n\n### الإجراءات القانونية:");
    for (const proc of grouped.procedure) {
      contextParts.push(`\n**${proc.title}**\n${proc.content}`);
    }
  }

  // Add Q&A
  if (grouped.qa) {
    contextParts.push("\n\n### الأسئلة الشائعة:");
    for (const qa of grouped.qa) {
      contextParts.push(`\n**س: ${qa.title}**\nج: ${qa.content}`);
    }
  }

  // Add terms
  if (grouped.term) {
    contextParts.push("\n\n### المصطلحات القانونية:");
    for (const term of grouped.term) {
      contextParts.push(`\n**${term.title}**: ${term.content}`);
    }
  }

  // Add documents
  if (grouped.document) {
    contextParts.push("\n\n### المستندات المطلوبة:");
    for (const doc of grouped.document) {
      contextParts.push(`\n- ${doc.title}`);
    }
  }

  return contextParts.join("\n");
}
