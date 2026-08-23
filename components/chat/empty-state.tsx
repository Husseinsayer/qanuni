// ===== Iraqi Legal Assistant - Empty State Component =====
"use client";

import { MessageSquare, Bot, Scale } from "lucide-react";

type EmptyStateProps = {
  type: "no_conversations" | "no_results" | "welcome" | "error";
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({ type, message, action }: EmptyStateProps) {
  const configs = {
    no_conversations: {
      icon: MessageSquare,
      title: "لا توجد محادثات سابقة",
      description: "ابدأ محادثة جديدة للحصول على استشارة قانونية",
      color: "text-muted-foreground",
    },
    no_results: {
      icon: MessageSquare,
      title: "لا توجد نتائج",
      description: message || "لم يتم العثور على نتائج مطابقة",
      color: "text-muted-foreground",
    },
    welcome: {
      icon: Bot,
      title: "مرحباً بك في المساعد القانوني الذكي",
      description: "يمكنني مساعدتك في فهم القوانين العراقية والحصول على إجابة قانونية",
      color: "text-accent",
    },
    error: {
      icon: Scale,
      title: "حدث خطأ",
      description: message || "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
      color: "text-red-500",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div
        className={`w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 ${config.color}`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">
        {config.description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// === Loading Skeleton ===
export function MessageSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="space-y-1">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

// === Typing Skeleton ===
export function TypingSkeleton() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm">
        🤖
      </div>
      <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.1s]" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    </div>
  );
}
