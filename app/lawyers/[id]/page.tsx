import { LawyerProfile } from "@/components/lawyer-profile";
import { lawyers, lawyerSlug } from "@/lib/data";
import { buildDescription, absoluteUrl } from "@/lib/seo";
import { getSeoDefaults } from "@/lib/seo-defaults";
import { JsonLd } from "@/components/json-ld";
import type { Metadata } from "next";

// Pre-generate static pages for demo lawyers + allow dynamic pages for registered ones
export const dynamicParams = true;

export function generateStaticParams() {
  return lawyers.map((l) => ({ id: lawyerSlug(l) }));
}

function findLawyerStatic(id: string) {
  const decodedId = decodeURIComponent(id);
  return lawyers.find((l) => lawyerSlug(l) === decodedId) ?? null;
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const lawyer = findLawyerStatic(params.id);
  const seo = getSeoDefaults();
  const title = lawyer ? lawyer.name : "محامٍ";
  const desc = lawyer
    ? buildDescription(`ملف ${lawyer.name} — ${lawyer.specialization} في ${lawyer.city}.`, seo)
    : undefined;
  const url = absoluteUrl(`/lawyers/${decodeURIComponent(params.id)}`, seo);
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
      type: "profile",
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

export default function LawyerProfilePage({ params }: { params: { id: string } }) {
  const decodedId = decodeURIComponent(params.id);
  const lawyer = findLawyerStatic(decodedId);
  return (
    <>
      <LawyerProfile id={lawyer?.id ?? params.id} />
      <JsonLd page="lawyers" context={lawyer ? {
        id: lawyer.id,
        name: lawyer.name,
        slug: decodedId,
        specialization: lawyer.specialization,
        city: lawyer.city,
        email: lawyer.email || undefined,
      } : undefined} />
    </>
  );
}
