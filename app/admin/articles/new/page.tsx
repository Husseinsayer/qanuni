"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../../admin-context";
import { type ArticleBlock } from "@/lib/data";
import { Plus, Trash2, ChevronUp, ChevronDown, ArrowRight, Save, Send, Eye } from "lucide-react";
import { toast } from "@/lib/admin-toast";

const categories = [
  "الأحوال الشخصية",
  "القانون العقاري",
  "قانون العمل",
  "القانون الجنائي",
  "القانون التجاري",
  "القانون الإداري",
  "القانون المدني",
];

const hueOptions = [
  "from-amber-400 to-orange-500",
  "from-purple-400 to-fuchsia-500",
  "from-emerald-400 to-teal-500",
  "from-slate-500 to-slate-700",
  "from-blue-400 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-teal-400 to-green-500",
];

export default function NewArticlePage() {
  const router = useRouter();
  const { data, update } = useAdminContext();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [lawyerId, setLawyerId] = useState(data.lawyers[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [readingTime, setReadingTime] = useState(5);
  const [excerpt, setExcerpt] = useState("");
  const [hue, setHue] = useState(hueOptions[0]);
  const [blocks, setBlocks] = useState<ArticleBlock[]>([{ p: "" }]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [showPreview, setShowPreview] = useState(false);

  const addBlock = () => setBlocks([...blocks, { p: "" }]);
  const removeBlock = (idx: number) => setBlocks(blocks.filter((_, i) => i !== idx));
  const updateBlock = (idx: number, field: keyof ArticleBlock, value: string) => {
    setBlocks(blocks.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  };
  const moveBlock = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const copy = [...blocks];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    setBlocks(copy);
  };

  const save = (publishStatus: "draft" | "published") => {
    if (!title.trim()) {
      toast.error("العنوان مطلوب", "يرجى إدخال عنوان المقال");
      return;
    }
    const lawyer = data.lawyers.find((l) => l.id === lawyerId);
    const newId = `a${Date.now()}`;
    const articleData = {
      id: newId,
      title: title.trim(),
      category,
      excerpt: excerpt.trim(),
      author: lawyer?.name || "",
      lawyerId,
      date,
      readingTime,
      hue,
      views: 0,
      status: publishStatus,
    };
    update("articles", [...data.articles, articleData]);
    update("articleBodies", { ...data.articleBodies, [newId]: blocks.filter((b) => b.p.trim()) });
    toast.success(publishStatus === "published" ? "تم النشر بنجاح" : "تم الحفظ كمسودة", `تمت إضافة المقال "${title}"`);
    router.push("/admin/articles");
  };

  const PreviewPanel = () => (
    <Card className="sticky top-6">
      <CardContent className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">معاينة المقال</h3>
        <div className="prose prose-sm max-w-none" dir="rtl">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{category}</span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <h2 className="mb-3 text-xl font-bold">{title || "عنوان المقال"}</h2>
          {excerpt && <p className="mb-4 text-sm text-muted-foreground">{excerpt}</p>}
          {blocks.map((block, i) => (
            <div key={i} className="mb-3">
              {block.h && <h3 className="text-base font-bold">{block.h}</h3>}
              {block.p && <p className="text-sm leading-relaxed text-muted-foreground">{block.p}</p>}
            </div>
          ))}
        </div>
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
          <Button variant="outline" size="sm" onClick={() => save("draft")}>
            <Save className="h-4 w-4" />
            حفظ كمسودة
          </Button>
          <Button size="sm" onClick={() => save("published")}>
            <Send className="h-4 w-4" />
            نشر
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-3" : ""}`}>
        <div className={showPreview ? "lg:col-span-2" : ""}>
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
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">اللون</label>
                <div className="flex flex-wrap gap-2">
                  {hueOptions.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHue(h)}
                      className={`h-7 w-7 rounded-full bg-gradient-to-br ${h} ${hue === h ? "ring-2 ring-accent ring-offset-2" : ""}`}
                    />
                  ))}
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

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">محتوى المقال</label>
                  <Button variant="outline" size="sm" onClick={addBlock}>
                    <Plus className="h-3.5 w-3.5" />
                    إضافة فقرة
                  </Button>
                </div>
                <div className="space-y-3">
                  {blocks.map((block, idx) => (
                    <div key={idx} className="rounded-xl border border-border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">فقرة {idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveBlock(idx, -1)} className="rounded p-0.5 hover:bg-muted/60"><ChevronUp className="h-3.5 w-3.5" /></button>
                          <button onClick={() => moveBlock(idx, 1)} className="rounded p-0.5 hover:bg-muted/60"><ChevronDown className="h-3.5 w-3.5" /></button>
                          <button onClick={() => removeBlock(idx)} className="rounded p-0.5 hover:bg-red-50 dark:hover:bg-red-950/20"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                        </div>
                      </div>
                      <input
                        className="mb-2 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                        placeholder="عنوان فرعي (اختياري)"
                        value={block.h || ""}
                        onChange={(e) => updateBlock(idx, "h", e.target.value)}
                      />
                      <textarea
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                        rows={2}
                        placeholder="نص الفقرة"
                        value={block.p}
                        onChange={(e) => updateBlock(idx, "p", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
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
