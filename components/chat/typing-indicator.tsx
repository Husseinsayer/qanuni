// ===== Iraqi Legal Assistant - Typing Indicator =====
export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
        <span className="text-sm">🤖</span>
      </div>

      {/* Typing Animation */}
      <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    </div>
  );
}
