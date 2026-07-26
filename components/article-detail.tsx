"use client";

import { notFound } from "next/navigation";
import { Clock, UserRound, CalendarDays, ArrowLeft, Share2, Eye, Bookmark } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { articles, articleBodies, lawyers, lawyerSlug } from "@/lib/data";
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
  const article = articles.find((a) => a.id === id);
  if (!article) notFound();

  const authorLawyer = lawyers.find((l) => l.id === article.lawyerId);

  return (
    <div className="container max-w-3xl pb-20">
      <article>
        <div className={cn("relative mb-8 h-56 rounded-3xl bg-gradient-to-br md:h-72", article.hue)}>
          <div className="absolute inset-0 grid place-items-center opacity-30">
            <span className="text-7xl font-black text-white/70">Ⓐ</span>
          </div>
          <Badge className="absolute right-4 top-4 bg-white/90 text-foreground">{article.category}</Badge>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {authorLawyer && (
            <a href={`/lawyers/${lawyerSlug(authorLawyer)}`} className="flex items-center gap-1.5 font-semibold text-accent transition hover:underline">
              <UserRound className="size-4" /> {article.author}
            </a>
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
          {articleBodies[article.id] ? (
            articleBodies[article.id].map((block, i) => (
              <div key={i}>
                {block.h && (
                  <h2 className="mb-2 border-r-4 border-accent pr-3 pt-1 text-xl font-extrabold text-foreground">
                    {block.h}
                  </h2>
                )}
                <p>{block.p}</p>
              </div>
            ))
          ) : (
            <>
              <p>
                في هذا المقال نتناول أبرز الجوانب العملية والقانونية المتعلقة بهذا الموضوع، مستندين إلى
                نصوص القوانين العراقية النافذة والتشريعات الحديثة، بهدف تقديم فهم واضح يساعد القارئ على
                معرفة حقوقه والإجراءات الواجب اتباعها.
              </p>
              <h2 className="border-r-4 border-accent pr-3 pt-1 text-xl font-extrabold text-foreground">
                أولاً: الإطار القانوني
              </h2>
              <p>
                ينظم القانون العراقي هذا المجال عبر سلسلة من المواد التي تفصّل الحقوق والواجبات، وتوضح
                الجهة المختصة بالنظر في المنازعات وإجراءات التقاضي المتبعة أمام المحاكم المختصة.
              </p>
              <h2 className="border-r-4 border-accent pr-3 pt-1 text-xl font-extrabold text-foreground">
                ثانياً: الخطوات العملية
              </h2>
              <p>
                يُنصح بتوثيق جميع الأوراق والاتفاقيات ذات العلاقة، واللجوء إلى محامٍ مختص قبل اتخاذ أي
                إجراء قانوني، لضمان سلامة الموقف وتجنب المخاطر الإجرائية.
              </p>
              <h2 className="border-r-4 border-accent pr-3 pt-1 text-xl font-extrabold text-foreground">
                ثالثاً: نصائح الخبراء
              </h2>
              <p>
                احرص على متابعة آخر التعديلات التشريعية، وراجع دليل المحامين على منصة قانوني للعثور على
                مختص يناسب قضيتك وتخصصك الجغرافي.
              </p>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <a href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            <ArrowLeft className="size-4" /> العودة إلى المدونة
          </a>
        </div>
      </article>

      {/* Ad: Rectangle بين المقال والكاتب — انتهى القراءة */}
      <AdBanner size="rectangle" placementKey="article-end" />

      {/* Author card */}
      {authorLawyer && (
        <Card className="mt-10 flex items-center gap-4 bg-muted/30 p-6">
          <span className={cn("grid size-12 place-items-center rounded-full bg-gradient-to-br text-lg font-extrabold text-white", authorLawyer.hue)}>
            {authorLawyer.initials}
          </span>
          <div className="flex-1">
            <p className="font-bold">{authorLawyer.name}</p>
            <p className="text-sm text-muted-foreground">{authorLawyer.specialization} — {authorLawyer.city}</p>
          </div>
          <a
            href={`/lawyers/${lawyerSlug(authorLawyer)}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20"
          >
            عرض الملف
            <ArrowLeft className="size-4" />
          </a>
        </Card>
      )}
    </div>
  );
}
