import { LawDetail } from "@/components/law-detail";
import { AdBanner } from "@/components/ad-banner";
import { laws as defaultLaws } from "@/lib/data";
import { buildDescription, absoluteUrl } from "@/lib/seo";
import { getSeoDefaults } from "@/lib/seo-defaults";
import { JsonLd } from "@/components/json-ld";
import type { Metadata } from "next";

// Generate pages for default laws only (for SEO)
// New laws added via admin will be handled dynamically
export function generateStaticParams() {
  return defaultLaws.map((l) => ({ id: l.id }));
}

// Make the page dynamic to support laws added via admin
// export const dynamic = "force-dynamic"; // Removed for static export

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const law = defaultLaws.find((l) => l.id === params.id);
  const seo = getSeoDefaults();
  const title = law ? law.name : "قانون";
  const desc = law
    ? buildDescription(`تصفح مواد ${law.name} والاطلاع على التشريعات العراقية.`, seo)
    : undefined;
  const url = absoluteUrl(`/laws/${params.id}`, seo);
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
      type: "article",
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

export default function LawDetailPage({ params }: { params: { id: string } }) {
  const law = defaultLaws.find((l) => l.id === params.id);
  const seo = getSeoDefaults();
  return (
    <>
      {/* Ad: أعلى تفاصيل القانون */}
      <AdBanner placementKey="law-detail-top" />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Legislation",
        name: law?.name || "قانون",
        description: `تصفح مواد ${law?.name || "قانون"} والاطلاع على التشريعات العراقية.`,
        url: absoluteUrl(`/laws/${params.id}`, seo),
        legislationCountry: "IQ",
      }} />
      <LawDetail id={params.id} />
    </>
  );
}
