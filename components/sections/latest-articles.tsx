"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useSiteData } from "@/lib/use-site-data";
import { ArrowLeft } from "lucide-react";

export function LatestArticles() {
  const { articles } = useSiteData();

  const publishedArticles = articles
    .filter((a) => a.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  if (publishedArticles.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">أحدث المقالات القانونية</h2>
            <p className="mt-2 text-muted-foreground">
              اطلع على آخر المقالات والتحليلات القانونية من محامين متخصصين
            </p>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publishedArticles.map((article) => (
            <Link key={article.id} href={`/blog/${article.id}`}>
              <Card className="group h-full transition-all hover:shadow-md hover:border-accent/30">
                <CardContent className="flex flex-col p-6 h-full">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold group-hover:text-accent transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.author}</span>
                    <span>{article.date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
