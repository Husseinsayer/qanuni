"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import {
  Settings, Scale, TreePine, AlertTriangle, Save, Loader2,
} from "lucide-react";

interface InheritanceSettings {
  enabled: boolean;
  defaultLegalSystem: string;
  willLimitPercent: number;
  enableDynamicQuestions: boolean;
  enableLawyerReferral: boolean;
  showLegalBasis: boolean;
  requireDeathDate: boolean;
  requireEstateValue: boolean;
  maxSpouses: number;
  maxGenerations: number;
}

const DEFAULT_SETTINGS: InheritanceSettings = {
  enabled: true,
  defaultLegalSystem: "islamic",
  willLimitPercent: 33.33,
  enableDynamicQuestions: true,
  enableLawyerReferral: true,
  showLegalBasis: true,
  requireDeathDate: true,
  requireEstateValue: true,
  maxSpouses: 4,
  maxGenerations: 3,
};

export default function InheritanceSettingsPage() {
  const [settings, setSettings] = useState<InheritanceSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/inheritance/settings")
      .then((r) => r.json())
      .then((data) => { setSettings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateSetting = <K extends keyof InheritanceSettings>(key: K, value: InheritanceSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/inheritance/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("تم حفظ الإعدادات");
      } else {
        toast.error("فشل الحفظ");
      }
    } catch {
      toast.error("فشل الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات حاسبة الميراث</h1>
          <p className="text-sm text-muted-foreground">ضبط الإعدادات العامة للحاسبة (محفوظة في قاعدة البيانات)</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Save className="ml-2 size-4" />}
          حفظ
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="size-5" /> الإعدادات العامة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.enabled} onChange={(e) => updateSetting("enabled", e.target.checked)} className="size-4" />
              <div>
                <p className="text-sm font-medium">تفعيل الحاسبة</p>
                <p className="text-xs text-muted-foreground">إظهار أو إخفاء الحاسبة من الموقع</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.requireDeathDate} onChange={(e) => updateSetting("requireDeathDate", e.target.checked)} className="size-4" />
              <div>
                <p className="text-sm font-medium">إلزامي: تاريخ الوفاة</p>
                <p className="text-xs text-muted-foreground">يجب إدخال تاريخ الوفاة قبل المتابعة</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.requireEstateValue} onChange={(e) => updateSetting("requireEstateValue", e.target.checked)} className="size-4" />
              <div>
                <p className="text-sm font-medium">إلزامي: قيمة التركة</p>
                <p className="text-xs text-muted-foreground">يجب إدخال إجمالي قيمة التركة</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.showLegalBasis} onChange={(e) => updateSetting("showLegalBasis", e.target.checked)} className="size-4" />
              <div>
                <p className="text-sm font-medium">إظهار الأساس القانوني</p>
                <p className="text-xs text-muted-foreground">عرض المادة القانونية مع كل نتيجة</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Legal System */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Scale className="size-5" /> النظام القانوني</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">النظام الافتراضي</label>
              <select value={settings.defaultLegalSystem} onChange={(e) => updateSetting("defaultLegalSystem", e.target.value)} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm">
                <option value="islamic">الشريعة الإسلامية (المذهب الجعفري)</option>
                <option value="civil">القانون المدني</option>
                <option value="mixed">مختلط</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">نسبة الوصية القصوى (%)</label>
              <input type="number" min={0} max={100} step={0.01} value={settings.willLimitPercent} onChange={(e) => updateSetting("willLimitPercent", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
              <p className="mt-1 text-xs text-muted-foreground">الثلث = 33.33% حسب المادة 403</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">الحد الأقصى للزواج</label>
              <input type="number" min={1} max={4} value={settings.maxSpouses} onChange={(e) => updateSetting("maxSpouses", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Questions */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TreePine className="size-5" /> الأسئلة الديناميكية</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.enableDynamicQuestions} onChange={(e) => updateSetting("enableDynamicQuestions", e.target.checked)} className="size-4" />
              <div>
                <p className="text-sm font-medium">تفعيل الأسئلة الديناميكية</p>
                <p className="text-xs text-muted-foreground">إظهار الأسئلة حسب الإجابات السابقة</p>
              </div>
            </label>
            <div>
              <label className="mb-1.5 block text-sm font-medium">عدد الأجيال المدعومة</label>
              <input type="number" min={1} max={5} value={settings.maxGenerations} onChange={(e) => updateSetting("maxGenerations", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
            </div>
          </CardContent>
        </Card>

        {/* Lawyer Referral */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="size-5" /> إحالة المحامين</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.enableLawyerReferral} onChange={(e) => updateSetting("enableLawyerReferral", e.target.checked)} className="size-4" />
              <div>
                <p className="text-sm font-medium">تفعيل إحالة المحامين</p>
                <p className="text-xs text-muted-foreground">اقتراح محامٍ عند الحالات المعقدة</p>
              </div>
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
