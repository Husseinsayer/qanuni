// ===== RAG Pipeline — Retriever =====
// Unified retrieval layer: wraps search functions, adds hybrid scoring.
import type { CaseType, RetrievalResult, ScoredArticle, SearchResult } from "../types";
import { enhancedSearch } from "./search";

export function retrieve(
  text: string,
  caseType: CaseType,
  options?: { limit?: number; threshold?: number }
): RetrievalResult {
  const search = enhancedSearch(text, caseType, options);
  const { classification, articles, matchedLaw, metadataMatches, knowledgeContext } = search;

  // Convert articles to ScoredArticle[] with hybrid scoring
  const scored: ScoredArticle[] = articles.map((a: SearchResult) => {
    const boosts: string[] = [];
    let hybridScore = a.score;

    // Boost: article from correctly-identified law
    if (classification.lawId && a.lawId === classification.lawId) {
      hybridScore += 15;
      boosts.push("law_match");
    }

    // Boost: exact article number matches query
    if (classification.articleNum && a.articleNumber === classification.articleNum) {
      hybridScore += 25;
      boosts.push("exact_article");
    }

    // Boost: multiple match fields
    if (a.matchType === "hybrid" || a.matchType === "exact") {
      hybridScore += 5;
      boosts.push("match_type_" + a.matchType);
    }

    return {
      article: a,
      hybridScore: Math.min(hybridScore, 100),
      boostFactors: boosts,
    };
  });

  // Sort by hybridScore desc
  scored.sort((a, b) => b.hybridScore - a.hybridScore);

  return {
    classification,
    articles: scored,
    matchedLaw,
    metadataMatches,
    knowledgeContext,
    retrievalMetadata: {
      totalArticlesFound: scored.length,
      topScore: scored.length > 0 ? scored[0].hybridScore : 0,
      queryType: classification.type,
    },
  };
}
