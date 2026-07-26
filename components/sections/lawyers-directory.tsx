"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  MapPin,
  Briefcase,
  Star,
  Heart,
  SearchX,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Search,
} from "lucide-react";
import { SectionTitle, Card } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { lawyerSlug, type Lawyer } from "@/lib/data";
import { getAllLawyerProfiles } from "@/lib/lawyer-profiles";
import { cn, toArabicDigits } from "@/lib/utils";

type Sort = "rating" | "experience" | "price";

const PER_PAGE = 6;

function LawyerGridCard({ lawyer }: { lawyer: Lawyer }) {
  const [saved, setSaved] = React.useState(false);
  return (
    <Card className="card-hover flex h-full flex-col p-5">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <span
            className={cn(
              "grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-lg font-extrabold text-white",
              lawyer.hue
            )}
          >
            {lawyer.initials}
          </span>
          {lawyer.verified && (
            <span className="absolute -bottom-1 -left-1 grid size-5 place-items-center rounded-full bg-gold text-white">
              <BadgeCheck className="size-3.5" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-right">
          <h3 className="truncate font-bold">
            <a href={`/lawyers/${lawyerSlug(lawyer)}`} className="transition hover:text-accent">
              {lawyer.name}
            </a>
          </h3>
          <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {lawyer.city}
          </div>
          <div className="mt-0.5 flex items-center justify-end gap-1 text-xs text-muted-foreground">
            <Briefcase className="size-3" /> {lawyer.specialization}
          </div>
        </div>
        <button
          aria-label="حفظ"
          onClick={() => setSaved((s) => !s)}
          className="grid size-8 shrink-0 place-items-center rounded-lg border border-border transition hover:border-accent"
        >
          <Heart className={cn("size-4", saved ? "fill-gold text-gold" : "text-muted-foreground")} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-sm font-semibold text-gold">
        <Star className="size-4 fill-gold" /> {toArabicDigits(lawyer.rating.toFixed(1))}
        <span className="text-xs font-normal text-muted-foreground">({toArabicDigits(lawyer.reviews)} تقييم)</span>
        <span className="mr-2 text-xs font-normal text-muted-foreground">{toArabicDigits(lawyer.experience)} سنة</span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{lawyer.bio}</p>

      <div className="mt-auto flex gap-2 pt-4">
        <a
          href={`/lawyers/${lawyerSlug(lawyer)}`}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent"
        >
          عرض الملف
        </a>
        <a
          href={`/lawyers/${lawyerSlug(lawyer)}#booking`}
          className="inline-flex items-center justify-center rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
        >
          تواصل
        </a>
      </div>
    </Card>
  );
}

export function LawyersDirectory() {
  const [city, setCity] = React.useState("");
  const [spec, setSpec] = React.useState("");
  const [verified, setVerified] = React.useState(false);
  const [online, setOnline] = React.useState(false);
  const [sort, setSort] = React.useState<Sort>("rating");
  const [page, setPage] = React.useState(1);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [allLawyers] = React.useState<Lawyer[]>(getAllLawyerProfiles);

  const filtered = React.useMemo(() => {
    let list = allLawyers.filter((l) => {
      if (city && !l.city.includes(city)) return false;
      if (spec && !l.specialization.includes(spec)) return false;
      if (verified && !l.verified) return false;
      if (online && !l.online) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "experience") return b.experience - a.experience;
      return a.price - b.price;
    });
    return list;
  }, [city, spec, verified, online, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [city, spec, verified, online, sort]);

  const reset = () => {
    setCity("");
    setSpec("");
    setVerified(false);
    setOnline(false);
  };

  return (
    <section id="lawyers" className="scroll-mt-20 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="دليل المحامين"
          title="ابحث عن محامٍ متخصص"
          subtitle="صفِّ النتائج حسب المدينة والتخصص والخبرة والمزيد"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold">
                  <SlidersHorizontal className="size-4 text-accent" /> تصفية
                </span>
                <button
                  className="text-xs font-semibold text-accent lg:hidden"
                  onClick={() => setFiltersOpen((o) => !o)}
                >
                  {filtersOpen ? "إخفاء" : "عرض"}
                </button>
              </div>

              <div className={cn("space-y-5", !filtersOpen && "hidden lg:block")}>
                <FilterGroup label="المدينة">
                  <div className="relative">
                    <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="ابحث عن مدينة..."
                      className="h-10 w-full rounded-xl border border-border bg-muted/40 pe-9 ps-3 text-sm outline-none focus:border-accent"
                    />
                  </div>
                </FilterGroup>

                <FilterGroup label="التخصص">
                  <div className="relative">
                    <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={spec}
                      onChange={(e) => setSpec(e.target.value)}
                      placeholder="ابحث عن تخصص..."
                      className="h-10 w-full rounded-xl border border-border bg-muted/40 pe-9 ps-3 text-sm outline-none focus:border-accent"
                    />
                  </div>
                </FilterGroup>

                <FilterGroup label="الحالة">
                  <Toggle label="موثّق فقط" checked={verified} onChange={setVerified} />
                  <Toggle label="متصل الآن" checked={online} onChange={setOnline} />
                </FilterGroup>

                <FilterGroup label="ترتيب حسب">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent"
                  >
                    <option value="rating">الأعلى تقييماً</option>
                    <option value="experience">الأكثر خبرة</option>
                    <option value="price">الأقل سعراً</option>
                  </select>
                </FilterGroup>

                <button
                  onClick={reset}
                  className="w-full rounded-xl border border-border py-2 text-sm font-semibold text-muted-foreground transition hover:text-accent"
                >
                  إعادة تعيين
                </button>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div>
            <p className="mb-4 text-sm text-muted-foreground">
              عرض {toArabicDigits(filtered.length)} محامٍ
            </p>

            {pageItems.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center">
                <SearchX className="size-12 text-muted-foreground/50" />
                <p className="mt-4 font-bold">لا توجد نتائج مطابقة</p>
                <p className="mt-1 text-sm text-muted-foreground">جرّب تعديل عوامل التصفية</p>
                <button
                  onClick={reset}
                  className="mt-4 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white"
                >
                  إعادة تعيين التصفية
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((lawyer) => (
                  <LawyerGridCard key={lawyer.id} lawyer={lawyer} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  aria-label="السابق"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={current === 1}
                  className="grid size-9 place-items-center rounded-lg border border-border disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "grid size-9 place-items-center rounded-lg text-sm font-semibold transition",
                      current === i + 1
                        ? "bg-accent text-white"
                        : "border border-border hover:border-accent"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  aria-label="التالي"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={current === totalPages}
                  className="grid size-9 place-items-center rounded-lg border border-border disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-sm transition hover:border-accent"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition",
          checked ? "bg-accent" : "bg-muted-foreground/30"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white transition-all",
            checked ? "left-0.5" : "left-[18px]"
          )}
        />
      </span>
    </button>
  );
}
