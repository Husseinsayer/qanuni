"use client";

import React, { useState, useMemo } from "react";
import { useSiteData } from "@/lib/use-site-data";
import { toArabicDigits } from "@/lib/utils";
import { Search, X, Scale, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { iconMap } from "@/lib/icons";
import { AdBanner } from "@/components/ad-banner";

const PAGE_SIZE = 12;

class LawsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-20 text-center">
          <p className="text-lg font-semibold text-foreground">حدث خطأ في تحميل القوانين</p>
          <p className="mt-2 text-muted-foreground">يرجى المحاولة مرة أخرى</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="mt-4 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90">
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function LawsPageContent() {
  return (
    <LawsErrorBoundary>
      <LawsContent />
    </LawsErrorBoundary>
  );
}

function LawsContent() {
  const { laws, isLoading, lawPageTabs, categories: dbCategories } = useSiteData();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [page, setPage] = useState(1);

  // Build category ID → name map from admin categories
  const catNameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of dbCategories) {
      m.set(c.id, c.name);
    }
    return m;
  }, [dbCategories]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tab of lawPageTabs) {
      if (tab.count !== undefined) {
        counts[tab.id] = tab.count;
      } else if (!tab.filterCategory) {
        counts[tab.id] = laws.length;
      } else {
        counts[tab.id] = laws.filter((l) => l.category === tab.filterCategory).length;
      }
    }
    return counts;
  }, [laws, lawPageTabs]);

  // Unique categories from laws with display names
  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    for (const law of laws) {
      if (law.category) {
        cats.set(law.category, (cats.get(law.category) || 0) + 1);
      }
    }
    return [...cats.entries()].map(([id, count]) => ({
      id,
      name: catNameMap.get(id) || id,
      count,
    }));
  }, [laws, catNameMap]);

  if (isLoading) {
    return (
      <div className="container py-16 text-center text-muted-foreground">جاري تحميل القوانين...</div>
    );
  }

  const activeTabConfig = lawPageTabs.find((t) => t.id === activeTab) || lawPageTabs[0];

  const filtered = laws
    .filter((law) => {
      const matchesSearch = !search.trim() || law.name.includes(search.trim());
      const matchesTab = !activeTabConfig?.filterCategory || law.category === activeTabConfig.filterCategory;
      const matchesCategory = !activeCategory || law.category === activeCategory;
      return matchesSearch && matchesTab && matchesCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  const handleTabChange = (id: string) => { setActiveTab(id); setPage(1); };
  const handleCategoryChange = (cat: string) => { setActiveCategory(activeCategory === cat ? "" : cat); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const statusColors: Record<string, string> = {
    "نافذ": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "معدل": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "ملغي": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <>
      {/* Ad: أعلى القوانين */}
      <AdBanner placementKey="laws-top" />

      <div className="container py-12">
        {/* Law Page Tabs — above search */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {lawPageTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "border-accent bg-accent text-white shadow-sm"
                    : "border-border bg-muted/50 text-muted-foreground hover:border-accent/50 hover:text-accent"
                }`}
              >
                {tab.name}
                <span className="text-[10px] opacity-70">({tabCounts[tab.id] || 0})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
            placeholder="بحث عن قانون..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => handleSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Categories — clickable */}
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map(({ id, name, count }) => (
              <button
                key={id}
                onClick={() => handleCategoryChange(id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  activeCategory === id
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-accent/50 hover:text-accent"
                }`}
              >
                {name} ({count})
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          عرض {toArabicDigits(filtered.length)} من {toArabicDigits(laws.length)} قانون
          {(activeTab !== "all" || activeCategory) && (
            <button
              onClick={() => { handleTabChange("all"); setActiveCategory(""); }}
              className="mr-2 text-accent hover:underline"
            >
              عرض الكل
            </button>
          )}
        </div>

        {/* Laws Grid */}
        {paged.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {search ? `لا توجد نتائج لـ "${search}"` : "لا توجد قوانين في هذا التصنيف"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {paged.map((law) => {
              let Icon = Scale;
              if (law.icon && iconMap[law.icon]) {
                Icon = iconMap[law.icon];
              } else if (law.icon && law.icon.startsWith("http")) {
                // Custom icon URL — render as img
                return (
                  <a key={law.id} href={`/laws/${law.id}`}>
                    <div className="card-hover group h-full rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md">
                      <div className="mb-4 grid size-12 place-items-center rounded-2xl overflow-hidden shadow-soft">
                        <img src={law.icon} alt={law.name} className="size-12 object-contain" />
                      </div>
                      <h3 className="text-lg font-bold transition group-hover:text-accent">{law.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {toArabicDigits(law.articles ?? 0)} مادة قانونية
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>آخر تحديث: {law.updated || "—"}</span>
                        {law.status && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[law.status] || ""}`}>
                            {law.status}
                          </span>
                        )}
                      </div>
                      {law.source && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/5 px-2.5 py-0.5 text-[10px] text-accent">
                          <FileText className="size-2.5" />
                          {law.source}
                        </div>
                      )}
                    </div>
                  </a>
                );
              }
              const color = law.color || "#1E3A8A";
              return (
                <a key={law.id} href={`/laws/${law.id}`}>
                  <div className="card-hover group h-full rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md">
                    <div
                      className="mb-4 grid size-12 place-items-center rounded-2xl text-white shadow-soft"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-lg font-bold transition group-hover:text-accent">{law.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {toArabicDigits(law.articles ?? 0)} مادة قانونية
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>آخر تحديث: {law.updated || "—"}</span>
                      {law.status && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[law.status] || ""}`}>
                          {law.status}
                        </span>
                      )}
                    </div>
                    {law.source && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/5 px-2.5 py-0.5 text-[10px] text-accent">
                        <FileText className="size-2.5" />
                        {law.source}
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Ad: داخل شبكة القوانين */}
        <AdBanner placementKey="laws-inline" />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="size-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-muted-foreground">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`grid size-9 place-items-center rounded-lg text-sm font-medium transition ${
                      page === p ? "bg-accent text-white" : "border border-border hover:bg-muted/60"
                    }`}
                  >
                    {toArabicDigits(p as number)}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
