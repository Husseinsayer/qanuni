"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Quote, Star } from "lucide-react";
import { SectionTitle } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { useSiteData } from "@/lib/use-site-data";
import { cn } from "@/lib/utils";

const defaultTestimonials = [
  { id: "t1", name: "أحمد الراشد", role: "رائد أعمال", rating: 5, text: "وفرت عليّ المنصة أسابيع من البحث. وجدت محامياً متخصصاً في تأسيس الشركات خلال دقائق.", initials: "أر", hue: "from-blue-500 to-indigo-600" },
  { id: "t2", name: "منى الكعبي", role: "موظفة حكومية", rating: 5, text: "استشرت محامية في قضية حضانة وحصلت على إجابة دقيقة ومطمئنة في نفس اليوم.", initials: "مك", hue: "from-amber-500 to-orange-600" },
  { id: "t3", name: "كريم العبيدي", role: "تاجر", rating: 4, text: "مكتبة القوانين منظمة بشكل رائع. أستطيع الرجوع لأي مادة قانونية بسهولة وسرعة.", initials: "كع", hue: "from-emerald-500 to-teal-600" },
];

export function Testimonials() {
  const { testimonials: dbTestimonials } = useSiteData();
  const items = dbTestimonials.length > 0 ? dbTestimonials : defaultTestimonials;
  const [index, setIndex] = React.useState(0);
  const total = items.length;

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
                  {Array.from({ length: items[index]?.rating ?? 5 }).map((_, i) => (
                    <Star key={i} className="size-5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-5 text-center text-lg leading-relaxed md:text-xl">
                  &quot;{items[index]?.text}&quot;
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-full bg-gradient-to-br text-lg font-extrabold text-white",
                      items[index]?.hue
                    )}
                  >
                    {items[index]?.initials}
                  </span>
                  <div className="text-right">
                    <p className="font-bold">{items[index]?.name}</p>
                    <p className="text-sm text-muted-foreground">{items[index]?.role}</p>
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
                <ChevronLeft className="size-5" />
              </button>
              <div className="flex gap-2">
                {items.map((_, i) => (
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
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
