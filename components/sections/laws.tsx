"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CalendarDays, Scale, Gavel, HeartHandshake, Users, Car, Building2, Landmark, Briefcase } from "lucide-react";
import { SectionTitle, Card } from "@/components/ui/card";
import { Reveal, fadeUp, staggerContainer } from "@/components/reveal";
import { useSiteData } from "@/lib/use-site-data";
import { toArabicDigits } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale, Gavel, HeartHandshake, Users, Car, Building2, Landmark, Briefcase,
};

export function LawsSection() {
  const { laws, isLoading } = useSiteData();
  
  if (isLoading) {
    return <div className="container py-16 text-center">جاري تحميل القوانين...</div>;
  }
  
  return (
    <section id="laws" className="scroll-mt-20 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="دليل القوانين"
          title="استكشف القوانين العراقية"
          subtitle="تصفح أحدث التشريعات النافذة مصنفة حسب المجال القانوني"
        />

        {laws.length === 0 ? (
          <p className="text-center text-muted-foreground">لا توجد قوانين متاحة حالياً</p>
        ) : (
          <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {laws.map((law) => {
            const Icon = iconMap[law.icon] || Scale;
            return (
              <motion.div key={law.id} variants={fadeUp}>
                <Card className="card-hover group h-full p-6">
                  <div
                    className="mb-4 grid size-12 place-items-center rounded-2xl text-white shadow-soft"
                    style={{ backgroundColor: law.color }}
                  >
                    <Icon className="size-6" />
                  </div>
                  <Link href={`/laws/${law.id}`} className="text-lg font-bold transition hover:text-accent">
                    {law.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {toArabicDigits(law.articles)} مادة قانونية
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    آخر تحديث: {law.updated}
                  </div>
                  <a
                    href={`/laws/${law.id}`}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition group-hover:border-accent group-hover:text-accent"
                  >
                    عرض القانون
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                  </a>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
        )}

        <Reveal className="mt-10 text-center">
          <a
            href="/laws"
            className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-6 py-3 text-sm font-bold text-accent transition hover:bg-accent/20"
          >
            <BookOpen className="size-4" /> عرض جميع القوانين
          </a>
        </Reveal>
      </div>
    </section>
  );
}
