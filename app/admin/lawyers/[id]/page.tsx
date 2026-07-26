"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../../admin-context";
import { ArrowRight, Pencil, Star, ShieldCheck, Eye, EyeOff, MapPin, Award, Phone, MessageCircle, Globe, GraduationCap, DollarSign, BadgeCheck } from "lucide-react";
import { toArabicDigits } from "@/lib/utils";

export default function LawyerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, update } = useAdminContext();
  const lawyer = data.lawyers.find((l) => l.id === id);

  if (!lawyer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-lg text-muted-foreground">لم يتم العثور على المحامي</p>
        <Link href="/admin/lawyers">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4" />
            العودة إلى المحامين
          </Button>
        </Link>
      </div>
    );
  }

  const toggleVerified = () => {
    update(
      "lawyers",
      data.lawyers.map((l) => (l.id === id ? { ...l, verified: !l.verified } : l))
    );
  };

  const toggleOnline = () => {
    update(
      "lawyers",
      data.lawyers.map((l) => (l.id === id ? { ...l, online: !l.online } : l))
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/lawyers" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4" />
          العودة إلى المحامين
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant={lawyer.verified ? "primary" : "outline"}
            size="sm"
            onClick={toggleVerified}
            className={lawyer.verified ? "bg-gold hover:bg-gold/90 text-[#1F2937]" : ""}
          >
            <BadgeCheck className="h-4 w-4" />
            {lawyer.verified ? "إلغاء التوثيق" : "توثيق المحامي"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleOnline}
          >
            {lawyer.online ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {lawyer.online ? "تعطيل الاتصال" : "تفعيل الاتصال"}
          </Button>
          <Link href={`/admin/lawyers/${lawyer.id}/edit`}>
            <Button size="sm">
              <Pencil className="h-4 w-4" />
              تعديل
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${lawyer.hue} text-lg font-bold text-white shadow-lg`}>
              {lawyer.initials || lawyer.name.slice(0, 2)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{lawyer.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{lawyer.city}</span>
                <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />{lawyer.specialization}</span>
                <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{toArabicDigits(lawyer.experience)} سنة خبرة</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {lawyer.verified && <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"><ShieldCheck className="h-3 w-3" />موثق</span>}
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${lawyer.online ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {lawyer.online ? <><Eye className="h-3 w-3" />متصل</> : <><EyeOff className="h-3 w-3" />غير متصل</>}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <Star className="mx-auto mb-1 h-4 w-4 text-amber-400" />
              <p className="text-lg font-bold">{lawyer.rating}</p>
              <p className="text-xs text-muted-foreground">تقييم</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <MessageCircle className="mx-auto mb-1 h-4 w-4 text-accent" />
              <p className="text-lg font-bold">{toArabicDigits(lawyer.reviews)}</p>
              <p className="text-xs text-muted-foreground">تقييمات</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <DollarSign className="mx-auto mb-1 h-4 w-4 text-green-500" />
              <p className="text-lg font-bold">{toArabicDigits(lawyer.price)}</p>
              <p className="text-xs text-muted-foreground">سعر الجلسة</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <Globe className="mx-auto mb-1 h-4 w-4 text-blue-500" />
              <p className="text-lg font-bold">{lawyer.languages.length}</p>
              <p className="text-xs text-muted-foreground">لغات</p>
            </div>
          </div>

          {lawyer.bio && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">نبذة</h3>
              <p className="text-sm leading-relaxed">{lawyer.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">اللغات</h3>
              <div className="flex flex-wrap gap-1.5">
                {lawyer.languages.map((lang) => (
                  <span key={lang} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{lang}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">التواصل</h3>
              <div className="space-y-1 text-sm">
                {lawyer.whatsapp && <p className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-green-500" />{lawyer.whatsapp}</p>}
                {lawyer.telegram && <p className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-blue-500" />{lawyer.telegram}</p>}
                {!lawyer.whatsapp && !lawyer.telegram && <p className="text-muted-foreground">لا توجد معلومات تواصل</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
