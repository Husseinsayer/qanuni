// ===== Iraqi Legal Assistant - Share & Export =====
"use client";

import { useState } from "react";
import type { Conversation } from "@/lib/ai/types";
import { Download, Share2, Copy, Check, FileText, Image } from "lucide-react";

type ShareExportProps = {
  conversation: Conversation;
};

export function ShareExport({ conversation }: ShareExportProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // === Copy Conversation as Text ===
  const copyAsText = () => {
    const text = conversation.messages
      .map((msg) => {
        const role = msg.role === "user" ? "المستخدم" : "المساعد";
        return `${role}:\n${msg.content}\n`;
      })
      .join("\n---\n\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  // === Export as Markdown ===
  const exportAsMarkdown = () => {
    const md = `# ${conversation.title}

تاريخ: ${new Date(conversation.createdAt).toLocaleDateString("ar-IQ")}

---

${conversation.messages
  .map((msg) => {
    const role = msg.role === "user" ? "## المستخدم" : "## المساعد";
    return `${role}\n\n${msg.content}`;
  })
  .join("\n\n---\n\n")}`;

    downloadFile(`${conversation.title}.md`, md, "text/markdown");
    setShowMenu(false);
  };

  // === Export as JSON ===
  const exportAsJSON = () => {
    const json = JSON.stringify(conversation, null, 2);
    downloadFile(`${conversation.title}.json`, json, "application/json");
    setShowMenu(false);
  };

  // === Print Conversation ===
  const printConversation = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${conversation.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .message { margin: 20px 0; padding: 15px; border-radius: 10px; }
          .user { background: #1E3A8A; color: white; margin-left: 20%; }
          .assistant { background: #f3f4f6; margin-right: 20%; }
          .role { font-weight: bold; margin-bottom: 10px; }
          .content { white-space: pre-wrap; }
          h1 { text-align: center; color: #1E3A8A; }
        </style>
      </head>
      <body>
        <h1>${conversation.title}</h1>
        <p style="text-align: center; color: #666;">
          ${new Date(conversation.createdAt).toLocaleDateString("ar-IQ")}
        </p>
        ${conversation.messages
          .map(
            (msg) => `
          <div class="message ${msg.role}">
            <div class="role">${msg.role === "user" ? "المستخدم" : "المساعد"}</div>
            <div class="content">${msg.content}</div>
          </div>
        `
          )
          .join("")}
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    setShowMenu(false);
  };

  // === Helper: Download File ===
  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        title="مشاركة/تصدير"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-full mt-2 w-48 bg-background border border-border rounded-xl shadow-lg z-50 py-2">
            <button
              onClick={copyAsText}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "تم النسخ" : "نسخ كنص"}
            </button>
            <button
              onClick={exportAsMarkdown}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              <FileText className="w-4 h-4" />
              تصدير كـ Markdown
            </button>
            <button
              onClick={exportAsJSON}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" />
              تصدير كـ JSON
            </button>
            <hr className="my-2 border-border" />
            <button
              onClick={printConversation}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Image className="w-4 h-4" />
              طباعة
            </button>
          </div>
        </>
      )}
    </div>
  );
}
