"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../../admin-context";
import BlogEditor from "@/components/admin/blog-editor";
import { ArrowRight, Save, Send, Eye } from "lucide-react";
import { toast } from "@/lib/admin-toast";

const categories = [
  "الأحوال الشخصية", "القانون العقاري", "قانون العمل",
  "القانون الجنائي", "القانون التجاري", "القانون الإداري", "القانون المدني",
];

const hueOptions = [
  "from-amber-400 to-orange-500", "from-purple-400 to-fuchsia-500",
  "from-emerald-400 to-teal-500", "from-slate-500 to-slate-700",
  "from-blue-400 to-indigo-500", "from-rose-400 to-pink-500",
  "from-cyan-400 to-blue-500", "from-teal-400 to-green-500",
];

export default function NewArticlePage() {
  const router = useRouter();
  const { data, update } = useAdminContext();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [lawyerId, setLawyerId] = useState(data.lawyers[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [readingTime, setReadingTime] = useState(5);
  const [excerpt, setExcerpt] = useState("");
  const [hue, setHue] = useState(hueOptions[0]);
  const [htmlContent, setHtmlContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); }
  };

  const save = async (publishStatus: "draft" | "pending") => {
    if (!title.trim()) {
      toast.error("العنوان مطلوب", "يرجى إدخال عنوان المقال");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          excerpt: excerpt.trim(),
          content: htmlContent,
          authorId: lawyerId,
          date,
          readingTime,
          hue,
          status: publishStatus,
        }),
      });

      if (res.ok) {
        const { article } = await res.json();
        update("articleHtml", { ...data.articleHtml, [article.id]: htmlContent });
        toast.success(
          publishStatus === "pending" ? "تم الإرسال للمراجعة" : "تم الحفظ كمسودة",
          `تمت إضافة المقال "${title}"`
        );
        router.push("/admin/articles");
      } else {
        toast.error("خطأ", "فشل حفظ المقال");
      }
    } catch {
      toast.error("خطأ", "فشل الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const PreviewPanel = () => (
    <Card className="sticky top-6">
      <CardContent className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">معاينة المقال</h3>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{category}</span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        {title && <h2 className="mb-3 text-xl font-bold">{title}</h2>}
        {excerpt && <p className="mb-4 text-sm text-muted-foreground">{excerpt}</p>}
        {htmlContent ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:border-r-4 [&_h2]:border-accent [&_h2]:pr-3 [&_p]:text-sm [&_p]:leading-relaxed [&_img]:rounded-lg [&_img]:my-3"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">ابدأ بكتابة المحتواء...</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Link>
          <h1 className="text-2xl font-bold">مقال جديد</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4" />
            {showPreview ? "إخفاء المعاينة" : "معاينة"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => save("draft")} disabled={saving}>
            <Save className="h-4 w-4" />
            حفظ كمسودة
          </Button>
          <Button size="sm" onClick={() => save("pending")} disabled={saving}>
            <Send className="h-4 w-4" />
            إرسال للمراجعة
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
                  placeholder="أدخل عنوان المقال..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">الرابط (Slug)</label>
                  <input
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    placeholder="example-article"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase())}
                    dir="ltr"
                  />
                </div>
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
                  <label className="mb-1 block text-sm font-medium">المحامي</label>
                  <select
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    value={lawyerId}
                    onChange={(e) => setLawyerId(e.target.value)}
                  >
                    {data.lawyers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
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
                  <label className="mb-1 block text-sm font-medium">وقت القراءة (دقيقة)</label>
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
                  placeholder="ملخص قصير للمقال..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">الوسوم (Tags)</label>
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    placeholder="أضف وسماً..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button variant="outline" size="sm" onClick={addTag}>إضافة</Button>
                </div>
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                        {t}
                        <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">محتوى المقال</label>
                <BlogEditor
                  content={htmlContent}
                  onChange={setHtmlContent}
                  placeholder="ابدأ بكتابة مقالك هنا..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {showPreview && (
          <div className="hidden lg:block">
            <PreviewPanel />
          </div>
        )}
      </div>
    </div>
  );
}
