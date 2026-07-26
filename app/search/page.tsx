"use client";

import * as React from "react";
import { Search, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { lawyers, laws, articles, lawyerSlug } from "@/lib/data";
import { toArabicDigits } from "@/lib/utils";

type Tab = "all" | "lawyers" | "laws" | "articles";

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<Tab>("all");

  const q = query.trim().toLowerCase();

  const lawyerResults = React.useMemo(
    () =>
      q
        ? lawyers.filter(
            (l) =>
              l.name.includes(q) ||
              l.city.includes(q) ||
              l.specialization.includes(q)
          )
        : [],
    [q]
  );

  const lawResults = React.useMemo(
    () =>
      q
        ? laws.filter(
            (l) => l.name.includes(q) || l.id.includes(q)
          )
        : [],
    [q]
  );

  const articleResults = React.useMemo(
    () =>
      q
        ? articles.filter(
            (a) =>
              a.title.includes(q) ||
              a.excerpt.includes(q) ||
              a.author.includes(q)
          )
        : [],
    [q]
  );

  const allResults = tab === "lawyers" ? lawyerResults : tab === "laws" ? lawResults : tab === "articles" ? articleResults : [...lawyerResults, ...lawResults, ...articleResults];

  return (
    <>
      <PageHeader
        eyebrow="بحث"
        title="ابحث في المنصة"
        subtitle="ابحث عن محامين وقوانين ومقالات قانونية."
        crumbs={[{ label: "الرئيسية", href: "/" }, { label: "بحث" }]}
      >
        <div className="mt-4 rounded-2xl border border-border bg-card/80 p-3 shadow-premium backdrop-blur-xl">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب كلمة للبحث..."
              className="h-12 flex-1 rounded-xl bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>
      </PageHeader>

      <section className="container py-10">
        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {(["all", "lawyers", "laws", "articles"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t
                  ? "bg-accent text-white"
                  : "border border-border text-muted-foreground hover:border-accent hover:text-accent"
              }`}
            >
              {t === "all" ? "الكل" : t === "lawyers" ? "المحامون" : t === "laws" ? "القوانين" : "المقالات"}
              {t === "lawyers" && ` (${lawyerResults.length})`}
              {t === "laws" && ` (${lawResults.length})`}
              {t === "articles" && ` (${articleResults.length})`}
            </button>
          ))}
        </div>

        {/* Results */}
        {!q ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <Search className="size-12 text-muted-foreground/50" />
            <p className="mt-4 font-bold">ابدأ بالكتابة للبحث</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ابحث عن أسماء المحامين أو القوانين أو المقالات
            </p>
          </div>
        ) : allResults.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="font-bold">لا توجد نتائج لـ &quot;{query}&quot;</p>
            <p className="mt-1 text-sm text-muted-foreground">جرّب كلمات مختلفة</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(tab === "all" || tab === "lawyers") &&
              lawyerResults.map((l) => (
                <a key={l.id} href={`/lawyers/${lawyerSlug(l)}`}>
                  <Card className="card-hover p-5">
                    <p className="text-xs text-accent font-semibold mb-2">محامٍ</p>
                    <h3 className="font-bold">{l.name}</h3>
                    <p className="text-sm text-muted-foreground">{l.specialization} — {l.city}</p>
                  </Card>
                </a>
              ))}
            {(tab === "all" || tab === "laws") &&
              lawResults.map((l) => (
                <a key={l.id} href={`/laws/${l.id}`}>
                  <Card className="card-hover p-5">
                    <p className="text-xs text-accent font-semibold mb-2">قانون</p>
                    <h3 className="font-bold">{l.name}</h3>
                    <p className="text-sm text-muted-foreground">{toArabicDigits(l.articles)} مادة</p>
                  </Card>
                </a>
              ))}
            {(tab === "all" || tab === "articles") &&
              articleResults.map((a) => (
                <a key={a.id} href={`/blog/${a.id}`}>
                  <Card className="card-hover p-5">
                    <p className="text-xs text-accent font-semibold mb-2">مقال</p>
                    <h3 className="font-bold line-clamp-2">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.author}</p>
                  </Card>
                </a>
              ))}
          </div>
        )}
      </section>
    </>
  );
}
