"use client";

import { useState } from "react";
import { BadgeCheck, BookOpen, CalendarDays, FileText, ArrowLeft, Scale, Search, X, Copy, Check } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { AdBanner } from "@/components/ad-banner";
import { useSiteData } from "@/lib/use-site-data";
import { toArabicDigits } from "@/lib/utils";

export function LawDetail({ id }: { id: string }) {
  const { laws, sampleArticles, isLoading } = useSiteData();
  const [search, setSearch] = useState("");
  const [copiedArticle, setCopiedArticle] = useState<number | null>(null);

  const copyArticle = (articleNum: number, articleText: string) => {
    const textToCopy = `المادة ${articleNum}\n${articleText}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedArticle(articleNum);
      setTimeout(() => setCopiedArticle(null), 2000);
    });
  };

  // Wait for data to load
  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">جاري تحميل بيانات القانون...</p>
      </div>
    );
  }

  const law = laws.find((l) => l.id === id);
  if (!law) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-semibold text-foreground">القانون غير موجود</p>
        <p className="mt-2 text-muted-foreground">عذراً، لم نتمكن من العثور على هذا القانون.</p>
        <a href="/laws" className="mt-4 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90">
          العودة إلى القوانين
        </a>
      </div>
    );
  }

  const Icon = law.icon;
  const articles = (sampleArticles[id] ?? []).sort((a, b) => a.num - b.num);

  const filtered = search.trim()
    ? articles.filter((a) => String(a.num).includes(search.trim()))
    : articles;

  return (
    <div className="container pb-20">
      <Card className="overflow-hidden">
        <div
          className="flex items-center gap-5 p-8 text-white"
          style={{ backgroundImage: `linear-gradient(135deg, ${law.color}, #1E3A8A)` }}
        >
          <span className="grid size-16 place-items-center rounded-2xl bg-white/15">
            <Icon className="size-8" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">{law.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/85">
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4" /> {toArabicDigits(law.articles)} مادة
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" /> آخر تحديث: {law.updated}
              </span>
              {law.source && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-xs">
                  <FileText className="size-3" /> المصدر: {law.source}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-10">
        <h3 className="mb-5 flex items-center gap-2 text-xl font-bold">
          <FileText className="size-5 text-accent" /> مواد القانون
        </h3>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
            placeholder="البحث برقم المادة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {search.trim() && (
          <p className="mb-3 text-sm text-muted-foreground">
            عرض {filtered.length} من {articles.length} مادة
          </p>
        )}

        <div className="space-y-4">
          {filtered.map((a, index) => (
            <div key={a.num}>
              <Card className="card-hover p-6">
                <div className="flex items-start gap-4">
                  <span className="grid min-w-[120px] shrink-0 place-items-center rounded-xl bg-accent/10 px-4 py-2.5 font-bold text-accent">
                    المادة {a.num}
                  </span>
                  <p className="flex-1 leading-relaxed text-foreground/90 pt-1">{a.text}</p>
                  <button
                    onClick={() => copyArticle(a.num, a.text)}
                    className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent/10 hover:text-accent"
                    title="نسخ المادة"
                  >
                    {copiedArticle === a.num ? (
                      <>
                        <Check className="size-3.5" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </Card>
              {(index + 1) % 15 === 0 && index < filtered.length - 1 && (
                <div className="my-6 flex justify-center">
                  <AdBanner size="leaderboard" placementKey={`law-${id}-after-${a.num}`} />
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">لا توجد نتائج لـ "{search}"</p>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-6">
        <div>
          <p className="font-bold">تحتاج استشارة حول هذا القانون؟</p>
          <p className="text-sm text-muted-foreground">تواصل مع محامٍ مختص لشرح تفاصيله وتطبيقاته.</p>
        </div>
        <a
          href="/lawyers"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
        >
          ابحث عن محام
          <ArrowLeft className="size-4" />
        </a>
      </div>
    </div>
  );
}
