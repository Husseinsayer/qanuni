// ===== Iraqi Legal Assistant - Appearance Settings =====
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getChatSettings, setChatSettings } from "@/lib/ai/settings-store";
import type { ChatSettings } from "@/lib/ai/types";
import { Save, Plus, Trash2, Palette } from "lucide-react";
import { toast } from "@/lib/admin-toast";

const colorOptions = [
  { label: "أزرق", value: "#1E3A8A" },
  { label: "أخضر", value: "#059669" },
  { label: "بنفسجي", value: "#7C3AED" },
  { label: "أحمر", value: "#DC2626" },
  { label: "برتقالي", value: "#EA580C" },
  { label: "وردي", value: "#DB2777" },
  { label: "سماوي", value: "#0891B2" },
  { label: "رمادي", value: "#4B5563" },
];

export default function AppearancePage() {
  const [settings, setSettings] = useState<ChatSettings>(getChatSettings());
  const [newSuggestion, setNewSuggestion] = useState("");

  const handleSave = () => {
    setChatSettings(settings);
    toast.success("تم الحفظ", "تم حفظ إعدادات المظهر بنجاح");
  };

  const addSuggestion = () => {
    if (newSuggestion.trim()) {
      setSettings({
        ...settings,
        suggestedQuestions: [...settings.suggestedQuestions, newSuggestion.trim()],
      });
      setNewSuggestion("");
    }
  };

  const removeSuggestion = (index: number) => {
    setSettings({
      ...settings,
      suggestedQuestions: settings.suggestedQuestions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إعدادات المظهر</h1>

      {/* Bot Identity */}
      <Card>
        <CardHeader>
          <CardTitle>هوية البوت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم البوت</label>
            <input
              type="text"
              value={settings.botName}
              onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">رسالة الترحيب</label>
            <textarea
              value={settings.welcomeMessage}
              onChange={(e) =>
                setSettings({ ...settings, welcomeMessage: e.target.value })
              }
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            لون الواجهة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => setSettings({ ...settings, primaryColor: color.value })}
                className={`w-12 h-12 rounded-xl border-2 transition-all ${
                  settings.primaryColor === color.value
                    ? "border-foreground scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm font-medium">لون مخصص:</label>
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) =>
                setSettings({ ...settings, primaryColor: e.target.value })
              }
              className="w-10 h-10 rounded cursor-pointer"
            />
            <span className="text-sm text-muted-foreground">
              {settings.primaryColor}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>معاينة</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-xl border border-border p-4 max-w-sm"
            style={{ borderColor: settings.primaryColor }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: settings.primaryColor }}
              >
                🤖
              </div>
              <div>
                <div className="font-bold">{settings.botName}</div>
                <div className="text-xs text-green-500">متصل</div>
              </div>
            </div>
            <div className="bg-muted rounded-xl rounded-tl-sm p-3 text-sm">
              {settings.welcomeMessage}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Questions */}
      <Card>
        <CardHeader>
          <CardTitle>الأسئلة المقترحة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              placeholder="أضف سؤالاً مقترحاً..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2"
              onKeyDown={(e) => e.key === "Enter" && addSuggestion()}
            />
            <Button onClick={addSuggestion}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {settings.suggestedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <span className="text-sm">{q}</span>
                <button
                  onClick={() => removeSuggestion(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
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
