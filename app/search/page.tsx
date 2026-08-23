"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AdBanner } from "@/components/ad-banner";
import { Card } from "@/components/ui/card";
import { lawyers as staticLawyers, laws as staticLaws, articles as staticArticles, lawyerSlug, type Law, type Article, type Lawyer } from "@/lib/data";
import { useSiteData } from "@/lib/use-site-data";
import { toArabicDigits } from "@/lib/utils";

type Tab = "all" | "lawyers" | "laws" | "articles";

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<Tab>("all");
  const { lawyers: apiLawyers, laws: apiLaws, articles: apiArticles } = useSiteData();

  // Merge live DB data with static fallback (dedupe by id), cast API rows to static shapes
  const lawyers = React.useMemo<Lawyer[]>(() => {
    const map = new Map<string, Lawyer>();
    staticLawyers.forEach((l) => map.set(l.id, l));
    apiLawyers.forEach((l) => map.set(l.id, l as Lawyer));
    return Array.from(map.values());
  }, [apiLawyers]);

  const laws = React.useMemo<Law[]>(() => {
    const map = new Map<string, Law>();
    staticLaws.forEach((l) => map.set(l.id, l));
    apiLaws.forEach((l) => map.set(l.id, l as unknown as Law));
    return Array.from(map.values());
  }, [apiLaws]);

  const articles = React.useMemo<Article[]>(() => {
    const map = new Map<string, Article>();
    staticArticles.forEach((a) => map.set(a.id, a));
    apiArticles.forEach((a) => map.set(a.id, a as unknown as Article));
    return Array.from(map.values());
  }, [apiArticles]);

  const q = query.trim().toLowerCase();

  const lawyerResults = React.useMemo(
    () =>
      q
        ? lawyers.filter(
            (l) =>
              l.name.toLowerCase().includes(q) ||
              l.city.toLowerCase().includes(q) ||
              l.specialization.toLowerCase().includes(q)
          )
        : [],
    [q, lawyers]
  );

  const lawResults = React.useMemo(
    () =>
      q
        ? laws.filter(
            (l) => l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q)
          )
        : [],
    [q, laws]
  );

  const articleResults = React.useMemo(
    () =>
      q
        ? articles.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.excerpt.toLowerCase().includes(q) ||
              a.author.toLowerCase().includes(q)
          )
        : [],
    [q, articles]
  );

  const allResults = tab === "lawyers" ? lawyerResults : tab === "laws" ? lawResults : tab === "articles" ? articleResults : [...lawyerResults, ...lawResults, ...articleResults];

  return (
    <>
      <section className="container py-10">
        {/* Search input */}
        <div className="relative mb-6">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-border bg-muted/40 pr-11 pl-4 h-12 text-sm outline-none focus:border-accent"
            placeholder="ابحث عن محامٍ أو قانون أو مقال..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

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

        {/* Ad: أعلى البحث */}
        <AdBanner placementKey="search-top" />

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
                <Link key={l.id} href={`/lawyers/${lawyerSlug(l)}`}>
                  <Card className="card-hover p-5">
                    <p className="text-xs text-accent font-semibold mb-2">محامٍ</p>
                    <h3 className="font-bold">{l.name}</h3>
                    <p className="text-sm text-muted-foreground">{l.specialization} — {l.city}</p>
                  </Card>
                </Link>
              ))}
            {(tab === "all" || tab === "laws") &&
              lawResults.map((l) => (
                <Link key={l.id} href={`/laws/${l.id}`}>
                  <Card className="card-hover p-5">
                    <p className="text-xs text-accent font-semibold mb-2">قانون</p>
                    <h3 className="font-bold">{l.name}</h3>
                    <p className="text-sm text-muted-foreground">{toArabicDigits(l.articles)} مادة</p>
                  </Card>
                </Link>
              ))}
            {(tab === "all" || tab === "articles") &&
              articleResults.map((a) => (
                <Link key={a.id} href={`/blog/${a.id}`}>
                  <Card className="card-hover p-5">
                    <p className="text-xs text-accent font-semibold mb-2">مقال</p>
                    <h3 className="font-bold line-clamp-2">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.author}</p>
                  </Card>
                </Link>
              ))}
          </div>
        )}
      </section>
    </>
  );
}
