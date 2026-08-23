"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, UserRound, CalendarDays, ArrowLeft, Share2, Eye, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { useSiteData } from "@/lib/use-site-data";
import { lawyers, lawyerSlug, type Lawyer } from "@/lib/data";
import { cn, toArabicDigits } from "@/lib/utils";
import { AdBanner } from "@/components/ad-banner";

const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export function ArticleDetail({ id }: { id: string }) {
  const { articles, isLoading } = useSiteData();

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">جاري تحميل المقال...</p>
      </div>
    );
  }

  const article = articles.find((a) => a.id === id);
  if (!article) notFound();

  return (
    <div className="container max-w-4xl pb-20">
      <article>
        <div className={cn("relative mb-8 h-64 rounded-3xl bg-gradient-to-br md:h-80", article.hue)}>
          <div className="absolute inset-0 grid place-items-center opacity-30">
            <span className="text-7xl font-black text-white/70">Ⓐ</span>
          </div>
          <Badge className="absolute right-4 top-4 bg-white/90 text-foreground">{article.category}</Badge>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {article.lawyerId ? (
            <Link href={`/lawyers/${lawyerSlug(lawyers.find((l) => l.id === article.lawyerId) || { slug: article.lawyerId } as Lawyer)}`} className="flex items-center gap-1.5 font-semibold text-accent transition hover:text-accent/80">
              <UserRound className="size-4" /> {article.author}
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 font-semibold text-accent">
              <UserRound className="size-4" /> {article.author}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" /> {formatDate(article.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" /> {toArabicDigits(article.readingTime)} دقيقة قراءة
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="size-4" /> {toArabicDigits(article.views)} مشاهدة
          </span>
        </div>

        <h1 className="text-3xl font-extrabold leading-snug md:text-4xl">{article.title}</h1>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: article.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("تم نسخ رابط المقال");
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent"
          >
            <Share2 className="size-4" /> مشاركة
          </button>
          <button
            onClick={() => {
              const raw = localStorage.getItem("saved_articles");
              const saved: string[] = raw ? JSON.parse(raw) : [];
              if (saved.includes(article.id)) {
                localStorage.setItem("saved_articles", JSON.stringify(saved.filter((x) => x !== article.id)));
              } else {
                saved.push(article.id);
                localStorage.setItem("saved_articles", JSON.stringify(saved));
              }
              window.location.reload();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent"
          >
            <Bookmark className="size-4" /> حفظ المقال
          </button>
        </div>

        <div className="mt-6 space-y-5 text-base leading-loose text-foreground/90">
          <p className="text-lg font-medium text-foreground">{article.excerpt}</p>
          {article.content ? (
            <div
              className="prose prose-sm sm:prose-base dark:prose-invert max-w-none [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:border-r-4 [&_h2]:border-accent [&_h2]:pr-3 [&_h2]:mb-3 [&_h2]:mt-6 [&_p]:leading-loose [&_p]:text-foreground/90 [&_img]:rounded-xl [&_img]:my-4 [&_blockquote]:border-r-accent [&_blockquote]:pr-4 [&_blockquote]:text-muted-foreground [&_ul]:pr-4 [&_ol]:pr-4 [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-4 [&_code]:text-sm"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <>
              <p>
                في هذا المقال نتناول أبرز الجوانب العملية والقانونية المتعلقة بهذا الموضوع، مستندين إلى
                نصوص القوانين العراقية النافذة والتشريعات الحديثة، بهدف تقديم فهم واضح يساعد القارئ على
                معرفة حقوقه والإجراءات الواجب اتباعها.
              </p>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            <ArrowLeft className="size-4" /> العودة إلى المدونة
          </Link>
        </div>
      </article>

      {/* Ad: Rectangle */}
      <AdBanner placementKey="article-end" />
    </div>
  );
}
