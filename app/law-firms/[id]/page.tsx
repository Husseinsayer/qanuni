import { notFound } from "next/navigation";
import { Phone, Mail, MapPin, Building2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { buildDescription, absoluteUrl } from "@/lib/seo";
import { getSeoDefaults } from "@/lib/seo-defaults";
import { JsonLd } from "@/components/json-ld";
import { AdBanner } from "@/components/ad-banner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const firms = await prisma.lawFirm.findMany({ select: { id: true } });
  return firms.map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const firm = await prisma.lawFirm.findUnique({ where: { id: params.id } });
  const seo = getSeoDefaults();
  const title = firm ? firm.name : "مكتب محاماة";
  const desc = firm
    ? buildDescription(`مكتب ${firm.name} — ${firm.city}.`, seo)
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

async function FirmDetail({ id }: { id: string }) {
  const firm = await prisma.lawFirm.findUnique({
    where: { id },
    include: { members: { include: { lawyer: true } } },
  });
  if (!firm) notFound();
  const seo = getSeoDefaults();

  const memberCount = firm.members.length;

  return (
    <div className="container max-w-4xl pb-20">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "LegalService",
        name: firm.name,
        description: `مكتب ${firm.name} — ${firm.city}`,
        url: absoluteUrl(`/law-firms/${firm.id}`, seo),
        address: { "@type": "PostalAddress", addressLocality: firm.city, addressCountry: "IQ" },
        telephone: firm.phones ? JSON.parse(firm.phones)[0] : undefined,
        email: firm.email || undefined,
      }} />
      {/* Ad: الشريط الجانبي للمكتب */}
      <div className="container py-6">
        <AdBanner placementKey="law-firm-sidebar" />
      </div>
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
                <Users className="size-4" /> {memberCount} محامٍ
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
          {(() => {
            let phones: string[] = [];
            try { phones = JSON.parse(firm.phones); } catch { phones = []; }
            return phones.map((phone: string) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center justify-end gap-3 rounded-2xl border border-border bg-card p-4 text-base font-semibold text-accent transition hover:border-accent hover:bg-accent/5"
              >
                <span dir="ltr">{phone}</span>
                <Phone className="size-5" />
              </a>
            ));
          })()}
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
          {firm.members.map((m) => (
            <Card key={m.lawyerId} className="card-hover p-5">
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-lg font-extrabold text-white shadow-soft",
                    m.lawyer.hue
                  )}
                >
                  {m.lawyer.initials || m.lawyer.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-lg font-bold">{m.lawyer.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{m.lawyer.specialization}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function LawFirmPage({ params }: { params: { id: string } }) {
  return (
    <>
      <FirmDetail id={params.id} />
    </>
  );
}
