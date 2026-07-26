// ===== Iraqi Legal Assistant - Markdown Renderer =====
"use client";

import { useState } from "react";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

// === Simple Markdown Parser ===
function renderMarkdown(text: string): string {
  let html = text;

  // Escape HTML
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-muted rounded-xl p-4 overflow-x-auto"><code class="text-sm">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-accent hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => {
    return `<ul class="list-disc space-y-1 my-2">${match}</ul>`;
  });

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-r-4 border-accent pr-4 py-2 my-2 bg-muted/50 rounded-lg">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-4 border-border" />');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p class="mb-2">');
  html = html.replace(/\n/g, '<br />');

  // Wrap in paragraph
  html = `<p class="mb-2">${html}</p>`;

  return html;
}

// === Code Block with Copy ===
type CodeBlockProps = {
  code: string;
  language?: string;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl bg-muted overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">{language || "code"}</span>
        <button
          onClick={copyCode}
          className="text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          {copied ? "تم النسخ" : "نسخ"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  );
}
