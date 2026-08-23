"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, FileText, ArrowLeft, Scale, Gavel, HeartHandshake, Users, Car, Building2, Landmark, Briefcase, Search, ChevronDown, ChevronUp, Copy, Share2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSiteData } from "@/lib/use-site-data";
import { toArabicDigits } from "@/lib/utils";
import { useState, useMemo } from "react";
import { AdBanner } from "@/components/ad-banner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale, Gavel, HeartHandshake, Users, Car, Building2, Landmark, Briefcase,
};

const ITEMS_PER_PAGE = 50;

export function LawDetail({ id }: { id: string }) {
  const { laws, lawArticles, isLoading } = useSiteData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ALL hooks must be declared before any early return
  const law = laws.find((l) => l.id === id);

  const allArticles = useMemo(
    () => lawArticles.filter((a) => a.lawId === id).sort((a, b) => a.number - b.number),
    [lawArticles, id]
  );

  const filteredArticles = useMemo(() => {
    if (!search.trim()) return allArticles;
    const q = search.trim();
    return allArticles.filter((a) => a.text.includes(q) || String(a.number).includes(q));
  }, [allArticles, search]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const pagedArticles = filteredArticles.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Wait for data to load
  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">جاري تحميل بيانات القانون...</p>
      </div>
    );
  }

  if (!law) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-semibold text-foreground">القانون غير موجود</p>
        <p className="mt-2 text-muted-foreground">عذراً، لم نتمكن من العثور على هذا القانون.</p>
        <Link href="/laws" className="mt-4 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90">
          العودة إلى القوانين
        </Link>
      </div>
    );
  }

  const Icon = iconMap[law.icon] || Scale;

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

      {/* Articles Section */}
      {allArticles.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 text-xl font-bold">مواد القانون</h3>

          {/* Search within articles */}
          <div className="relative mb-6">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
              placeholder="بحث في مواد القانون..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="mb-4 text-sm text-muted-foreground">
            عرض {toArabicDigits(filteredArticles.length)} من {toArabicDigits(allArticles.length)} مادة
          </div>

          {/* Articles list */}
          <div className="space-y-3">
            {pagedArticles.map((article, idx) => {
              const absIdx = (page - 1) * ITEMS_PER_PAGE + idx;
              const showAd = (absIdx + 1) % 15 === 0 && absIdx < filteredArticles.length - 1;
              return (
                <div key={article.id}>
                  <div className="rounded-xl border border-border bg-card p-4 transition hover:shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-accent mb-1">المادة {toArabicDigits(article.number)}</p>
                        <p className="text-sm leading-relaxed text-foreground">{article.text}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`المادة ${article.number}: ${article.text}`);
                            setCopiedId(article.id);
                            setTimeout(() => setCopiedId(null), 1500);
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          title="نسخ النص"
                        >
                          {copiedId === article.id ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ title: `المادة ${article.number}`, text: article.text });
                            } else {
                              navigator.clipboard.writeText(`المادة ${article.number}: ${article.text}`);
                              setCopiedId(article.id);
                              setTimeout(() => setCopiedId(null), 1500);
                            }
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          title="مشاركة"
                        >
                          <Share2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {showAd && <AdBanner placementKey="law-detail-mid" />}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-40 hover:bg-muted"
              >
                <ChevronUp className="size-4 rotate-90" />
              </button>
              <span className="px-3 text-sm text-muted-foreground">
                صفحة {toArabicDigits(page)} من {toArabicDigits(totalPages)}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-40 hover:bg-muted"
              >
                <ChevronDown className="size-4 rotate-90" />
              </button>
            </div>
          )}

          {pagedArticles.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              {search ? `لا توجد نتائج لـ "${search}"` : "لا توجد مواد قانونية مسجلة لهذا القانون"}
            </div>
          )}
        </div>
      )}

      {allArticles.length === 0 && (
        <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-6 text-center">
          <p className="text-muted-foreground">لم تُسجَّل مواد قانونية لهذا القانون بعد.</p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-6">
        <div>
          <p className="font-bold">تحتاج استشارة حول هذا القانون؟</p>
          <p className="text-sm text-muted-foreground">تواصل مع محامٍ مختص لشرح تفاصيله وتطبيقاته.</p>
        </div>
        <Link
          href="/lawyers"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
        >
          ابحث عن محام
          <ArrowLeft className="size-4" />
        </Link>
      </div>
    </div>
  );
}
