"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import { Settings, DollarSign, Scale, Shield, Save, Loader2 } from "lucide-react";

interface CourtFeeSettings {
  enabled: boolean;
  defaultCurrency: string;
  minFee: number;
  maxFee: number;
  percentageThreshold: number;
  feeCalculationMethod: string;
  enableReductions: boolean;
  reductionPercent: number;
  enableExemptions: boolean;
  socialSecurityExemption: boolean;
  governmentExemption: boolean;
}

const DEFAULT_SETTINGS: CourtFeeSettings = {
  enabled: true, defaultCurrency: "IQD", minFee: 5000, maxFee: 500000,
  percentageThreshold: 100000000, feeCalculationMethod: "percentage",
  enableReductions: true, reductionPercent: 50, enableExemptions: true,
  socialSecurityExemption: true, governmentExemption: true,
};

export default function CourtFeeSettingsPage() {
  const [settings, setSettings] = useState<CourtFeeSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/court-fees/settings").then((r) => r.json()).then((d) => { setSettings(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const update = <K extends keyof CourtFeeSettings>(key: K, value: CourtFeeSettings[K]) => setSettings((p) => ({ ...p, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/court-fees/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      toast.success(res.ok ? "تم حفظ الإعدادات" : "فشل الحفظ");
    } catch { toast.error("فشل الاتصال"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات حاسبة الرسوم القضائية</h1>
          <p className="text-sm text-muted-foreground">ضبط الإعدادات العامة لحاسبة رسوم المحاكم</p>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Save className="ml-2 size-4" />} حفظ</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="size-5" /> الإعدادات العامة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.enabled} onChange={(e) => update("enabled", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">تفعيل الحاسبة</p><p className="text-xs text-muted-foreground">إظهار أو إخفاء حاسبة الرسوم</p></div>
            </label>
            <div>
              <label className="mb-1.5 block text-sm font-medium">طريقة الحساب</label>
              <select value={settings.feeCalculationMethod} onChange={(e) => update("feeCalculationMethod", e.target.value)} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm">
                <option value="percentage">نسبة مئوية</option>
                <option value="fixed">مبلغ ثابت</option>
                <option value="tiered">تصاعدي</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="size-5" /> حدود الرسوم</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">الحد الأدنى للرسوم</label>
              <input type="number" min={0} value={settings.minFee} onChange={(e) => update("minFee", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">الحد الأقصى للرسوم</label>
              <input type="number" min={0} value={settings.maxFee} onChange={(e) => update("maxFee", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">عتبة النسبة المئوية</label>
              <input type="number" min={0} value={settings.percentageThreshold} onChange={(e) => update("percentageThreshold", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
              <p className="mt-1 text-xs text-muted-foreground">المبلغ الذي تبدأ عنده النسبة المئوية</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Scale className="size-5" /> الخصومات</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.enableReductions} onChange={(e) => update("enableReductions", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">تفعيل الخصومات</p><p className="text-xs text-muted-foreground">السماح بخصومات على الرسوم</p></div>
            </label>
            {settings.enableReductions && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">نسبة الخصم (%)</label>
                <input type="number" min={0} max={100} value={settings.reductionPercent} onChange={(e) => update("reductionPercent", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="size-5" /> الإعفاءات</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.enableExemptions} onChange={(e) => update("enableExemptions", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">تفعيل الإعفاءات</p><p className="text-xs text-muted-foreground">السماح بإعفاء من الرسوم</p></div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.socialSecurityExemption} onChange={(e) => update("socialSecurityExemption", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">إعفاء الضمان الاجتماعي</p></div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.governmentExemption} onChange={(e) => update("governmentExemption", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">إعفاء الجهات الحكومية</p></div>
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
