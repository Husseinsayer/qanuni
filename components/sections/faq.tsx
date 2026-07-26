"use client";

import { MessageSquare } from "lucide-react";
import { SectionTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { faqs } from "@/lib/data";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 bg-muted/30 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="الأسئلة الشائعة"
          title="أسئلة شائعة"
          subtitle="إجابات سريعة عن استخدام المنصة"
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
          <Reveal>
            <Accordion items={faqs} />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col justify-center rounded-2xl gradient-primary p-8 text-white shadow-premium">
              <MessageSquare className="size-10 text-gold" />
              <h3 className="mt-4 text-xl font-bold">استشارتك تهمنا</h3>
              <p className="mt-2 text-sm text-white/80">
                يمكنك تصفّح دليل المحامين المتميزين مباشرة والوصول إلى مكاتبهم وأرقام التواصل من صفحة المكاتب.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
