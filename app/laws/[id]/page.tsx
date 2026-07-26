import { PageHeader } from "@/components/page-header";
import { LawDetail } from "@/components/law-detail";
import { laws as defaultLaws } from "@/lib/data";
import { buildDescription, absoluteUrl } from "@/lib/seo";
import { getSeoDefaults } from "@/lib/seo-defaults";
import type { Metadata } from "next";

// Generate pages for default laws only (for SEO)
// New laws added via admin will be handled dynamically
export function generateStaticParams() {
  return defaultLaws.map((l) => ({ id: l.id }));
}

// Make the page dynamic to support laws added via admin
export const dynamic = "force-dynamic";

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
  return <LawDetail id={params.id} />;
}
