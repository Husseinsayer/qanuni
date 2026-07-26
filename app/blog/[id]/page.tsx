import { PageHeader } from "@/components/page-header";
import { ArticleDetail } from "@/components/article-detail";
import { articles } from "@/lib/data";
import { buildDescription, absoluteUrl } from "@/lib/seo";
import { getSeoDefaults } from "@/lib/seo-defaults";
import type { Metadata } from "next";

export function generateStaticParams() {
  return articles.map((a) => ({ id: a.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const article = articles.find((a) => a.id === params.id);
  const seo = getSeoDefaults();
  const title = article ? article.title : "مقال";
  const desc = article ? buildDescription(article.excerpt, seo) : undefined;
  const url = absoluteUrl(`/blog/${params.id}`, seo);
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

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const article = articles.find((a) => a.id === params.id);
  return (
    <>
      <PageHeader
        eyebrow="المدونة القانونية"
        title="مقال قانوني"
        crumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "المدونة", href: "/blog" },
          { label: article?.title ?? "المقال" },
        ]}
      />
      <ArticleDetail id={params.id} />
    </>
  );
}
