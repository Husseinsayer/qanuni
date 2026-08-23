"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Zap,
  Shield,
  Smartphone,
  Layout,
  BarChart3,
} from "lucide-react";
import {
  getAdminData,
  saveAdminData,
  type AdminPerformance,
} from "@/lib/admin-data";

export default function AdsSettingsPage() {
  const [data, setData] = useState(getAdminData);
  const [saved, setSaved] = useState(false);

  const perf = data.performance;
  const adsense = data.adsense;

  const updatePerf = useCallback((patch: Partial<AdminPerformance>) => {
    const updated = { ...perf, ...patch };
    saveAdminData({ ...data, performance: updated });
    setData({ ...data, performance: updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [data, perf]);

  const updateAdSense = useCallback((patch: Partial<typeof adsense>) => {
    const updated = { ...adsense, ...patch };
    saveAdminData({ ...data, adsense: updated });
    setData({ ...data, adsense: updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [data, adsense]);

  const resetDefaults = useCallback(() => {
    const fresh = getAdminData();
    saveAdminData({ ...data, performance: fresh.performance, adsense: fresh.adsense });
    setData({ ...data, performance: fresh.performance, adsense: fresh.adsense });
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات الإعلانات</h1>
          <p className="text-sm text-muted-foreground mt-1">التحكم العام في سلوك الإعلانات والأداء</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />العودة
          </Link>
          <button onClick={resetDefaults} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-muted">
            <RotateCcw className="w-4 h-4" />إعادة ضبط
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-emerald-600 text-sm animate-in fade-in">
              <Save className="w-4 h-4" />تم الحفظ
            </span>
          )}
        </div>
      </div>

      {/* Master Switches */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Zap className="w-5 h-5" />المفاتيح الرئيسية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToggleRow
            label="تفعيل الإعلانات"
            desc="إظهار جميع الإعلانات في الموقع"
            enabled={adsense.enabled}
            onChange={() => updateAdSense({ enabled: !adsense.enabled })}
          />
          <ToggleRow
            label="الإعلانات التلقائية (Auto Ads)"
            desc="السماح لـ AdSense بوضع الإعلانات تلقائياً"
            enabled={adsense.autoAdsEnabled}
            onChange={() => updateAdSense({ autoAdsEnabled: !adsense.autoAdsEnabled })}
          />
          <ToggleRow
            label="التحميل الكسول (Lazy Load)"
            desc="تحميل الإعلانات عند الاقتراب من الشاشة"
            enabled={perf.lazyLoad}
            onChange={() => updatePerf({ lazyLoad: !perf.lazyLoad })}
          />
          <ToggleRow
            label="التحميل عند التمرير"
            desc="تحميل الإعلانات عند التمرير لأسفل الصفحة"
            enabled={perf.loadOnScroll}
            onChange={() => updatePerf({ loadOnScroll: !perf.loadOnScroll })}
          />
          <ToggleRow
            label="الصور بصيغة WebP"
            desc="تحويل بنرات الإعلانات إلى WebP"
            enabled={perf.webpBanners}
            onChange={() => updatePerf({ webpBanners: !perf.webpBanners })}
          />
          <ToggleRow
            label="تأخير السكريبتات غير الحرجة"
            desc=" defer للسكريبتات الثانوية"
            enabled={perf.deferNonCriticalJs}
            onChange={() => updatePerf({ deferNonCriticalJs: !perf.deferNonCriticalJs })}
          />
        </div>
      </div>

      {/* Limits & Display */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Layout className="w-5 h-5" />الحدود والعرض</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">حد الإعلانات لكل صفحة</label>
            <input
              type="number"
              min={1}
              max={20}
              value={perf.maxAdsPerPage}
              onChange={(e) => updatePerf({ maxAdsPerPage: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">فترة التحديث (ثانية)</label>
            <input
              type="number"
              min={0}
              max={300}
              value={perf.adRefreshInterval}
              onChange={(e) => updatePerf({ adRefreshInterval: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">0 = بدون تحديث تلقائي</p>
          </div>
        </div>
      </div>

      {/* Sticky Ads */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Smartphone className="w-5 h-5" />الإعلانات الثابتة (Sticky)</h2>
        <ToggleRow
          label="تفعيل الإعلانات الثابتة"
          desc="شريط إعلاني ثابت أسفل الشاشة على الجوال"
          enabled={perf.stickyAdsEnabled}
          onChange={() => updatePerf({ stickyAdsEnabled: !perf.stickyAdsEnabled })}
        />
        {perf.stickyAdsEnabled && (
          <div>
            <label className="block text-sm font-medium mb-1">ارتفاع الشريط (بكسل)</label>
            <input
              type="number"
              min={40}
              max={120}
              value={perf.stickyAdsHeight}
              onChange={(e) => updatePerf({ stickyAdsHeight: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
        )}
      </div>

      {/* Consent */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Shield className="w-5 h-5" />الخصوصية والموافقة</h2>
        <ToggleRow
          label="متطلبات الموافقة (GDPR)"
          desc="عرض شريط الموافقة قبل تحميل الإعلانات"
          enabled={perf.consentRequired}
          onChange={() => updatePerf({ consentRequired: !perf.consentRequired })}
        />
      </div>

      {/* Ad Size Optimization */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5" />تحسين الأحجام</h2>
        <ToggleRow
          label="تحسين أحجام الإعلانات"
          desc="السماح لـ AdSense باختيار الحجم الأفضل تلقائياً"
          enabled={adsense.adSizeOptimization}
          onChange={() => updateAdSense({ adSizeOptimization: !adsense.adSizeOptimization })}
        />
        <div>
          <label className="block text-sm font-medium mb-1">الحد الأقصى لارتفاع الإعلان (Auto Ads)</label>
          <input
            type="number"
            min={0}
            max={600}
            value={adsense.autoAdsMaxHeight}
            onChange={(e) => updateAdSense({ autoAdsMaxHeight: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">0 = بدون حد</p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, enabled, onChange }: { label: string; desc: string; enabled: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl border">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${enabled ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "right-0.5" : "right-[22px]"}`} />
      </button>
    </div>
  );
}
