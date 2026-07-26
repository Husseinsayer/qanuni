"use client";

import * as React from "react";
import { ArrowLeft, Clock, UserRound } from "lucide-react";
import { SectionTitle, Card, Badge } from "@/components/ui/card";
import { Reveal, fadeUp, staggerContainer } from "@/components/reveal";
import { articles } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AdBanner } from "@/components/ad-banner";

const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export function BlogSection() {
  return (
    <section id="blog" className="scroll-mt-20 bg-muted/30 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="المدونة القانونية"
          title="أحدث المقالات والمستجدات"
          subtitle="مقالات متخصصة يكتبها محامونا حول القانون العراقي"
        />

        <div
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          // stagger via Reveal wrapper below
        >
          {articles.map((a, i) => (
            <React.Fragment key={a.id}>
              <Reveal delay={i * 0.05}>
                <Card className="card-hover group h-full overflow-hidden">
                  <div className={cn("relative h-40 bg-gradient-to-br", a.hue)}>
                    <div className="absolute inset-0 grid place-items-center opacity-30">
                      <span className="text-6xl font-black text-white/70">Ⓐ</span>
                    </div>
                    <Badge className="absolute right-3 top-3 bg-white/90 text-foreground">
                      {a.category}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" /> {a.readingTime} دقيقة قراءة
                      </span>
                      <span>{formatDate(a.date)}</span>
                    </div>
                    <a href={`/blog/${a.id}`}>
                      <h3 className="line-clamp-2 text-base font-bold leading-snug group-hover:text-accent">
                        {a.title}
                      </h3>
                    </a>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                      <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-bold">
                        <UserRound className="size-4" />
                      </span>
                      <span className="text-xs font-medium">{a.author}</span>
                    </div>
                    <a
                      href={`/blog/${a.id}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent"
                    >
                      اقرأ المزيد
                      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                    </a>
                  </div>
                </Card>
              </Reveal>
              {i === 1 && (
                <div className="col-span-full">
                  <AdBanner size="rectangle" placementKey="in-article-2" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-6 py-3 text-sm font-bold text-accent transition hover:bg-accent/20"
          >
            عرض جميع المقالات
          </a>
        </Reveal>
      </div>
    </section>
  );
}
