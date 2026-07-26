"use client";

import { useState } from "react";
import { useSiteData } from "@/lib/use-site-data";
import { toArabicDigits } from "@/lib/utils";
import { Search, X, Scale, Car, Building2, Users, HeartHandshake, Briefcase, Landmark, FileText, type LucideIcon } from "lucide-react";

const categoryLabels: Record<string, string> = {
  civil: "القانون المدني",
  penal: "قانون العقوبات",
  personal: "قانون الأحوال الشخصية",
  labor: "قانون العمل",
  traffic: "قانون المرور",
  companies: "قانون الشركات",
  investment: "قانون الاستثمار",
  commercial: "القانون التجاري",
};

const iconMap: Record<string, LucideIcon> = {
  civil: Scale,
  penal: FileText,
  personal: HeartHandshake,
  labor: Users,
  traffic: Car,
  companies: Building2,
  investment: Landmark,
  commercial: Briefcase,
};

const categoryColors: Record<string, string> = {
  civil: "#1E3A8A",
  penal: "#0F172A",
  personal: "#F59E0B",
  labor: "#10B981",
  traffic: "#3B82F6",
  companies: "#1E3A8A",
  investment: "#F59E0B",
  commercial: "#3B82F6",
};

export default function LawsPage() {
  const { laws, isLoading } = useSiteData();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (isLoading) {
    return <div className="container py-16 text-center">جاري تحميل القوانين...</div>;
  }

  // Get unique categories from laws
  const categories = [...new Set(laws.map((l) => l.category).filter((c): c is string => !!c))];

  // Filter laws + sort alphabetically
  const filtered = laws
    .filter((law) => {
      const matchesSearch = !search.trim() || law.name.includes(search.trim());
      const matchesCategory = !activeCategory || law.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));

  // Count laws per category
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = laws.filter((l) => l.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8 text-right">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
          <Scale className="size-4" /> القوانين العراقية
        </span>
        <h1 className="text-3xl font-extrabold md:text-4xl">جميع القوانين العراقية</h1>
        <p className="mt-2 text-muted-foreground">تصفح أحدث التشريعات النافذة مصنفة حسب المجال القانوني.</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
          placeholder="بحث عن قانون..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
            !activeCategory
              ? "border-accent bg-accent text-white shadow-sm"
              : "border-border bg-muted/50 text-muted-foreground hover:border-accent/50 hover:text-accent"
          }`}
        >
          <span>الكل</span>
          <span className="text-[10px] opacity-70">({laws.length})</span>
        </button>

        {categories.map((cat) => {
          const Icon = iconMap[cat] || Scale;
          const color = categoryColors[cat] || "#1E3A8A";
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "border-accent bg-accent text-white shadow-sm"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-accent/50 hover:text-accent"
              }`}
            >
              {isActive ? (
                <Icon className="size-3" />
              ) : (
                <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
              )}
              <span>{categoryLabels[cat] || cat}</span>
              <span className="text-[10px] opacity-70">({categoryCounts[cat] || 0})</span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        عرض {filtered.length} من {laws.length} قانون
        {activeCategory && (
          <button onClick={() => setActiveCategory(null)} className="mr-2 text-accent hover:underline">
            مسح التصفية
          </button>
        )}
      </div>

      {/* Laws Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          {search ? `لا توجد نتائج لـ "${search}"` : "لا توجد قوانين في هذا التصنيف"}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((law) => {
            const Icon = iconMap[law.category || ""] || law.icon;
            const color = categoryColors[law.category || ""] || law.color;
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
                    {toArabicDigits(law.articles)} مادة قانونية
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    آخر تحديث: {law.updated}
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
    </div>
  );
}
