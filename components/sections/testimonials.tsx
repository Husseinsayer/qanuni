"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Quote, Star } from "lucide-react";
import { SectionTitle } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { testimonials } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const [index, setIndex] = React.useState(0);
  const total = testimonials.length;

  const go = (dir: number) => setIndex((i) => (i + dir + total) % total);

  return (
    <section className="scroll-mt-20 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="آراء العملاء"
          title="ماذا يقول عملاؤنا"
          subtitle="تجارب حقيقية من مستخدمي المنصة"
        />

        <Reveal className="mt-12">
          <div className="relative mx-auto max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border border-border bg-card p-8 shadow-premium md:p-12"
              >
                <Quote className="size-10 text-accent/30" />
                <div className="mt-4 flex justify-center gap-1">
                  {Array.from({ length: testimonials[index].rating }).map((_, i) => (
                    <Star key={i} className="size-5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-5 text-center text-lg leading-relaxed md:text-xl">
                  “{testimonials[index].text}”
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-full bg-gradient-to-br text-lg font-extrabold text-white",
                      testimonials[index].hue
                    )}
                  >
                    {testimonials[index].initials}
                  </span>
                  <div className="text-right">
                    <p className="font-bold">{testimonials[index].name}</p>
                    <p className="text-sm text-muted-foreground">{testimonials[index].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                aria-label="السابق"
                onClick={() => go(-1)}
                className="grid size-11 place-items-center rounded-full border border-border transition hover:border-accent hover:text-accent"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`شهادة ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-2.5 rounded-full transition-all",
                      i === index ? "w-6 bg-accent" : "w-2.5 bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <button
                aria-label="التالي"
                onClick={() => go(1)}
                className="grid size-11 place-items-center rounded-full border border-border transition hover:border-accent hover:text-accent"
              >
                <ChevronLeft className="size-5" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
