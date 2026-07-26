"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getItems } from "@/lib/knowledge-center/store";
import { type GovService } from "@/lib/knowledge-center/types";
import { ChevronRight, ArrowLeft, ExternalLink } from "lucide-react";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<GovService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = getItems("services", true);
    setItem(items.find((i) => i.id === id) ?? null);
    setLoading(false);
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  if (!item) return <div className="py-20 text-center"><p className="mb-4 text-muted-foreground">لم يتم العثور على الخدمة</p><Button onClick={() => router.push("/admin/knowledge-center/services")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/knowledge-center" className="hover:text-accent">مركز المعرفة</Link><ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/knowledge-center/services" className="hover:text-accent">الخدمات والروابط</Link><ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{item.name}</span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold truncate">{item.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">معلومات الخدمة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-xs font-semibold text-muted-foreground">التصنيف</label><p className="mt-0.5 text-sm">{item.category}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">الجهة</label><p className="mt-0.5 text-sm">{item.governmentBody || "غير محدد"}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">نوع الخدمة</label><p className="mt-0.5 text-sm">{item.serviceType || "غير محدد"}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">يتطلب تسجيل</label><p className="mt-0.5 text-sm">{item.requiresLogin ? "نعم" : "لا"}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">إلكترونية بالكامل</label><p className="mt-0.5 text-sm">{item.isFullyElectronic ? "نعم" : "لا"}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">الحالة</label><p className="mt-0.5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isActive ? "فعال" : "مخفي"}</span></p></div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          {item.description && <Card><CardHeader><CardTitle className="text-base">الوصف</CardTitle></CardHeader><CardContent><p className="text-sm">{item.description}</p></CardContent></Card>}
          {item.officialUrl && <Card><CardHeader><CardTitle className="text-base">الرابط الرسمي</CardTitle></CardHeader><CardContent><a href={item.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">{item.officialUrl} <ExternalLink className="h-3.5 w-3.5" /></a></CardContent></Card>}
          {item.supportedGovernorates.length > 0 && <Card><CardHeader><CardTitle className="text-base">المحافظات المشمولة</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-1.5">{item.supportedGovernorates.map((g, i) => <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">{g}</span>)}</div></CardContent></Card>}
          {item.notes && <Card><CardHeader><CardTitle className="text-base">ملاحظات</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent></Card>}
        </div>
      </div>
      <div className="mt-6"><Button variant="outline" onClick={() => router.push("/admin/knowledge-center/services")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>
    </div>
  );
}
