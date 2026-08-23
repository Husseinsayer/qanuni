"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getItems } from "@/lib/knowledge-center/store";
import { type LegalTemplate } from "@/lib/knowledge-center/types";
import { ChevronRight, ArrowLeft, FileText, Tag, Bookmark, Copy, Check, Info } from "lucide-react";
import { toast } from "@/lib/admin-toast";

function renderTemplateContent(html: string): string {
  // Style {{variable}} patterns as beautiful chips in the rendered HTML
  return html.replace(/\{\{([^}]+)\}\}/g, (_, name: string) => {
    return `<span class="variable-chip inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">${name}</span>`;
  });
}

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<LegalTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const items = getItems("templates", true);
    setItem(items.find((i) => i.id === id) ?? null);
    setLoading(false);
  }, [id]);

  const copyVariable = (name: string) => {
    navigator.clipboard.writeText(`{{${name}}}`);
    setCopiedId(name);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(`تم نسخ {{${name}}}`);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  if (!item) return <div className="py-20 text-center"><p className="mb-4 text-muted-foreground">لم يتم العثور على النموذج</p><Button onClick={() => router.push("/admin/knowledge-center/templates")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>;

  const renderedContent = item.content ? renderTemplateContent(item.content) : "";

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/knowledge-center" className="hover:text-accent transition-colors">مركز المعرفة</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/knowledge-center/templates" className="hover:text-accent transition-colors">النماذج القانونية</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{item.name}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/70 text-white shadow-soft">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{item.name}</h1>
            <p className="text-sm text-muted-foreground">{item.category} • {item.variables.length} متغير</p>
          </div>
          <div className="mr-auto">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500"}`}>
              {item.isActive ? "فعال" : "مخفي"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4 text-accent" /> معلومات النموذج</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">التصنيف</span><span className="font-medium">{item.category}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">المتغيرات</span><span className="font-medium">{item.variables.length} متغير</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الحالة</span><span className={`font-medium ${item.isActive ? "text-green-600" : "text-gray-500"}`}>{item.isActive ? "فعال" : "مخفي"}</span></div>
              {item.description && <div className="pt-2 border-t border-border"><span className="text-muted-foreground text-xs">الوصف</span><p className="mt-1 text-sm">{item.description}</p></div>}
            </CardContent>
          </Card>

          {item.keywords.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Tag className="h-4 w-4 text-accent" /> كلمات مفتاحية</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-1.5">{item.keywords.map((kw, i) => <span key={i} className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">{kw}</span>)}</div></CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {item.content && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Bookmark className="h-4 w-4 text-accent" /> المحتوى</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none rounded-xl bg-muted/20 p-6 leading-relaxed border border-border/50 [&_.variable-chip]:cursor-pointer [&_.variable-chip]:transition-all [&_.variable-chip:hover]:shadow-sm"
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: renderedContent }}
                />
              </CardContent>
            </Card>
          )}

          {item.notes && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">ملاحظات</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent>
            </Card>
          )}

          {item.variables.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Copy className="h-4 w-4 text-accent" /> المتغيرات ({item.variables.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {item.variables.map((v) => (
                    <div
                      key={v.id}
                      className="group flex items-center gap-2 rounded-lg border border-border bg-background p-2.5 text-sm transition-all hover:border-accent/30 hover:shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <code className="text-xs font-semibold text-accent block truncate">{`{{${v.name}}}`}</code>
                        {v.placeholder && <span className="text-[10px] text-muted-foreground block truncate">{v.placeholder}</span>}
                      </div>
                      <button
                        onClick={() => copyVariable(v.name)}
                        className="rounded-md p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted/60 hover:text-accent transition-all"
                        title="نسخ"
                      >
                        {copiedId === v.name ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push("/admin/knowledge-center/templates")}>
          <ArrowLeft className="ml-2 h-4 w-4" /> العودة
        </Button>
      </div>
    </div>
  );
}
