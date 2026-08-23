"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheck, MapPin, Briefcase, Star, Trophy, Award, Filter, Users, TrendingUp, PenLine, FileText, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { lawyerSlug, type Lawyer } from "@/lib/data";
import { cn } from "@/lib/utils";

interface TopLawyer extends Lawyer {
  rank: number;
  plan: string;
  planAr: string;
  planColor: string;
}

// Blog-related writer badges
function WriterBadge({ points }: { points: number }) {
  if (points >= 100) return <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"><Sparkles className="h-2.5 w-2.5" /> كاتب متميز</span>;
  if (points >= 60) return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"><Award className="h-2.5 w-2.5" /> كاتب محترف</span>;
  if (points >= 30) return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"><PenLine className="h-2.5 w-2.5" /> كاتب نشط</span>;
  if (points >= 10) return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300"><FileText className="h-2.5 w-2.5" /> مساهم</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">محامي</span>;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-extrabold text-yellow-900 shadow">1</span>;
  if (rank === 2) return <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-extrabold text-gray-700">2</span>;
  if (rank === 3) return <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-400 text-sm font-extrabold text-orange-900">3</span>;
  return <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">{rank}</span>;
}

function LawyerRow({ lawyer }: { lawyer: TopLawyer }) {
  return (
    <Link
      href={`/lawyers/${lawyerSlug(lawyer)}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/30 hover:shadow-md"
    >
      <RankBadge rank={lawyer.rank} />

      <div className="relative shrink-0">
        {lawyer.photoUrl ? (
          <img src={lawyer.photoUrl} alt={lawyer.name} className="size-14 rounded-xl object-cover shadow-sm ring-2 ring-background" />
        ) : (
          <span className={cn("grid size-14 place-items-center rounded-xl bg-gradient-to-br text-lg font-extrabold text-white shadow-sm ring-2 ring-background", lawyer.hue)}>
            {lawyer.initials}
          </span>
        )}
        {lawyer.verified && (
          <span className="absolute -bottom-1 -left-1 grid size-5 place-items-center rounded-full bg-gold text-white shadow">
            <BadgeCheck className="size-3" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 text-right">
        <h3 className="text-sm font-bold group-hover:text-accent transition">{lawyer.name}</h3>
        <div className="mt-1 flex items-center justify-end gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="size-3" /> {lawyer.city}</span>
          <span className="flex items-center gap-1"><Briefcase className="size-3" /> {lawyer.specialization}</span>
          <span className="flex items-center gap-1"><Star className="size-3 text-amber-500" /> {lawyer.rating}</span>
          <span>{lawyer.experience} سنة</span>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-3">
        <WriterBadge points={lawyer.points || 0} />
        <div className="text-center">
          <p className="text-lg font-extrabold text-primary">{lawyer.points || 0}</p>
          <p className="text-[10px] text-muted-foreground">نقطة</p>
        </div>
      </div>
    </Link>
  );
}

export default function TopLawyersPage() {
  const [lawyers, setLawyers] = React.useState<TopLawyer[]>([]);
  const [selectedCity, setSelectedCity] = React.useState("all");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLawyers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/top-lawyers?city=${selectedCity}&limit=100`);
        if (res.ok) {
          const data = await res.json();
          setLawyers(data.lawyers);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchLawyers();
  }, [selectedCity]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent py-14 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_55%)]" />
        <div className="container relative text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Trophy className="size-8 text-gold" />
          </div>
          <h1 className="text-3xl font-extrabold md:text-4xl">أفضل 100 محامي في العراق</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
            تصنيف حصري يضم أفضل المحامين في العراق حسب النقاط والخبرة والتقييم
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Users className="size-4 text-gold" /> {lawyers.length} محامي
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <TrendingUp className="size-4 text-gold" /> تصنيف بالنقاط
            </span>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* City Filter */}
        <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
          <Filter className="size-4 shrink-0 text-muted-foreground" />
          {["all", "بغداد", "أربيل", "البصرة", "النجف", "كربلاء", "الموصل", "كركوك"].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                selectedCity === city ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {city === "all" ? "الكل" : city}
            </button>
          ))}
        </div>

        {/* Writer Badges Legend */}
        <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4">
          <h3 className="mb-3 text-sm font-bold">شارات الكاتب</h3>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">محامي (0-9)</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"><FileText className="h-3 w-3" /> مساهم (10-29)</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700"><PenLine className="h-3 w-3" /> كاتب نشط (30-59)</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"><Award className="h-3 w-3" /> كاتب محترف (60-99)</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700"><Sparkles className="h-3 w-3" /> كاتب متميز (100+)</span>
          </div>
        </div>

        {/* Lawyers List */}
        <h2 className="mb-4 text-lg font-bold">
          {selectedCity === "all" ? `أفضل 100 محامي في العراق` : `أفضل المحامين في ${selectedCity}`}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="flex animate-pulse items-center gap-4 p-4">
                <div className="size-8 rounded-full bg-muted" />
                <div className="size-14 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-48 rounded bg-muted" />
                </div>
              </Card>
            ))}
          </div>
        ) : lawyers.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <Trophy className="mb-4 size-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">لا يوجد محامون في هذا التصنيف بعد</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {lawyers.map((lawyer) => (
              <LawyerRow key={lawyer.id} lawyer={lawyer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}