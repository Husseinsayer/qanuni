import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Card } from "@/components/ui/card";
import { lawFirms } from "@/lib/data";
import { Building2, MapPin, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/json-ld";
import { AdBanner } from "@/components/ad-banner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مكاتب المحامين",
  description: "تصفح جميع مكاتب المحامين المعتمدة في العراق — بغداد، البصرة، أربيل، والموصل.",
  openGraph: {
    title: "مكاتب المحامين — منصة قانوني",
    description: "تصفح جميع مكاتب المحامين المعتمدة في العراق.",
    type: "website",
    locale: "ar_IQ",
    siteName: "منصة قانوني",
  },
  alternates: {
    canonical: "https://qanuni.iq/law-firms",
  },
};

export default function LawFirmsPage() {
  return (
    <>
      <JsonLd page="law-firms" context={{ count: lawFirms.length, firms: lawFirms }} />
      {/* Ad: أعلى المكاتب */}
      <AdBanner placementKey="law-firms-top" />
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {lawFirms.map((firm, i) => (
              <Reveal key={firm.id} delay={i * 0.05}>
                <Link href={`/law-firms/${firm.id}`}>
                  <Card className="card-hover flex h-full flex-col p-6">
                    <div className="flex items-start gap-4">
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
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-1.5 text-sm font-semibold text-accent">
                      <Users className="size-4" /> {firm.lawyers.length} محامٍ
                      <ArrowLeft className="size-4" />
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
