"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { useAdminContext } from "../../admin-context";
import { analyzeContent } from "@/lib/seo";

export default function ContentAnalyzerPage() {
  const { data } = useAdminContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keyword, setKeyword] = useState("");
  const [html, setHtml] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeContent> | null>(null);

  const run = () => {
    setResult(analyzeContent({ title, description, html, keyword }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">محلل المحتوى</h1>
          <p className="text-sm text-muted-foreground">تحليل SEO شامل لأي صفحة أو مقال</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>مدخلات التحليل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">العنوان (Title)</label>
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">الكلمة المفتاحية</label>
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">الوصف (Description)</label>
            <textarea rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">محتوى الصفحة (HTML أو نص)</label>
            <textarea rows={8} dir="ltr" className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" value={html} onChange={(e) => setHtml(e.target.value)} placeholder="<h1>...</h1><p>...</p><img src='x'>" />
          </div>
          <Button variant="accent" onClick={run}>
            <Search className="h-4 w-4" />
            تحليل
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                درجة SEO: {result.score}/100
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Metric label="عدد الكلمات" value={result.wordCount} />
              <Metric label="كثافة الكلمة" value={`${result.keywordDensity}%`} />
              <Metric label="H1 / H2 / H3" value={`${result.headings.h1}/${result.headings.h2}/${result.headings.h3}`} />
              <Metric label="صور بدون Alt" value={result.missingAlt} />
              <Metric label="الصور" value={result.images} />
              <Metric label="الفقرات" value={result.paragraphs} />
              <Metric label="متوسط الفقرة" value={result.avgParagraphWords} />
              <Metric label="سهولة القراءة" value={result.fleschReading} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الفحص</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.checks.map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
                  {c.pass ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  )}
                  <span className="flex-1">{c.label}</span>
                  <span className="text-xs text-muted-foreground">{c.detail}</span>
                  <span className="text-xs font-bold text-muted-foreground">+{c.weight}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}
