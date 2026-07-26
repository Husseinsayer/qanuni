"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  q: string;
  a: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = React.useState<string | null>(items[0]?.q ?? null);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {items.map((item) => {
        const isOpen = open === item.q;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : item.q)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right transition-colors hover:bg-muted/40"
              aria-expanded={isOpen}
            >
              <span className="text-right text-base font-bold md:text-lg">{item.q}</span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-accent transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-right leading-relaxed text-muted-foreground">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
