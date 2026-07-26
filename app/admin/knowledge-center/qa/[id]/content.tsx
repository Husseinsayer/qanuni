"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getItems } from "@/lib/knowledge-center/store";
import { type KnowledgeQA } from "@/lib/knowledge-center/types";
import { ChevronRight, ArrowLeft } from "lucide-react";

const importanceLabels: Record<string, string> = { high: "عالي", medium: "متوسط", low: "منخفض" };
const importanceColors: Record<string, string> = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-green-100 text-green-700" };

export default function QADetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<KnowledgeQA | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = getItems("qa", true);
    setItem(items.find((i) => i.id === id) ?? null);
    setLoading(false);
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  if (!item) return <div className="py-20 text-center"><p className="mb-4 text-muted-foreground">لم يتم العثور على السؤال</p><Button onClick={() => router.push("/admin/knowledge-center/qa")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/knowledge-center" className="hover:text-accent">مركز المعرفة</Link><ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/knowledge-center/qa" className="hover:text-accent">الأسئلة والأجوبة</Link><ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[250px]">{item.question}</span>
      </div>
      <div className="mb-6"><h1 className="text-2xl font-bold">{item.question}</h1></div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">معلومات السؤال</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-xs font-semibold text-muted-foreground">التصنيف</label><p className="mt-0.5 text-sm">{item.category}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">الأهمية</label><p className="mt-0.5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${importanceColors[item.importance]}`}>{importanceLabels[item.importance]}</span></p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">الحالة</label><p className="mt-0.5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isActive ? "فعال" : "مخفي"}</span></p></div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <Card><CardHeader><CardTitle className="text-base">الإجابة</CardTitle></CardHeader><CardContent><div className="whitespace-pre-wrap text-sm leading-relaxed">{item.answer}</div></CardContent></Card>
          {item.keywords.length > 0 && <Card><CardHeader><CardTitle className="text-base">كلمات مفتاحية</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-1.5">{item.keywords.map((kw, i) => <span key={i} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{kw}</span>)}</div></CardContent></Card>}
          {item.notes && <Card><CardHeader><CardTitle className="text-base">ملاحظات</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent></Card>}
        </div>
      </div>
      <div className="mt-6"><Button variant="outline" onClick={() => router.push("/admin/knowledge-center/qa")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>
    </div>
  );
}
