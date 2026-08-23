import { ArticleDetail } from "@/components/article-detail";
import { prisma } from "@/lib/prisma";
import { buildDescription, absoluteUrl } from "@/lib/seo";
import { getSeoDefaults } from "@/lib/seo-defaults";
import { JsonLd } from "@/components/json-ld";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({ where: { status: "published" }, select: { id: true } });
  return articles.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { id: params.id } });
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
      publishedTime: article?.date || undefined,
      modifiedTime: article?.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
      authors: article?.author ? [article.author] : undefined,
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

export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({ where: { id: params.id } });
  return (
    <>
      <JsonLd page="blog" context={article ? {
        id: article.id,
        title: article.title,
        description: article.excerpt || article.title,
        date: article.date || undefined,
        updatedAt: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
        author: article.author || undefined,
      } : undefined} />
      <ArticleDetail id={params.id} />
    </>
  );
}
