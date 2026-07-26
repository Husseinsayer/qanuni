"use client";

import * as React from "react";
import { BadgeCheck, MapPin, Briefcase, Star, CalendarCheck, MessageSquare, ArrowLeft, Megaphone } from "lucide-react";
import { SectionTitle, Card } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { lawyerSlug, type Lawyer } from "@/lib/data";
import { getAllLawyerProfiles, getPromotedLawyers } from "@/lib/lawyer-profiles";
import { cn, toArabicDigits } from "@/lib/utils";

function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  return (
    <Card className="card-hover flex h-full flex-col p-6">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <span
            className={cn(
              "grid size-16 place-items-center rounded-2xl bg-gradient-to-br text-xl font-extrabold text-white shadow-soft",
              lawyer.hue
            )}
          >
            {lawyer.initials}
          </span>
          {lawyer.verified && (
            <span className="absolute -bottom-1 -left-1 grid size-6 place-items-center rounded-full bg-gold text-white shadow">
              <BadgeCheck className="size-4" />
            </span>
          )}
          {lawyer.promoted && (
            <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-accent text-white shadow">
              <Megaphone className="size-3" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-right">
          <a href={`/lawyers/${lawyerSlug(lawyer)}`} className="hover:text-accent transition">
            <h3 className="truncate text-lg font-bold">{lawyer.name}</h3>
          </a>
          <div className="mt-1 flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {lawyer.city}
          </div>
          <div className="mt-1 flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
            <Briefcase className="size-3.5" /> {lawyer.specialization}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm">
        <span className="flex items-center gap-1 font-semibold text-gold">
          <Star className="size-4 fill-gold" /> {lawyer.rating.toFixed(1)}
          <span className="text-xs text-muted-foreground">({toArabicDigits(lawyer.reviews)})</span>
        </span>
        <span className="text-muted-foreground">{toArabicDigits(lawyer.experience)} سنة خبرة</span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span
          className={cn(
            "flex items-center gap-1.5 font-semibold",
            lawyer.online ? "text-success" : "text-muted-foreground"
          )}
        >
          <span className={cn("size-2 rounded-full", lawyer.online ? "bg-success" : "bg-muted-foreground/40")} />
          {lawyer.online ? "متصل الآن" : "غير متصل"}
        </span>
        <span className="font-bold text-foreground">{toArabicDigits(lawyer.price)} ألف د.ع / استشارة</span>
      </div>

      <div className="mt-5 flex gap-2">
          <a
            href={`/lawyers/${lawyerSlug(lawyer)}#booking`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
          >
            <CalendarCheck className="size-4" /> احجز استشارة
          </a>
        <a
          href={`/lawyers/${lawyerSlug(lawyer)}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:border-accent hover:text-accent"
        >
          <MessageSquare className="size-4" /> الملف
        </a>
      </div>
    </Card>
  );
}

export function FeaturedLawyers() {
  const [paused, setPaused] = React.useState(false);
  const [allLawyers] = React.useState<Lawyer[]>(() => {
    const promoted = getPromotedLawyers();
    const all = getAllLawyerProfiles();
    // Merge: promoted first, then others (deduplicate by id)
    const promotedIds = new Set(promoted.map((l) => l.id));
    const others = all.filter((l) => !promotedIds.has(l.id));
    return [...promoted, ...others];
  });

  // Duplicate the list so the CSS marquee loops seamlessly (track shifts -50%).
  const loop = allLawyers.length === 0 ? [] : [...allLawyers, ...allLawyers];

  return (
    <section className="scroll-mt-20 bg-muted/30 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="محامون موثوقون"
          title="محامونا المميزون"
          subtitle="نخبة من المحامين العراقيين المعتمدين جاهزون لخدمتك"
        />

        <Reveal className="mt-10">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={cn(
              "group relative overflow-hidden [mask-image:linear-gradient(to_left,transparent,black_4%,black_96%,transparent)]",
              paused && "marquee-paused"
            )}
          >
            <div className="marquee-track gap-5 pb-4">
              {loop.map((lawyer, i) => (
                <div key={`${lawyer.id}-${i}`} className="w-[300px] shrink-0 sm:w-[340px]">
                  <LawyerCard lawyer={lawyer} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-8 text-center">
          <a href="/lawyers" className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-6 py-3 text-sm font-bold text-accent transition hover:bg-accent/20">
            عرض جميع المحامين المميزين
            <ArrowLeft className="size-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
