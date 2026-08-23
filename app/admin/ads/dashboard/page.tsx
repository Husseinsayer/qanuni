"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Megaphone,
  Eye,
  MousePointerClick,
  TrendingUp,
  LayoutGrid,
  Settings,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  getAdminData,
  adCtr,
  isAdActive,
} from "@/lib/admin-data";

export default function AdsDashboardPage() {
  const data = getAdminData();

  const stats = useMemo(() => {
    const ads = data.ads;
    const placements = data.adPlacements;
    const activeAds = ads.filter(isAdActive);
    const totalImpressions = ads.reduce((s, a) => s + a.stats.impressions, 0);
    const totalClicks = ads.reduce((s, a) => s + a.stats.clicks, 0);
    const enabledPlacements = placements.filter((p) => p.enabled).length;
    const adsenseEnabled = data.adsense.enabled;

    const topAds = [...ads]
      .sort((a, b) => b.stats.impressions - a.stats.impressions)
      .slice(0, 5);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const dailyTotals = last7Days.map((date) => {
      let impressions = 0;
      let clicks = 0;
      ads.forEach((a) => {
        const day = a.stats.dailyStats?.find((d) => d.date === date);
        if (day) {
          impressions += day.impressions;
          clicks += day.clicks;
        }
      });
      return { date, impressions, clicks };
    });

    return {
      totalAds: ads.length,
      activeAds: activeAds.length,
      totalImpressions,
      totalClicks,
      ctr: adCtr({ impressions: totalImpressions, clicks: totalClicks, ctr: 0 }),
      enabledPlacements,
      totalPlacements: placements.length,
      adsenseEnabled,
      topAds,
      dailyTotals,
    };
  }, [data]);

  const cards = [
    { label: "إجمالي الإعلانات", value: stats.totalAds, sub: `${stats.activeAds} نشط`, icon: Megaphone, color: "text-blue-600" },
    { label: "الظهور", value: stats.totalImpressions.toLocaleString("ar-IQ"), icon: Eye, color: "text-emerald-600" },
    { label: "النقرات", value: stats.totalClicks.toLocaleString("ar-IQ"), icon: MousePointerClick, color: "text-amber-600" },
    { label: "معدل النقر", value: `${stats.ctr}%`, icon: TrendingUp, color: "text-violet-600" },
  ];

  const maxImpressions = Math.max(...stats.dailyTotals.map((d) => d.impressions), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة الإعلانات</h1>
          <p className="text-sm text-muted-foreground mt-1">نظرة عامة على أداء الإعلانات والإعدادات</p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold mt-1">{c.value}</p>
                {c.sub && <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>}
              </div>
              <div className={`p-2 rounded-lg bg-muted/50 ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold mb-4">الظهور والنقرات — آخر 7 أيام</h2>
          <div className="space-y-2">
            {stats.dailyTotals.map((day) => (
              <div key={day.date} className="flex items-center gap-3 text-xs">
                <span className="w-20 text-muted-foreground shrink-0">{day.date.slice(5)}</span>
                <div className="flex-1 flex gap-1 items-center">
                  <div className="h-4 rounded bg-emerald-500/80" style={{ width: `${(day.impressions / maxImpressions) * 100}%`, minWidth: day.impressions > 0 ? 4 : 0 }} />
                  <div className="h-4 rounded bg-amber-500/80" style={{ width: `${(day.clicks / maxImpressions) * 100}%`, minWidth: day.clicks > 0 ? 4 : 0 }} />
                </div>
                <span className="w-16 text-right text-muted-foreground">{day.impressions.toLocaleString("ar-IQ")} ظهور</span>
                <span className="w-12 text-right text-muted-foreground">{day.clicks.toLocaleString("ar-IQ")} نقر</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/80 inline-block" />ظهور</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/80 inline-block" />نقرات</span>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">الحالة</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>AdSense</span>
                {stats.adsenseEnabled ? (
                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-4 h-4" />مفعّل</span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground"><XCircle className="w-4 h-4" />معطّل</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>أماكن الإعلانات</span>
                <span className="text-muted-foreground">{stats.enabledPlacements}/{stats.totalPlacements}</span>
              </div>
              {stats.activeAds < stats.totalAds && (
                <div className="flex items-center gap-1 text-amber-600 text-xs mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {stats.totalAds - stats.activeAds} إعلان معطّل أو منتهي الصلاحية
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">روابط سريعة</h2>
            <div className="space-y-1.5">
              <Link href="/admin/ads/campaigns" className="flex items-center gap-2 text-sm hover:bg-muted rounded-lg px-2 py-1.5 transition-colors">
                <Megaphone className="w-4 h-4" />الحملات الإعلانية
              </Link>
              <Link href="/admin/ads/placements" className="flex items-center gap-2 text-sm hover:bg-muted rounded-lg px-2 py-1.5 transition-colors">
                <LayoutGrid className="w-4 h-4" />أماكن الإعلانات
              </Link>
              <Link href="/admin/ads/codes" className="flex items-center gap-2 text-sm hover:bg-muted rounded-lg px-2 py-1.5 transition-colors">
                <BarChart3 className="w-4 h-4" />أكواد الإعلانات
              </Link>
              <Link href="/admin/ads/settings" className="flex items-center gap-2 text-sm hover:bg-muted rounded-lg px-2 py-1.5 transition-colors">
                <Settings className="w-4 h-4" />إعدادات الإعلانات
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Ads */}
      <div className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3">أفضل الإعلانات أداءً</h2>
        {stats.topAds.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد إعلانات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-right py-2 px-3 font-medium">الاسم</th>
                  <th className="text-right py-2 px-3 font-medium">النوع</th>
                  <th className="text-right py-2 px-3 font-medium">الظهور</th>
                  <th className="text-right py-2 px-3 font-medium">النقرات</th>
                  <th className="text-right py-2 px-3 font-medium">CTR</th>
                  <th className="text-right py-2 px-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {stats.topAds.map((ad) => (
                  <tr key={ad.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 px-3 font-medium">{ad.name}</td>
                    <td className="py-2 px-3 text-muted-foreground">{ad.adType === "custom-gradient" ? "مخصص" : ad.adType === "adsense" ? "AdSense" : ad.adType === "html" ? "HTML" : ad.adType}</td>
                    <td className="py-2 px-3">{ad.stats.impressions.toLocaleString("ar-IQ")}</td>
                    <td className="py-2 px-3">{ad.stats.clicks.toLocaleString("ar-IQ")}</td>
                    <td className="py-2 px-3">{adCtr(ad.stats)}%</td>
                    <td className="py-2 px-3">
                      {isAdActive(ad) ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" />نشط</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground"><XCircle className="w-3.5 h-3.5" />معطّل</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
