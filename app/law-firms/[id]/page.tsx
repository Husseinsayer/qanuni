import { notFound } from "next/navigation";
import { Phone, Mail, MapPin, Building2, Users, ArrowLeft } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { lawFirms, type LawFirm } from "@/lib/data";
import { cn } from "@/lib/utils";
import { buildDescription, absoluteUrl } from "@/lib/seo";
import { getSeoDefaults } from "@/lib/seo-defaults";
import type { Metadata } from "next";

export function generateStaticParams() {
  return lawFirms.map((f) => ({ id: f.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const firm = lawFirms.find((f) => f.id === params.id);
  const seo = getSeoDefaults();
  const title = firm ? firm.name : "مكتب محاماة";
  const desc = firm
    ? buildDescription(`مكتب ${firm.name} — ${firm.city}. ${firm.lawyers.length} محامٍ.`, seo)
    : undefined;
  const url = absoluteUrl(`/law-firms/${params.id}`, seo);
  return {
    metadataBase: new URL(seo.meta.metadataBase),
    title,
    description: desc,
    alternates: { canonical: seo.canonical.auto ? url : undefined },
    openGraph: {
      title,
      description: desc,
      url,
      locale: seo.openGraph.ogLocale,
      type: "website",
      siteName: seo.openGraph.ogSiteName,
      images: seo.openGraph.facebookImage ? [{ url: seo.openGraph.facebookImage }] : undefined,
    },
    twitter: {
      card: seo.openGraph.twitterCard,
      title,
      description: desc,
      images: seo.openGraph.twitterImage ? [seo.openGraph.twitterImage] : undefined,
    },
    robots: seo.robots.global,
  };
}

function FirmDetail({ id }: { id: string }) {
  const firm = lawFirms.find((f) => f.id === id);
  if (!firm) notFound();

  return (
    <div className="container max-w-4xl pb-20">
      {/* Firm hero */}
      <Card className="overflow-hidden">
        <div
          className="flex items-center gap-5 p-8 text-white"
          style={{ backgroundImage: `linear-gradient(135deg, ${firm.hue.includes("blue") ? "#1E3A8A" : firm.hue.includes("amber") ? "#D97706" : firm.hue.includes("slate") ? "#334155" : "#7C3AED"}, #1E293B)` }}
        >
          <span className="grid size-16 place-items-center rounded-2xl bg-white/15">
            <Building2 className="size-8" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">{firm.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/85">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" /> {firm.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4" /> {firm.lawyers.length} محامٍ
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Address */}
      <div className="mt-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <MapPin className="size-5 text-accent" /> العنوان
        </h3>
        <Card className="p-6">
          <p className="text-base leading-relaxed text-foreground/90">{firm.address}</p>
        </Card>
      </div>

      {/* Contact */}
      <div className="mt-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Phone className="size-5 text-accent" /> أرقام التواصل
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {firm.phones.map((phone) => (
            <a
              key={phone}
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="flex items-center justify-end gap-3 rounded-2xl border border-border bg-card p-4 text-base font-semibold text-accent transition hover:border-accent hover:bg-accent/5"
            >
              <span dir="ltr">{phone}</span>
              <Phone className="size-5" />
            </a>
          ))}
        </div>
        {firm.email && (
          <a
            href={`mailto:${firm.email}`}
            className="mt-3 flex items-center justify-end gap-3 rounded-2xl border border-border bg-card p-4 text-base font-medium text-muted-foreground transition hover:border-accent hover:text-accent"
          >
            {firm.email}
            <Mail className="size-5" />
          </a>
        )}
      </div>

      {/* Lawyers */}
      <div className="mt-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Users className="size-5 text-accent" /> محامو المكتب
        </h3>
        <div className="space-y-3">
          {firm.lawyers.map((lw) => (
            <Card key={lw.name} className="card-hover p-5">
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-lg font-extrabold text-white shadow-soft",
                    lw.hue
                  )}
                >
                  {lw.name.replace(/^(أ\.|الأستاذ|المحامية|أ\.د\.)\s*/, "").charAt(0)}
                </span>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-lg font-bold">{lw.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{lw.specialization}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-6">
        <div>
          <p className="font-bold">تحتاج استشارة من أحد محامي هذا المكتب؟</p>
          <p className="text-sm text-muted-foreground">احجز موعداً مع محامٍ مختص الآن.</p>
        </div>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
        >
          احجز استشارة
          <ArrowLeft className="size-4" />
        </a>
      </div>
    </div>
  );
}

export default function LawFirmPage({ params }: { params: { id: string } }) {
  const firm = lawFirms.find((f) => f.id === params.id);
  return (
    <>
      <PageHeader
        eyebrow="مكاتب المحامين"
        title="تفاصيل المكتب"
        crumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "مكاتب المحامين", href: "/#law-firms" },
          { label: firm?.name ?? "المكتب" },
        ]}
      />
      <FirmDetail id={params.id} />
    </>
  );
}
