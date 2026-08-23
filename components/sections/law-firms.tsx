"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Building2, ArrowLeft } from "lucide-react";
import { SectionTitle, Card } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { useSiteData } from "@/lib/use-site-data";
import { cn } from "@/lib/utils";

type LawFirmItem = {
  id: string;
  name: string;
  city: string;
  address: string;
  hue: string;
};

function FirmCard({ firm }: { firm: LawFirmItem }) {
  return (
    <Card className="card-hover flex h-full flex-col p-6">
      <Link href={`/law-firms/${firm.id}`} className="flex items-start gap-4">
        <span
          className={cn(
            "grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
            firm.hue
          )}
        >
          <Building2 className="size-7" />
        </span>
        <div className="min-w-0 flex-1 text-right">
          <h3 className="text-lg font-bold text-foreground transition hover:text-accent">{firm.name}</h3>
          <div className="mt-1 flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {firm.city}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{firm.address}</p>
        </div>
      </Link>

      <div className="mt-auto pt-6">
        <Link
          href={`/law-firms/${firm.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/20"
        >
          تفاصيل المكتب
          <ArrowLeft className="size-4" />
        </Link>
      </div>
    </Card>
  );
}

export function LawFirms() {
  const [paused, setPaused] = React.useState(false);
  const { lawFirms, isLoading } = useSiteData();

  if (isLoading) {
    return <div className="container py-16 text-center">جاري تحميل مكاتب المحامين...</div>;
  }

  if (lawFirms.length === 0) {
    return null;
  }

  const loop = [...lawFirms, ...lawFirms];

  return (
    <section id="law-firms" className="scroll-mt-20 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="مكاتب المحامين"
          title="مكاتب محامين موثوقة"
          subtitle="تصفّح مكاتب المحامين وأرقام التواصل المباشرة ومحامي كل مكتب"
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
              {loop.map((firm, i) => (
                <div key={`${firm.id}-${i}`} className="w-[300px] shrink-0 sm:w-[340px]">
                  <FirmCard firm={firm} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
