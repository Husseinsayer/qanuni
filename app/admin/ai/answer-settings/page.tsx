// ===== Iraqi Legal Assistant - Answer Settings =====
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAnswerSettings, setAnswerSettings } from "@/lib/ai/settings-store";
import type { AnswerSettings } from "@/lib/ai/types";
import { Save, Eye } from "lucide-react";
import { toast } from "@/lib/admin-toast";

export default function AnswerSettingsPage() {
  const [settings, setSettings] = useState<AnswerSettings>(getAnswerSettings());

  const handleSave = () => {
    setAnswerSettings(settings);
    toast.success("تم الحفظ", "تم حفظ إعدادات الإجابة بنجاح");
  };

  const Toggle = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
      <span className="text-sm font-medium">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-muted"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إعدادات الإجابة</h1>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            خيارات العرض
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            label="إظهار المواد القانونية"
            checked={settings.showLawReferences}
            onChange={(v) => setSettings({ ...settings, showLawReferences: v })}
          />
          <Toggle
            label="إظهار الشرح المبسط"
            checked={settings.showExplanation}
            onChange={(v) => setSettings({ ...settings, showExplanation: v })}
          />
          <Toggle
            label="إظهار الخطوات المقترحة"
            checked={settings.showSteps}
            onChange={(v) => setSettings({ ...settings, showSteps: v })}
          />
          <Toggle
            label="إظهار التحذيرات"
            checked={settings.showWarnings}
            onChange={(v) => setSettings({ ...settings, showWarnings: v })}
          />
          <Toggle
            label="إظهار روابط القوانين"
            checked={settings.showLawLinks}
            onChange={(v) => setSettings({ ...settings, showLawLinks: v })}
          />
        </CardContent>
      </Card>

      {/* Limit Settings */}
      <Card>
        <CardHeader>
          <CardTitle>حدود الإجابة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              الحد الأقصى للمواد المستخدمة: {settings.maxLawsUsed}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.maxLawsUsed}
              onChange={(e) =>
                setSettings({ ...settings, maxLawsUsed: parseInt(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">لغة الرد</label>
            <select
              value={settings.responseLanguage}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  responseLanguage: e.target.value as "ar" | "ar-iq" | "auto",
                })
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-2"
            >
              <option value="auto">تلقائي (حسب المستخدم)</option>
              <option value="ar">العربية الفصحى</option>
              <option value="ar-iq">اللهجة العراقية</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 ml-2" />
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
}
