"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, MessageCircle, CalendarCheck, Phone, TrendingUp, BarChart3, Star, Users, Activity, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getMyStats, getMyLawyerProfile, getMyReviews, getMyServices, getMyArticles, type LawyerStats } from "@/lib/lawyer-profiles";
import { getUserSession } from "@/lib/user-auth";

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<LawyerStats | null>(null);
  const [servicesCount, setServicesCount] = useState(0);
  const [articlesCount, setArticlesCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);

  useEffect(() => {
    const s = getUserSession();
    if (!s || s.role !== "lawyer") { router.push("/auth/login"); return; }
    setStats(getMyStats());
    setServicesCount(getMyServices().length);
    setArticlesCount(getMyArticles().length);
    setReviewsCount(getMyReviews().length);
  }, [router]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const bigStats = [
    { label: "مشاهدات الملف", value: stats.totalViews, icon: Eye, color: "text-blue-600", bg: "bg-blue-100/80", change: +12 },
    { label: "الرسائل", value: stats.totalMessages, icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-100/80", change: +5 },
    { label: "الحجوزات", value: stats.totalBookings, icon: CalendarCheck, color: "text-purple-600", bg: "bg-purple-100/80", change: +8 },
    { label: "المكالمات", value: stats.totalCalls, icon: Phone, color: "text-rose-600", bg: "bg-rose-100/80", change: -2 },
    { label: "اكتمال الملف", value: `${getMyLawyerProfile() ? "%" : "0%"}`, icon: Activity, color: "text-amber-600", bg: "bg-amber-100/80" },
  ];

  const maxViews = Math.max(...stats.weeklyViews, 1);
  const maxMsgs = Math.max(...stats.weeklyMessages, 1);
  const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">التحليلات والإحصائيات</h1>
        <p className="mt-1 text-muted-foreground">مشاهدات، رسائل، حجوزات، ومؤشرات الأداء</p>
      </div>

      {/* Big Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {bigStats.map((s, i) => (
          <Card key={i} className="border-0 shadow-soft overflow-hidden group hover:shadow-premium transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-xl p-2.5 transition-transform group-hover:scale-110 duration-300", s.bg)}>
                  <s.icon className={cn("size-5", s.color)} />
                </div>
                {"change" in s && s.change !== undefined && (
                  <span className={cn("flex items-center gap-0.5 text-[10px] font-bold", s.change >= 0 ? "text-success" : "text-danger")}>
                    {s.change >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                    {Math.abs(s.change)}%
                  </span>
                )}
              </div>
              <p className="mt-3 text-2xl font-extrabold">{typeof s.value === "number" ? s.value : s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Chart */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="size-5 text-accent" />
            النشاط الأسبوعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Views Chart */}
            <div>
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Eye className="size-4 text-blue-500" /> المشاهدات
              </p>
              <div className="flex items-end justify-between gap-2 h-24">
                {stats.weeklyViews.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground">{val}</span>
                    <div
                      className="w-full rounded-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500 hover:from-blue-600"
                      style={{ height: `${(val / maxViews) * 100}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">{days[i].slice(0, 2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages Chart */}
            <div>
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="size-4 text-emerald-500" /> الرسائل
              </p>
              <div className="flex items-end justify-between gap-2 h-20">
                {stats.weeklyMessages.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground">{val}</span>
                    <div
                      className="w-full rounded-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500 hover:from-emerald-600"
                      style={{ height: `${(val / maxMsgs) * 100}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">{days[i].slice(0, 2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* KPIs */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="size-5 text-accent" />
              مؤشرات الأداء
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "المشاهدات", value: stats.totalViews, max: 200, color: "bg-blue-500" },
              { label: "الرسائل", value: stats.totalMessages, max: 50, color: "bg-emerald-500" },
              { label: "الحجوزات", value: stats.totalBookings, max: 30, color: "bg-purple-500" },
              { label: "المكالمات", value: stats.totalCalls, max: 20, color: "bg-rose-500" },
              { label: "التقييمات", value: reviewsCount, max: 20, color: "bg-amber-500" },
            ].map((kpi) => {
              const pct = Math.min((kpi.value / kpi.max) * 100, 100);
              return (
                <div key={kpi.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{kpi.label}</span>
                    <span className="text-muted-foreground">{kpi.value} / {kpi.max}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", kpi.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Content Overview */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-accent" />
              نظرة عامة على المحتوى
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "الخدمات المقدمة", count: servicesCount, icon: BarChart3, bg: "bg-blue-100", color: "text-blue-600" },
              { label: "المقالات المنشورة", count: articlesCount, icon: Users, bg: "bg-emerald-100", color: "text-emerald-600" },
              { label: "التقييمات", count: reviewsCount, icon: Star, bg: "bg-amber-100", color: "text-amber-600" },
              { label: "المعدل التراكمي", count: reviewsCount > 0 ? `${(getMyReviews().reduce((s, r) => s + r.rating, 0) / reviewsCount).toFixed(1)} / 5` : "—", icon: TrendingUp, bg: "bg-purple-100", color: "text-purple-600" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-4">
                <div className={cn("rounded-xl p-2.5", item.bg)}>
                  <item.icon className={cn("size-5", item.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-extrabold">{item.count}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
