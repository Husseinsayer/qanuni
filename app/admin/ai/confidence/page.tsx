// ===== Iraqi Legal Assistant - Confidence Settings =====
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getConfidenceSettings, setConfidenceSettings } from "@/lib/ai/settings-store";
import type { ConfidenceSettings } from "@/lib/ai/types";
import { Save, Shield } from "lucide-react";
import { toast } from "@/lib/admin-toast";

export default function ConfidenceSettingsPage() {
  const [settings, setSettings] = useState<ConfidenceSettings>(
    getConfidenceSettings()
  );

  const handleSave = () => {
    setConfidenceSettings(settings);
    toast.success("تم الحفظ", "تم حفظ إعدادات الثقة بنجاح");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إعدادات الثقة</h1>

      {/* Threshold Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            حدود الثقة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              الحد الأدنى للثقة: {settings.minConfidence}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.minConfidence}
              onChange={(e) =>
                setSettings({ ...settings, minConfidence: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              الحد الأدنى للمواد القانونية: {settings.minLawsRequired}
            </label>
            <input
              type="range"
              min="0"
              max="5"
              value={settings.minLawsRequired}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  minLawsRequired: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Low Confidence Action */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراء عند انخفاض الثقة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              value: "ask_more" as const,
              label: "طلب معلومات إضافية",
              desc: "يسأل المستخدم أسئلة إضافية لتحسين الإجابة",
            },
            {
              value: "show_warning" as const,
              label: "عرض تحذير",
              desc: "يعرض الإجابة مع تحذير بأن الثقة منخفضة",
            },
            {
              value: "limit_response" as const,
              label: "تقييد الإجابة",
              desc: "يعرض إجابة مختصرة فقط مع إشارة للمراجعة",
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                settings.lowConfidenceAction === option.value
                  ? "border-accent bg-accent/5"
                  : "border-border hover:bg-muted/30"
              }`}
            >
              <input
                type="radio"
                name="lowConfidenceAction"
                value={option.value}
                checked={settings.lowConfidenceAction === option.value}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    lowConfidenceAction: e.target.value as typeof settings.lowConfidenceAction,
                  })
                }
                className="mt-1"
              />
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.desc}</div>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Confidence Levels Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>مستويات الثقة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <div className="font-bold text-green-600">عالية (80-100%)</div>
              <div className="text-sm text-muted-foreground mt-1">
                معلومات كافية، مواد قانونية واضحة
              </div>
            </div>
            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
              <div className="font-bold text-yellow-600">متوسطة (60-79%)</div>
              <div className="text-sm text-muted-foreground mt-1">
                معلومات جزئية، قد تحتاج تأكيد
              </div>
            </div>
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20">
              <div className="font-bold text-orange-600">منخفضة (40-59%)</div>
              <div className="text-sm text-muted-foreground mt-1">
                معلومات غير كافية، يُنصح بسؤال المستخدم
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <div className="font-bold text-red-600">منخفضة جداً (0-39%)</div>
              <div className="text-sm text-muted-foreground mt-1">
                لا يمكن تقديم إجابة موثوقة
              </div>
            </div>
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
