// ===== Iraqi Legal Assistant - Law References =====
"use client";

import type { LawReference } from "@/lib/ai/types";
import { BookOpen, ExternalLink } from "lucide-react";
import { useState } from "react";

type LawReferencesProps = {
  references: LawReference[];
};

export function LawReferences({ references }: LawReferencesProps) {
  const [expanded, setExpanded] = useState(false);

  if (references.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
      >
        <BookOpen className="w-4 h-4" />
        <span>{references.length} مواد قانونية</span>
      </button>

      {expanded && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-background border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
          <div className="space-y-2">
            {references.map((ref, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    المادة {ref.articleNumber} - {ref.lawName}
                  </span>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {ref.articleText}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  الصلة: {Math.round(ref.relevance * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
