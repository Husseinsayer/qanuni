"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import { Settings, DollarSign, Baby, Heart, Save, Loader2 } from "lucide-react";

interface AlimonySettings {
  enabled: boolean;
  defaultCurrency: string;
  minAlimonyPercent: number;
  maxAlimonyPercent: number;
  housingAllowancePercent: number;
  educationAllowancePercent: number;
  healthcareAllowancePercent: number;
  enableAutoCalculation: boolean;
  showLegalBasis: boolean;
  defaultMaritalStatus: string;
  childAgeLimit: number;
  childEducationAgeLimit: number;
  monthlyMinWage: number;
}

const DEFAULT_SETTINGS: AlimonySettings = {
  enabled: true, defaultCurrency: "IQD", minAlimonyPercent: 20, maxAlimonyPercent: 50,
  housingAllowancePercent: 30, educationAllowancePercent: 15, healthcareAllowancePercent: 10,
  enableAutoCalculation: true, showLegalBasis: true, defaultMaritalStatus: "married",
  childAgeLimit: 18, childEducationAgeLimit: 25, monthlyMinWage: 500000,
};

export default function AlimonySettingsPage() {
  const [settings, setSettings] = useState<AlimonySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/alimony/settings").then((r) => r.json()).then((d) => { setSettings(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const update = <K extends keyof AlimonySettings>(key: K, value: AlimonySettings[K]) => setSettings((p) => ({ ...p, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/alimony/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      toast.success(res.ok ? "تم حفظ الإعدادات" : "فشل الحفظ");
    } catch { toast.error("فشل الاتصال"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات حاسبة النفقة</h1>
          <p className="text-sm text-muted-foreground">ضبط الإعدادات العامة لحاسبة النفقة والعيد الشرعي</p>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Save className="ml-2 size-4" />} حفظ</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="size-5" /> الإعدادات العامة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.enabled} onChange={(e) => update("enabled", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">تفعيل الحاسبة</p><p className="text-xs text-muted-foreground">إظهار أو إخفاء حاسبة النفقة</p></div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.enableAutoCalculation} onChange={(e) => update("enableAutoCalculation", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">حساب تلقائي</p><p className="text-xs text-muted-foreground">حساب النسبة تلقائياً من الدخل</p></div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.showLegalBasis} onChange={(e) => update("showLegalBasis", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">إظهار الأساس القانوني</p><p className="text-xs text-muted-foreground">عرض المادة القانونية مع كل نتيجة</p></div>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="size-5" /> نسب النفقة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">الحد الأدنى للنسبة (%)</label>
              <input type="number" min={0} max={100} value={settings.minAlimonyPercent} onChange={(e) => update("minAlimonyPercent", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">الحد الأقصى للنسبة (%)</label>
              <input type="number" min={0} max={100} value={settings.maxAlimonyPercent} onChange={(e) => update("maxAlimonyPercent", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">الحد الأدنى للأجر الشهري</label>
              <input type="number" min={0} value={settings.monthlyMinWage} onChange={(e) => update("monthlyMinWage", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="size-5" /> بدلات إضافية</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">بدل السكن (%)</label>
              <input type="number" min={0} max={100} value={settings.housingAllowancePercent} onChange={(e) => update("housingAllowancePercent", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">بدل التعليم (%)</label>
              <input type="number" min={0} max={100} value={settings.educationAllowancePercent} onChange={(e) => update("educationAllowancePercent", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">بدل الرعاية الصحية (%)</label>
              <input type="number" min={0} max={100} value={settings.healthcareAllowancePercent} onChange={(e) => update("healthcareAllowancePercent", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Baby className="size-5" /> إعدادات الأبناء</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">العمر الأقصى للنفقة</label>
              <input type="number" min={0} max={30} value={settings.childAgeLimit} onChange={(e) => update("childAgeLimit", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
              <p className="mt-1 text-xs text-muted-foreground">العمر الذي تنتهي فيه النفقة القانونية</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">العمر الأقصى للنفقة الدراسية</label>
              <input type="number" min={0} max={35} value={settings.childEducationAgeLimit} onChange={(e) => update("childEducationAgeLimit", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
              <p className="mt-1 text-xs text-muted-foreground">العمر الذي تنتهي فيه نفقة التعليم</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
