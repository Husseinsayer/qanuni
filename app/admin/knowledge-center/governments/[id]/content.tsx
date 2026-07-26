"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getItems } from "@/lib/knowledge-center/store";
import { type GovernmentBody } from "@/lib/knowledge-center/types";
import { ChevronRight, ArrowLeft, Phone, Globe, Clock, MapPin } from "lucide-react";

export default function GovernmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<GovernmentBody | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = getItems("governments", true);
    setItem(items.find((i) => i.id === id) ?? null);
    setLoading(false);
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  if (!item) return <div className="py-20 text-center"><p className="mb-4 text-muted-foreground">لم يتم العثور على الجهة</p><Button onClick={() => router.push("/admin/knowledge-center/governments")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/knowledge-center" className="hover:text-accent">مركز المعرفة</Link><ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/knowledge-center/governments" className="hover:text-accent">الجهات الحكومية</Link><ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{item.name}</span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold truncate">{item.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">معلومات الجهة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-xs font-semibold text-muted-foreground">الاختصاص</label><p className="mt-0.5 text-sm">{item.jurisdiction || "غير محدد"}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">المحافظة</label><p className="mt-0.5 text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{item.governorate}</p></div>
            <div><label className="text-xs font-semibold text-muted-foreground">الحالة</label><p className="mt-0.5"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isActive ? "فعال" : "مخفي"}</span></p></div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          {item.description && <Card><CardHeader><CardTitle className="text-base">الوصف</CardTitle></CardHeader><CardContent><p className="text-sm">{item.description}</p></CardContent></Card>}
          {item.address && <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> العنوان</CardTitle></CardHeader><CardContent><p className="text-sm">{item.address}</p></CardContent></Card>}
          {item.phoneNumbers.length > 0 && <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4" /> أرقام الهاتف</CardTitle></CardHeader><CardContent><div className="space-y-1">{item.phoneNumbers.map((p, i) => <p key={i} className="text-sm text-accent font-medium" dir="ltr">{p}</p>)}</div></CardContent></Card>}
          {item.website && <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> الموقع الإلكتروني</CardTitle></CardHeader><CardContent><a href={item.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">{item.website}</a></CardContent></Card>}
          {item.workingHours && <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> أوقات العمل</CardTitle></CardHeader><CardContent><p className="text-sm">{item.workingHours}</p></CardContent></Card>}
          {item.notes && <Card><CardHeader><CardTitle className="text-base">ملاحظات</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent></Card>}
        </div>
      </div>
      <div className="mt-6"><Button variant="outline" onClick={() => router.push("/admin/knowledge-center/governments")}><ArrowLeft className="ml-2 h-4 w-4" /> العودة</Button></div>
    </div>
  );
}
