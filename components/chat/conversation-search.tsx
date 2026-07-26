// ===== Iraqi Legal Assistant - Conversation Search =====
"use client";

import { useState, useMemo } from "react";
import type { Conversation } from "@/lib/ai/types";
import { Search, X, MessageSquare, Calendar } from "lucide-react";

type ConversationSearchProps = {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
};

export function ConversationSearch({
  conversations,
  onSelect,
}: ConversationSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    return conversations
      .filter(
        (c) =>
          c.title.toLowerCase().includes(queryLower) ||
          c.messages.some((m) => m.content.toLowerCase().includes(queryLower))
      )
      .slice(0, 10)
      .map((conv) => {
        // Find matching snippet
        const matchingMessage = conv.messages.find((m) =>
          m.content.toLowerCase().includes(queryLower)
        );
        const snippet = matchingMessage
          ? getSnippet(matchingMessage.content, queryLower)
          : null;

        return { conv, snippet };
      });
  }, [conversations, query]);

  const getSnippet = (content: string, query: string): string => {
    const idx = content.toLowerCase().indexOf(query);
    if (idx === -1) return content.substring(0, 100);

    const start = Math.max(0, idx - 30);
    const end = Math.min(content.length, idx + query.length + 30);
    let snippet = content.substring(start, end);

    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet = snippet + "...";

    return snippet;
  };

  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return escapeHtml(text);

    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return escaped.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>');
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث في المحادثات..."
          className="w-full rounded-xl border border-border bg-background pr-10 pl-10 py-2 text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map(({ conv, snippet }) => (
            <button
              key={conv.id}
              onClick={() => {
                onSelect(conv);
                setQuery("");
              }}
              className="w-full text-right p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">{conv.title}</span>
              </div>
              {snippet && (
                <p
                  className="text-xs text-muted-foreground line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(snippet, query),
                  }}
                />
              )}
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(conv.updatedAt).toLocaleDateString("ar-IQ")}
              </div>
            </button>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
          لا توجد نتائج لـ "{query}"
        </div>
      )}
    </div>
  );
}
