"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getItems } from "@/lib/knowledge-center/store";
import { type LegalProcedure } from "@/lib/knowledge-center/types";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function ProcedureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<LegalProcedure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = getItems("procedures", true);
    setItem(items.find((i) => i.id === id) ?? null);
    setLoading(false);
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  if (!item) return <div className="py-20 text-center"><p className="mb-4 text-muted-foreground">لم يتم العثور على الإجراء</p><Button onClick={() => router.push("/admin/knowledge-center/procedures")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/knowledge-center" className="hover:text-accent">مركز المعرفة</Link><ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/knowledge-center/procedures" className="hover:text-accent">الإجراءات القانونية</Link><ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{item.name}</span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold truncate">{item.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">معلومات الإجراء</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-xs font-semibold text-muted-foreground">التصنيف</label><p className="mt-0.5 text-sm">{item.category}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">الجهة المختصة</label><p className="mt-0.5 text-sm">{item.competentAuthority || "غير محدد"}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">المحافظة</label><p className="mt-0.5 text-sm">{item.governorate || "غير محدد"}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">المدة التقريبية</label><p className="mt-0.5 text-sm">{item.estimatedDuration || "غير محدد"}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">الرسوم</label><p className="mt-0.5 text-sm">{item.fees || "غير محدد"}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">الحالة</label><p className="mt-0.5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isActive ? "فعال" : "مخفي"}</span></p></div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          {item.shortDescription && <Card><CardHeader><CardTitle className="text-base">وصف مختصر</CardTitle></CardHeader><CardContent><p className="text-sm">{item.shortDescription}</p></CardContent></Card>}
          {item.detailedDescription && <Card><CardHeader><CardTitle className="text-base">شرح تفصيلي</CardTitle></CardHeader><CardContent><div className="whitespace-pre-wrap text-sm leading-relaxed">{item.detailedDescription}</div></CardContent></Card>}
          {item.steps.length > 0 && <Card><CardHeader><CardTitle className="text-base">الخطوات ({item.steps.length})</CardTitle></CardHeader><CardContent><ol className="list-inside list-decimal space-y-3 text-sm">{item.steps.map((s) => <li key={s.id}><span className="font-medium">{s.title}</span>{s.description && <p className="mt-0.5 mr-4 text-muted-foreground">{s.description}</p>}</li>)}</ol></CardContent></Card>}
          {item.requiredDocuments.length > 0 && <Card><CardHeader><CardTitle className="text-base">المستندات المطلوبة</CardTitle></CardHeader><CardContent><ul className="list-inside list-disc space-y-1 text-sm">{item.requiredDocuments.map((d, i) => <li key={i}>{d}</li>)}</ul></CardContent></Card>}
          {item.conditions.length > 0 && <Card><CardHeader><CardTitle className="text-base">الشروط</CardTitle></CardHeader><CardContent><ul className="list-inside list-disc space-y-1 text-sm">{item.conditions.map((c, i) => <li key={i}>{c}</li>)}</ul></CardContent></Card>}
          {item.keywords.length > 0 && <Card><CardHeader><CardTitle className="text-base">كلمات مفتاحية</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-1.5">{item.keywords.map((kw, i) => <span key={i} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{kw}</span>)}</div></CardContent></Card>}
          {item.notes && <Card><CardHeader><CardTitle className="text-base">ملاحظات</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent></Card>}
        </div>
      </div>
      <div className="mt-6"><Button variant="outline" onClick={() => router.push("/admin/knowledge-center/procedures")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>
    </div>
  );
}
