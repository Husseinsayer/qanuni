"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BlogEditor from "@/components/admin/blog-editor";
import { ArrowRight, Save, Send, Eye } from "lucide-react";

const categories = [
  "الأحوال الشخصية", "القانون العقاري", "قانون العمل",
  "القانون الجنائي", "القانون التجاري", "القانون الإداري", "القانون المدني",
];

const hueOptions = [
  "from-amber-400 to-orange-500", "from-purple-400 to-fuchsia-500",
  "from-emerald-400 to-teal-500", "from-slate-500 to-slate-700",
  "from-blue-400 to-indigo-500", "from-rose-400 to-pink-500",
];

export default function EditLawyerArticlePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState("");
  const [readingTime, setReadingTime] = useState(5);
  const [excerpt, setExcerpt] = useState("");
  const [hue, setHue] = useState(hueOptions[0]);
  const [htmlContent, setHtmlContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/lawyer/articles/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.article) {
          const a = d.article;
          setTitle(a.title);
          setCategory(a.category);
          setDate(a.date);
          setReadingTime(a.readingTime);
          setExcerpt(a.excerpt);
          setHue(a.hue);
          setHtmlContent(a.content);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const save = async (resubmit: boolean) => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/lawyer/articles/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(), category, excerpt: excerpt.trim(),
          content: htmlContent, date, readingTime, hue,
          status: resubmit ? "pending" : undefined,
        }),
      });
      if (res.ok) router.push("/lawyer/dashboard/articles");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/lawyer/dashboard/articles" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Link>
          <h1 className="text-2xl font-bold">تعديل المقال</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4" />
            {showPreview ? "إخفاء المعاينة" : "معاينة"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={saving}>
            <Save className="h-4 w-4" />
            حفظ
          </Button>
          <Button size="sm" onClick={() => save(true)} disabled={saving}>
            <Send className="h-4 w-4" />
            إعادة إرسال للمراجعة
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-3" : ""}`}>
        <div className={showPreview ? "lg:col-span-2" : "max-w-4xl"}>
          <Card>
            <CardContent className="p-5">
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">عنوان المقال *</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">التصنيف</label>
                  <select
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">التاريخ</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">وقت القراءة</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">اللون</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {hueOptions.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHue(h)}
                        className={`h-7 w-7 rounded-full bg-gradient-to-br ${h} ${hue === h ? "ring-2 ring-accent ring-offset-2" : ""}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">المقتطف</label>
                <textarea
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">محتوى المقال</label>
                <BlogEditor content={htmlContent} onChange={setHtmlContent} />
              </div>
            </CardContent>
          </Card>
        </div>

        {showPreview && (
          <div className="hidden lg:block">
            <Card className="sticky top-6">
              <CardContent className="p-5">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground">معاينة</h3>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{category}</span>
                {title && <h2 className="mt-3 mb-2 text-xl font-bold">{title}</h2>}
                {excerpt && <p className="text-sm text-muted-foreground">{excerpt}</p>}
                {htmlContent && (
                  <div className="prose prose-sm dark:prose-invert max-w-none mt-3" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
