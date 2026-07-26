"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles } from "lucide-react";

export function FloatingAI() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <button
        aria-label="المساعد القانوني"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 grid size-14 place-items-center rounded-full gradient-primary text-white shadow-glow transition hover:scale-105"
      >
        <Bot className="size-6" />
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-gold text-[#1F2937]">
          <Sparkles className="size-3" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 left-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-3xl border border-border bg-card shadow-premium"
          >
            <div className="flex items-center justify-between bg-gradient-to-l from-secondary to-accent px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <Bot className="size-5" />
                <span className="font-bold">المساعد القانوني الذكي</span>
              </div>
              <button aria-label="إغلاق" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 p-5">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm">
                مرحباً! أنا مساعدك القانوني. اسألني عن أي قانون عراقي أو إجراء قانوني.
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm">
                مثال: ما هي شروط الحضانة في قانون الأحوال الشخصية؟
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-[#B45309] dark:text-gold w-fit">
                <Sparkles className="size-3" /> قريباً — قيد التطوير
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border p-3">
              <input
                disabled
                placeholder="اكتب سؤالك القانوني..."
                className="h-10 flex-1 rounded-xl bg-muted/50 px-3 text-sm outline-none placeholder:text-muted-foreground/70"
              />
              <span className="grid size-10 place-items-center rounded-xl bg-accent/40 text-white">
                <Send className="size-4" />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
