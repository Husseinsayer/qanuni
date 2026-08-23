"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../../admin-context";
import { ArrowRight, Pencil, Star, Eye, EyeOff, MapPin, Phone, MessageCircle, Mail, BadgeCheck, Trophy, DollarSign } from "lucide-react";

export default function LawyerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, update } = useAdminContext();
  const [dbLawyer, setDbLawyer] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Try adminData first, then fetch from DB
  const adminLawyer = data.lawyers.find((l) => l.id === id);

  React.useEffect(() => {
    if (adminLawyer) {
      setLoading(false);
      return;
    }
    // Fetch from database
    fetch(`/api/lawyer/${id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setDbLawyer(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, adminLawyer]);

  const lawyer = adminLawyer || (dbLawyer ? {
    id: dbLawyer.id,
    name: dbLawyer.name || dbLawyer.user?.name || "",
    city: dbLawyer.city || "",
    specialization: dbLawyer.specialization || "",
    experience: dbLawyer.experience || 0,
    rating: dbLawyer.rating || 0,
    reviews: dbLawyer.reviewCount || 0,
    verified: dbLawyer.verified || false,
    price: dbLawyer.price || 0,
    online: dbLawyer.online || false,
    gender: dbLawyer.gender || "male",
    bio: dbLawyer.bio || "",
    initials: dbLawyer.initials || "",
    hue: dbLawyer.hue || "from-blue-600 to-indigo-700",
    whatsapp: dbLawyer.whatsapp || "",
    telegram: dbLawyer.telegram || "",
    facebook: dbLawyer.facebook || "",
    instagram: dbLawyer.instagram || "",
    photoUrl: dbLawyer.photoUrl || "",
    points: dbLawyer.points || 0,
    email: dbLawyer.user?.email || "",
    languages: (() => { try { return JSON.parse(dbLawyer.languages || "[]"); } catch { return ["العربية"]; } })(),
  } : null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

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

  const points = (lawyer as any).points || 0;
  const rewardTier = points >= 200 ? { nameAr: "خبير قانوني", color: "#10B981" }
    : points >= 100 ? { nameAr: "ناشر متميز", color: "#EF4444" }
    : points >= 60 ? { nameAr: "ناشر محترف", color: "#F59E0B" }
    : points >= 30 ? { nameAr: "ناشر نشط", color: "#8B5CF6" }
    : points >= 10 ? { nameAr: "ناشر", color: "#3B82F6" }
    : { nameAr: "مبتدئ", color: "#6B7280" };

  const toggleVerified = () => {
    if (adminLawyer) {
      update(
        "lawyers",
        data.lawyers.map((l) => (l.id === id ? { ...l, verified: !l.verified } : l))
      );
    }
  };

  const toggleOnline = () => {
    if (adminLawyer) {
      update(
        "lawyers",
        data.lawyers.map((l) => (l.id === id ? { ...l, online: !l.online } : l))
      );
    }
  };

  const langs: string[] = (() => {
    if (Array.isArray(lawyer.languages)) return lawyer.languages;
    try { return JSON.parse((lawyer as any).languages || "[]"); } catch { return ["العربية"]; }
  })();

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
            {lawyer.photoUrl ? (
              <img src={lawyer.photoUrl} alt={lawyer.name} className="h-20 w-20 rounded-2xl object-cover" />
            ) : (
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${lawyer.hue} text-2xl font-extrabold text-white`}>
                {lawyer.initials}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold">{lawyer.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {lawyer.city}</span>
                <span className="flex items-center gap-1"><DollarSign className="size-3.5" /> {lawyer.specialization}</span>
                <span className="flex items-center gap-1"><Star className="size-3.5 text-amber-500" /> {lawyer.rating}</span>
                <span className="flex items-center gap-1"><Eye className="size-3.5" /> {lawyer.experience} سنة</span>
              </div>
            </div>
          </div>

          {/* Points & Rewards */}
          <div className="mb-6 rounded-xl border border-border bg-gradient-to-l from-primary/5 to-accent/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="size-5 text-primary" />
              <h3 className="font-bold">النقاط والمكافآت</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg bg-background p-3 text-center">
                <p className="text-2xl font-extrabold text-primary">{points}</p>
                <p className="text-xs text-muted-foreground">النقاط</p>
              </div>
              <div className="rounded-lg bg-background p-3 text-center">
                <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: rewardTier.color }}>
                  {rewardTier.nameAr}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">الشارة</p>
              </div>
              <div className="rounded-lg bg-background p-3 text-center">
                <p className="text-2xl font-extrabold">{lawyer.reviews || 0}</p>
                <p className="text-xs text-muted-foreground">التقييمات</p>
              </div>
              <div className="rounded-lg bg-background p-3 text-center">
                <p className="text-2xl font-extrabold">{lawyer.price || 0}</p>
                <p className="text-xs text-muted-foreground">السعر (ألف)</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">المدينة</p>
                <p className="mt-1 font-semibold">{lawyer.city}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">التخصص</p>
                <p className="mt-1 font-semibold">{lawyer.specialization}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">الخبرة</p>
                <p className="mt-1 font-semibold">{lawyer.experience} سنة</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">اللغات</p>
                <p className="mt-1 font-semibold">{langs.join("، ")}</p>
              </div>
            </div>

            {lawyer.bio && (
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">النبذة التعريفية</p>
                <p className="mt-2 leading-relaxed">{lawyer.bio}</p>
              </div>
            )}

            {(lawyer.whatsapp || lawyer.telegram || lawyer.facebook || lawyer.instagram || lawyer.email) && (
              <div className="rounded-xl border border-border p-4">
                <p className="mb-2 text-sm text-muted-foreground">معلومات التواصل</p>
                <div className="flex flex-wrap gap-2">
                  {lawyer.email && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                      <Mail className="size-3" /> {lawyer.email}
                    </span>
                  )}
                  {lawyer.whatsapp && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                      <Phone className="size-3" /> واتساب
                    </span>
                  )}
                  {lawyer.telegram && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
                      <MessageCircle className="size-3" /> تلغرام
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}