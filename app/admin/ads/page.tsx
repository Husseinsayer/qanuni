"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Megaphone, Settings2, Zap } from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { useAdminContext } from "../admin-context";
import { pushActivityLog } from "@/lib/admin-data";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-accent" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-0" : "-translate-x-5"
        }`}
      />
    </button>
  );
}

function Row({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function AdsSettingsPage() {
  const { data, update } = useAdminContext();
  const adsense = data.adsense;
  const perf = data.performance;

  const saveAdsense = (patch: Partial<typeof adsense>) => {
    const prev = { ...adsense };
    const next = { ...adsense, ...patch };
    update("adsense", next);
    const entry = pushActivityLog({
      entity: "adsense",
      entityId: "global",
      actor: "مدير النظام",
      action: "update",
      oldValues: prev,
      newValues: next,
    });
    update("activityLog", [entry, ...data.activityLog]);
  };

  const savePerf = (patch: Partial<typeof perf>) => {
    const prev = { ...perf };
    const next = { ...perf, ...patch };
    update("performance", next);
    const entry = pushActivityLog({
      entity: "settings",
      entityId: "performance",
      actor: "مدير النظام",
      action: "update",
      oldValues: prev,
      newValues: next,
    });
    update("activityLog", [entry, ...data.activityLog]);
  };

  const pageTargets: { key: keyof typeof adsense.pages; label: string }[] = [
    { key: "home", label: "الرئيسية" },
    { key: "articles", label: "صفحات المقالات" },
    { key: "categories", label: "التصنيفات" },
    { key: "search", label: "نتائج البحث" },
    { key: "lawyers", label: "المحامون" },
    { key: "laws", label: "القوانين" },
    { key: "services", label: "الخدمات" },
    { key: "contact", label: "اتصل بنا" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Megaphone className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold">إعدادات الإعلانات</h1>
      </div>

      {/* AdSense settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-accent" />
            إعدادات Google AdSense
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row
            title="تفعيل/تعطيل AdSense بالكامل"
            desc="عند التفعيل سيتم عرض إعلانات AdSense في المواقع المحددة"
            checked={adsense.enabled}
            onChange={(v) => {
              saveAdsense({ enabled: v });
              toast.info(v ? "تم تفعيل AdSense" : "تم تعطيل AdSense");
            }}
          />

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              كود التحقق (Verification)
            </label>
            <textarea
              value={adsense.verificationCode}
              onChange={(e) => saveAdsense({ verificationCode: e.target.value })}
              dir="ltr"
              rows={3}
              placeholder='<meta name="google-adsense-account" content="ca-pub-..." />'
              className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              كود Auto Ads
            </label>
            <textarea
              value={adsense.autoAdsCode}
              onChange={(e) => saveAdsense({ autoAdsCode: e.target.value })}
              dir="ltr"
              rows={4}
              placeholder='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..." crossorigin="anonymous"></script>'
              className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <Row
            title="تفعيل الإعلانات التلقائية"
            desc="يسمح لـ AdSense باختيار أفضل الأماكن تلقائياً"
            checked={adsense.autoAdsEnabled}
            onChange={(v) => {
              saveAdsense({ autoAdsEnabled: v });
              toast.info(v ? "تم تفعيل الإعلانات التلقائية" : "تم تعطيلها");
            }}
          />

          <div className="rounded-xl border border-border p-4">
            <p className="mb-3 text-sm font-semibold">
              اختيار الصفحات التي يظهر فيها AdSense
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {pageTargets.map((pt) => (
                <label
                  key={pt.key}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={adsense.pages[pt.key]}
                    onChange={(e) =>
                      saveAdsense({
                        pages: { ...adsense.pages, [pt.key]: e.target.checked },
                      })
                    }
                    className="size-4 accent-accent"
                  />
                  {pt.label}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            تحسينات الأداء
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row
            title="Lazy Loading للإعلانات"
            desc="تحميل الإعلانات عند الحاجة فقط"
            checked={perf.lazyLoad}
            onChange={(v) => savePerf({ lazyLoad: v })}
          />
          <Row
            title="تأخير تحميل الإعلانات حتى التمرير"
            desc="تحميل الإعلان عند اقترابه من viewport"
            checked={perf.loadOnScroll}
            onChange={(v) => savePerf({ loadOnScroll: v })}
          />
          <Row
            title="تحميل البنرات بصيغة WebP"
            desc="تقليل حجم الصور لتسريع التحميل"
            checked={perf.webpBanners}
            onChange={(v) => savePerf({ webpBanners: v })}
          />
          <Row
            title="تأخير تحميل JavaScript غير الضروري"
            desc="تأجيل السكربتات غير الحرجة"
            checked={perf.deferNonCriticalJs}
            onChange={(v) => savePerf({ deferNonCriticalJs: v })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
