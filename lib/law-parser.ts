import type { SampleArticle } from "@/lib/data";

/**
 * Parses raw law text into structured articles.
 * Detects article boundaries using various Iraqi legal formatting patterns:
 * - المادة 1, المادة (1), المادة 1.
 * - 1, 1., 1, (1), (1).
 * - Any number at start of line followed by text
 * 
 * All text between article markers belongs to that article.
 */
export function parseLawArticles(rawText: string): SampleArticle[] {
  if (!rawText.trim()) return [];

  const articles: SampleArticle[] = [];
  const lines = rawText.split("\n");
  
  let currentArticle: SampleArticle | null = null;
  let currentText: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Try to detect article number patterns
    const articleMatch = detectArticleNumber(trimmed);

    if (articleMatch !== null) {
      // Save previous article if exists
      if (currentArticle) {
        currentArticle.text = currentText.join("\n").trim();
        if (currentArticle.text) {
          articles.push(currentArticle);
        }
      }

      // Start new article
      currentArticle = {
        num: articleMatch,
        text: "",
      };
      
      // Remove the article number from the line and add remaining text
      const textAfterNumber = removeArticleNumber(trimmed, articleMatch);
      currentText = textAfterNumber ? [textAfterNumber] : [];
    } else if (currentArticle) {
      // Continue current article text
      currentText.push(trimmed);
    }
  }

  // Save last article
  if (currentArticle) {
    currentArticle.text = currentText.join("\n").trim();
    if (currentArticle.text) {
      articles.push(currentArticle);
    }
  }

  return articles;
}

/**
 * Detects if a line starts with an article number.
 * Returns the number if found, null otherwise.
 */
function detectArticleNumber(line: string): number | null {
  // Pattern 1: المادة 1 or المادة (1) or المادة 1.
  const madadPattern = /^المادة\s*\(?(\d+)\)?[.:،]?\s?/;
  const madadMatch = line.match(madadPattern);
  if (madadMatch) {
    return parseInt(madadMatch[1], 10);
  }

  // Pattern 2: (1) or (1). or (1),
  const parenPattern = /^\((\d+)\)[.:،]?\s?/;
  const parenMatch = line.match(parenPattern);
  if (parenMatch) {
    return parseInt(parenMatch[1], 10);
  }

  // Pattern 3: 1 or 1. or 1, at start of line
  const numPattern = /^(\d+)[.:،]?\s?/;
  const numMatch = line.match(numPattern);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }

  return null;
}

/**
 * Removes the article number prefix from a line.
 */
function removeArticleNumber(line: string, num: number): string {
  // Try all patterns and remove the matched prefix
  const patterns = [
    new RegExp(`^المادة\\s*\\(?${num}\\)?[.:،]?\\s?`),
    new RegExp(`^\\(${num}\\)[.:،]?\\s?`),
    new RegExp(`^${num}[.:،]?\\s?`),
  ];

  for (const pattern of patterns) {
    if (pattern.test(line)) {
      return line.replace(pattern, "").trim();
    }
  }

  return line;
}
