"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getItems } from "@/lib/knowledge-center/store";
import { type LegalTemplate } from "@/lib/knowledge-center/types";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<LegalTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = getItems("templates", true);
    setItem(items.find((i) => i.id === id) ?? null);
    setLoading(false);
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  if (!item) return <div className="py-20 text-center"><p className="mb-4 text-muted-foreground">لم يتم العثور على النموذج</p><Button onClick={() => router.push("/admin/knowledge-center/templates")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/knowledge-center" className="hover:text-accent">مركز المعرفة</Link><ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/knowledge-center/templates" className="hover:text-accent">النماذج القانونية</Link><ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{item.name}</span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold truncate">{item.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">معلومات النموذج</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-xs font-semibold text-muted-foreground">التصنيف</label><p className="mt-0.5 text-sm">{item.category}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">المتغيرات</label><p className="mt-0.5 text-sm">{item.variables.length} متغير{item.variables.length !== 1 ? "ات" : ""}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">الحالة</label><p className="mt-0.5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isActive ? "فعال" : "مخفي"}</span></p></div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          {item.description && <Card><CardHeader><CardTitle className="text-base">الوصف</CardTitle></CardHeader><CardContent><p className="text-sm">{item.description}</p></CardContent></Card>}
          {item.content && <Card><CardHeader><CardTitle className="text-base">المحتوى</CardTitle></CardHeader><CardContent><div className="whitespace-pre-wrap rounded-lg bg-muted/30 p-4 text-sm leading-relaxed font-mono">{item.content}</div></CardContent></Card>}
          {item.variables.length > 0 && <Card><CardHeader><CardTitle className="text-base">المتغيرات</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{item.variables.map((v, i) => <span key={i} className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">{`{{${v.name}}}${v.placeholder ? `: ${v.placeholder}` : ""}`}</span>)}</div></CardContent></Card>}
          {item.keywords.length > 0 && <Card><CardHeader><CardTitle className="text-base">كلمات مفتاحية</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-1.5">{item.keywords.map((kw, i) => <span key={i} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{kw}</span>)}</div></CardContent></Card>}
          {item.notes && <Card><CardHeader><CardTitle className="text-base">ملاحظات</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent></Card>}
        </div>
      </div>
      <div className="mt-6"><Button variant="outline" onClick={() => router.push("/admin/knowledge-center/templates")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>
    </div>
  );
}
