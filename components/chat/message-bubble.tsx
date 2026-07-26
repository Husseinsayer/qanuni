// ===== Iraqi Legal Assistant - Enhanced Message Bubble =====
"use client";

import type { Message } from "@/lib/ai/types";
import { Copy, Check, Bot, User, Clock } from "lucide-react";
import { useState } from "react";
import { MarkdownRenderer } from "./markdown-renderer";
import { Rating, QuickFeedback } from "./rating";

type MessageBubbleProps = {
  message: Message;
  isStreaming?: boolean;
  showRating?: boolean;
  onRate?: (messageId: string, rating: number, feedback?: string) => void;
  onFeedback?: (messageId: string, type: "helpful" | "not_helpful" | "report") => void;
};

export function MessageBubble({
  message,
  isStreaming,
  showRating = true,
  onRate,
  onFeedback,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("ar-IQ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
          isUser
            ? "bg-accent text-white"
            : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[85%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Role Label */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? "أنت" : "المساعد القانوني"}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "bg-accent text-white rounded-tr-sm"
              : "bg-muted border border-border rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          ) : (
            <div className="[&>*]:text-xs [&>*]:leading-relaxed">
              <MarkdownRenderer content={message.content} />
            </div>
          )}

          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-1" />
          )}
        </div>

        {/* Actions */}
        {!isUser && !isStreaming && (
          <div className="flex items-center gap-3 mt-2">
            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
              title="نسخ"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ</span>
                </>
              )}
            </button>

            {/* Rating */}
            {showRating && onRate && (
              <Rating
                messageId={message.id}
                onRate={(rating, feedback) => onRate(message.id, rating, feedback)}
              />
            )}

            {/* Quick Feedback */}
            {onFeedback && (
              <QuickFeedback
                messageId={message.id}
                onFeedback={(type) => onFeedback(message.id, type)}
              />
            )}
          </div>
        )}

        {/* Law References Indicator */}
        {message.lawReferences && message.lawReferences.length > 0 && !isUser && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              📚 {message.lawReferences.length} مواد قانونية
            </span>
          </div>
        )}

        {/* Confidence Indicator */}
        {message.confidence && !isUser && (
          <div className="flex items-center gap-1 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                message.confidence.level === "high"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : message.confidence.level === "medium"
                  ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              🎯 الثقة: {message.confidence.overall}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
