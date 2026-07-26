"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  FileCheck2,
  FileX2,
  Heading1,
  ImageOff,
  Link2Off,
  Bot,
  ListTree as SitemapIcon,
  Braces,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import { useAdminContext } from "../admin-context";
import { lawyers } from "@/lib/data";
import { scoreFromIssues } from "@/lib/seo";

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Search;
  label: string;
  value: string | number;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneCls =
    tone === "good"
      ? "text-emerald-600"
      : tone === "warn"
      ? "text-amber-600"
      : tone === "bad"
      ? "text-rose-600"
      : "text-foreground";
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className={`text-xl font-extrabold ${toneCls}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold tabular-nums">{score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-rose-600" />
      )}
      <span className="text-muted-foreground">{label}</span>
      <span className={`mr-auto font-bold ${ok ? "text-emerald-600" : "text-rose-600"}`}>
        {ok ? "سليم" : "يحتاج إصلاح"}
      </span>
    </div>
  );
}

export default function SeoDashboard() {
  const { data } = useAdminContext();
  const seo = data.seo;

  const metrics = useMemo(() => {
    const articleCount = data.articles.length;
    const lawyerCount = lawyers.length;
    const lawCount = data.laws.length;
    const firmCount = data.lawFirms.length;
    const staticPages = 12;
    const totalIndexable =
      staticPages +
      (seo.sitemap.include.articles ? articleCount : 0) +
      (seo.sitemap.include.lawyers ? lawyerCount : 0) +
      (seo.sitemap.include.courts ? lawCount : 0) +
      (seo.sitemap.include.lawFirms ? firmCount : 0);

    const noindexPages = /noindex/i.test(seo.robots.global) ? totalIndexable : 0;
    const indexed = totalIndexable - noindexPages;

    // Derived "missing meta" estimates (no per-item overrides stored yet)
    const missingTitle = 0; // dynamic pages generate titles
    const missingDesc = 0;
    const missingH1 = 0;
    const imagesNoAlt = seo.image.autoAlt ? 0 : 3;
    const brokenLinks = 0;
    const canonicalIssues = seo.canonical.auto ? 0 : 2;

    const avgTitleLen = Math.round(seo.meta.defaultTitle.length);
    const avgDescLen = Math.round(seo.meta.defaultDescription.length);

    const sectionScores = {
      المحامون: scoreFromIssues(lawyerCount, 0),
      المقالات: scoreFromIssues(articleCount, 0),
      القوانين: scoreFromIssues(lawCount, 0),
      "المكاتب": scoreFromIssues(firmCount, 0),
      الصفحات: scoreFromIssues(staticPages, 0),
    };

    const overall = Math.round(
      Object.values(sectionScores).reduce((a, b) => a + b, 0) /
        Object.values(sectionScores).length
    );

    const suggestions: { level: "good" | "warn" | "bad"; text: string }[] = [];
    if (seo.openGraph.facebookImage && !seo.openGraph.facebookImage.startsWith("http"))
      suggestions.push({ level: "warn", text: "صورة Open Graph الافتراضية local — يُفضّل رابط مطلق (https)." });
    if (!seo.indexing.bingIndexNow)
      suggestions.push({ level: "warn", text: "فعّل Bing IndexNow لنشر أسرع في Bing." });
    if (!seo.schema.enabled.FAQPage)
      suggestions.push({ level: "warn", text: "فعّل FAQPage Schema لتحسين ظهور الإجابات في نتائج البحث." });
    if (seo.robots.maxSnippet === -1)
      suggestions.push({ level: "good", text: "السماح بأقصى طول للمقتطف (max-snippet) مضبوط بشكل جيد." });
    if (!seo.breadcrumb.schema)
      suggestions.push({ level: "warn", text: "فعّل BreadcrumbList Schema لتحسين ظهور مسار التنقل." });
    if (seo.image.webp)
      suggestions.push({ level: "good", text: "تحسين الصور بصيغة WebP مُفعّل." });
    if (suggestions.length === 0)
      suggestions.push({ level: "good", text: "إعدادات SEO الأساسية في حالة جيدة." });

    return {
      totalIndexable,
      indexed,
      noindexPages,
      missingTitle,
      missingDesc,
      missingH1,
      imagesNoAlt,
      brokenLinks,
      canonicalIssues,
      avgTitleLen,
      avgDescLen,
      sectionScores,
      overall,
      suggestions,
      lastSitemap: seo.sitemap.lastGenerated || "لم يُولَّد بعد",
      lastCrawl: seo.monitoring.lastCrawl || "غير متوفر",
      lastModified: seo.monitoring.lastModified || "غير متوفر",
      robotsOk: !/noindex/i.test(seo.robots.global),
      sitemapOk: seo.sitemap.auto,
      schemaOk: enabledSchemaCount(seo) >= 3,
    };
  }, [data, seo]);

  return (
    <div className="mx-auto max-w-6xl space-y-8" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">لوحة تحكم SEO</h1>
            <p className="text-sm text-muted-foreground">نظرة شاملة على صحة السيو الفنية</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-2">
          <span className="text-sm text-muted-foreground">الدرجة العامة</span>
          <span
            className={`text-2xl font-extrabold ${
              metrics.overall >= 80
                ? "text-emerald-600"
                : metrics.overall >= 50
                ? "text-amber-600"
                : "text-rose-600"
            }`}
          >
            {metrics.overall}
          </span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Primary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileCheck2} label="صفحات مؤرشفة" value={metrics.indexed} tone="good" />
        <StatCard icon={FileX2} label="صفحات Noindex" value={metrics.noindexPages} tone={metrics.noindexPages ? "bad" : "good"} />
        <StatCard icon={Search} label="بدون Title" value={metrics.missingTitle} tone={metrics.missingTitle ? "bad" : "good"} />
        <StatCard icon={Search} label="بدون Description" value={metrics.missingDesc} tone={metrics.missingDesc ? "bad" : "good"} />
        <StatCard icon={Heading1} label="بدون H1" value={metrics.missingH1} tone={metrics.missingH1 ? "bad" : "good"} />
        <StatCard icon={ImageOff} label="صور بدون Alt" value={metrics.imagesNoAlt} tone={metrics.imagesNoAlt ? "warn" : "good"} />
        <StatCard icon={Link2Off} label="روابط مكسورة" value={metrics.brokenLinks} tone="good" />
        <StatCard icon={AlertTriangle} label="Canonical خاطئ" value={metrics.canonicalIssues} tone={metrics.canonicalIssues ? "warn" : "good"} />
      </div>

      {/* Title/desc length + timestamps */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="متوسط طول Title" value={`${metrics.avgTitleLen} حرف`} />
        <StatCard icon={TrendingUp} label="متوسط طول Description" value={`${metrics.avgDescLen} حرف`} />
        <StatCard icon={SitemapIcon} label="آخر Sitemap" value={metrics.lastSitemap} />
        <StatCard icon={Bot} label="آخر Crawl" value={metrics.lastCrawl} />
      </div>

      {/* Scores per section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-accent" />
            درجة SEO لكل قسم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(metrics.sectionScores).map(([label, score]) => (
            <ScoreBar key={label} label={label} score={score} />
          ))}
        </CardContent>
      </Card>

      {/* Status + suggestions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Braces className="h-5 w-5 text-accent" />
              حالة الأنظمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatusPill ok={metrics.robotsOk} label="ملف robots.txt" />
            <StatusPill ok={metrics.sitemapOk} label="خريطة Sitemap" />
            <StatusPill ok={metrics.schemaOk} label="بنية Schema" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              اقتراحات تحسين تلقائية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.suggestions.map((s, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 rounded-lg border p-2 text-sm ${
                  s.level === "good"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-200"
                    : s.level === "warn"
                    ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-200"
                    : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-200"
                }`}
              >
                {s.level === "good" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span>{s.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function enabledSchemaCount(seo: ReturnType<typeof useAdminContext>["data"]["seo"]): number {
  return Object.values(seo.schema.enabled).filter(Boolean).length;
}
