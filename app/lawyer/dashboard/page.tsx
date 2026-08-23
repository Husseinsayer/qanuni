"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Eye, MessageCircle, Star, Edit3, BarChart3,
  TrendingUp, Users, Clock, DollarSign, CheckCircle2,
  AlertCircle, ChevronLeft, Activity, CreditCard, Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LawyerProfile {
  id: string;
  name: string;
  slug: string;
  city: string;
  specialization: string;
  experience: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  online: boolean;
  price: number;
  gender: string;
  languages: string;
  bio: string;
  initials: string;
  hue: string;
  whatsapp: string;
  telegram: string;
  facebook: string;
  instagram: string;
}

interface Stats {
  totalViews: number;
  totalMessages: number;
  averageRating: number;
  totalReviews: number;
  weeklyViews: number[];
}

export default function LawyerDashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch("/api/lawyer/profile"),
          fetch("/api/lawyer/stats"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.lawyer);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      } catch {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-muted-foreground/40" />
          <h2 className="text-lg font-bold">لم يتم العثور على الملف الشخصي</h2>
          <p className="mt-2 text-sm text-muted-foreground">يرجى إكمال ملفك الشخصي أولاً</p>
          <Link href="/lawyer/profile" className="mt-4 inline-block">
            <Button variant="accent">إعداد الملف الشخصي</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const weeklyViews = stats?.weeklyViews || Array(7).fill(0);
  const days = ["سبت", "أحد", "إثن", "ثلث", "أرب", "خمي", "جمعة"];

  const statCards = [
    { label: "مشاهدات الملف", value: stats?.totalViews || 0, icon: Eye, color: "text-blue-600", bg: "bg-blue-100/80", change: "+12%" },
    { label: "الرسائل", value: stats?.totalMessages || 0, icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-100/80", change: "+5%" },
    { label: "التقييم", value: stats?.averageRating?.toFixed(1) || "0", icon: Star, color: "text-amber-600", bg: "bg-amber-100/80" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold">مرحباً، {session?.user?.name}</h1>
            {profile.online && (
              <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                متصل
              </span>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            لوحة تحكمك — إدارة ملفك وخدماتك وتحليلاتك في مكان واحد
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/lawyers/${profile.slug || profile.id}`} target="_blank">
            <Button variant="outline" className="gap-2 border-accent/30 text-accent hover:bg-accent/5">
              <Eye className="size-4" />
              عرض الملف العام
            </Button>
          </Link>
          <Link href="/lawyer/profile">
            <Button variant="accent" className="gap-2 shadow-soft">
              <Edit3 className="size-4" />
              تعديل الملف
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="border-0 shadow-soft overflow-hidden group hover:shadow-premium transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-3xl font-extrabold">{card.value}</p>
                  {card.change && (
                    <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-semibold text-success">
                      <TrendingUp className="size-3" />{card.change} هذا الأسبوع
                    </span>
                  )}
                </div>
                <div className={cn("rounded-2xl p-3.5 transition-transform group-hover:scale-110 duration-300", card.bg)}>
                  <card.icon className={cn("size-6", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Completion */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="size-5 text-accent" />
                اكتمال الملف الشخصي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">نسبة الإكمال</span>
                <span className="text-sm font-bold">
                  {Math.round(
                    (profile.name ? 15 : 0) +
                    (profile.city ? 15 : 0) +
                    (profile.specialization ? 15 : 0) +
                    (profile.bio?.length > 10 ? 15 : 0) +
                    (profile.price > 0 ? 15 : 0) +
                    (profile.whatsapp ? 15 : 0) +
                    (profile.verified ? 10 : 0)
                  )}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full gradient-primary transition-all duration-700" style={{
                  width: `${Math.round(
                    (profile.name ? 15 : 0) +
                    (profile.city ? 15 : 0) +
                    (profile.specialization ? 15 : 0) +
                    (profile.bio?.length > 10 ? 15 : 0) +
                    (profile.price > 0 ? 15 : 0) +
                    (profile.whatsapp ? 15 : 0) +
                    (profile.verified ? 10 : 0)
                  )}%`
                }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: "المعلومات الأساسية", done: !!profile.name && !!profile.city && !!profile.specialization },
                  { label: "نبذة شخصية", done: (profile.bio?.length ?? 0) > 10 },
                  { label: "سعر الخدمة", done: (profile.price ?? 0) > 0 },
                  { label: "واتساب", done: !!profile.whatsapp },
                  { label: "تيليغرام", done: !!profile.telegram },
                  { label: "التحقق", done: profile.verified },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    {item.done
                      ? <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                      : <AlertCircle className="size-3.5 shrink-0 text-muted-foreground/40" />
                    }
                    <span className={item.done ? "text-foreground" : "text-muted-foreground/60"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity Chart */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="size-5 text-accent" />
                النشاط الأسبوعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-32">
                {weeklyViews.map((val, i) => {
                  const max = Math.max(...weeklyViews, 1);
                  const height = (val / max) * 100;
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground">{val}</span>
                      <div className="w-full flex flex-col items-center gap-0.5">
                        <div className="w-full rounded-t-sm bg-accent/20" style={{ height: `${height * 0.6}%` }} />
                        <div className="w-3/4 rounded-sm bg-accent/30" style={{ height: `${height * 0.4}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{days[i]}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Card + Quick Actions */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="size-5 text-accent" />
                الملف الشخصي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-soft shrink-0",
                  profile.hue || "from-blue-600 to-indigo-700"
                )}>
                  {profile.initials || profile.name?.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{profile.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{profile.city} · {profile.specialization}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                      <Star className="size-3 fill-amber-400" />{profile.rating || 0}
                    </span>
                    <span className="text-xs text-muted-foreground">({profile.reviewCount || 0} تقييم)</span>
                    <span className="text-xs text-muted-foreground">· {profile.experience || 0} سنة</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm border-t border-border pt-3">
                <div><span className="text-muted-foreground">السعر:</span> <span className="font-bold">{profile.price || 0} ألف</span></div>
                <div><span className="text-muted-foreground">الحالة:</span>
                  <span className={cn("font-bold mr-1", profile.online ? "text-success" : "text-muted-foreground")}>
                    {profile.online ? "متاح" : "غير متاح"}
                  </span>
                </div>
                <div><span className="text-muted-foreground">المقالات:</span> <span className="font-bold">0</span></div>
                <div><span className="text-muted-foreground">الخدمات:</span> <span className="font-bold">0</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="size-5 text-accent" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "تعديل الملف الشخصي", href: "/lawyer/profile", icon: Edit3, desc: "تحديث معلوماتك وصورك" },
                { label: "إدارة الخدمات", href: "/lawyer/services", icon: DollarSign, desc: "تحديد الأسعار والخدمات" },
                { label: "مواعيد العمل", href: "/lawyer/schedule", icon: Clock, desc: "تحديد أوقات العمل" },
                { label: "عرض التحليلات", href: "/lawyer/analytics", icon: BarChart3, desc: "إحصائيات مفصلة" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/40 group cursor-pointer">
                    <div className="rounded-lg bg-accent/10 p-2 text-accent group-hover:bg-accent/20 transition-colors">
                      <item.icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <ChevronLeft className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="size-5 text-accent" />
                الخطة الحالية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-bold text-accent">
                  مجاني
                </span>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: "ملف شخصي أساسي", enabled: true },
                  { label: "عرض في الدليل", enabled: true },
                  { label: "استقبال رسائل", enabled: false },
                  { label: "أولوية في النتائج", enabled: false },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {f.enabled ? (
                      <CheckCircle2 className="size-3.5 shrink-0 text-green-500" />
                    ) : (
                      <AlertCircle className="size-3.5 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={f.enabled ? "text-foreground" : "text-muted-foreground/60"}>{f.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/lawyer/profile">
                <Button size="sm" variant="accent" className="w-full gap-1.5 mt-1">
                  <Crown className="size-3.5" />
                  ترقية الخطة
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
