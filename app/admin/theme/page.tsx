"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Zap, Moon, RotateCcw } from "lucide-react";
import { toast } from "@/lib/admin-toast";

type ThemeConfig = {
  accent: string;
  secondary: string;
  gold: string;
  marqueeSpeed: number;
  marqueePaused: boolean;
  darkMode: boolean;
};

const accentPresets = [
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#0EA5E9",
  "#14B8A6",
  "#EC4899",
];
const secondaryPresets = [
  "#1E3A8A",
  "#312E81",
  "#4C1D95",
  "#0C4A6E",
  "#134E4A",
  "#831843",
];
const goldPresets = [
  "#F59E0B",
  "#D97706",
  "#EAB308",
  "#F97316",
  "#EF4444",
  "#FBBF24",
];

const defaults: ThemeConfig = {
  accent: "#3B82F6",
  secondary: "#1E3A8A",
  gold: "#F59E0B",
  marqueeSpeed: 32,
  marqueePaused: false,
  darkMode: false,
};

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

function ColorField({
  label,
  value,
  onChange,
  presets,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  presets: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-border"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div
          className="h-10 w-10 rounded-lg border border-border"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="flex gap-2">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`h-7 w-7 rounded-full border-2 transition ${
              value === c ? "border-accent scale-110" : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ThemePage() {
  const [config, setConfig] = useState<ThemeConfig>(defaults);

  const update = <K extends keyof ThemeConfig>(key: K, val: ThemeConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  const reset = () => {
    setConfig(defaults);
    toast.warning("تم إعادة التعيين", "تمت إعادة إعدادات المظهر إلى الوضع الافتراضي");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Palette className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold">إعدادات المظهر</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-accent" />
                الألوان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorField
                label="اللون الأساسي (Accent)"
                value={config.accent}
                onChange={(v) => update("accent", v)}
                presets={accentPresets}
              />
              <ColorField
                label="اللون الثانوي (Secondary)"
                value={config.secondary}
                onChange={(v) => update("secondary", v)}
                presets={secondaryPresets}
              />
              <ColorField
                label="اللون الذهبي (Gold)"
                value={config.gold}
                onChange={(v) => update("gold", v)}
                presets={goldPresets}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-gold" />
                الحركات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-semibold">سرعة السلايدر</p>
                  <p className="text-xs text-muted-foreground">
                    بالميلي ثانية للدورة الكاملة
                  </p>
                </div>
                <input
                  type="number"
                  value={config.marqueeSpeed}
                  min={5}
                  max={120}
                  onChange={(e) =>
                    update("marqueeSpeed", Number(e.target.value))
                  }
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm font-mono focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-semibold">
                    إيقاف السلايدر عند التمرير
                  </p>
                  <p className="text-xs text-muted-foreground">
                    إيقاف الحركة عند تمرير المؤشر
                  </p>
                </div>
                <Toggle
                  checked={config.marqueePaused}
                  onChange={(v) => update("marqueePaused", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-secondary" />
                الوضع الداكن
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-semibold">تفعيل الوضع الداكن</p>
                  <p className="text-xs text-muted-foreground">
                    تبديل المظهر بين الفاتح والداكن
                  </p>
                </div>
                <Toggle
                  checked={config.darkMode}
                  onChange={(v) => update("darkMode", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            إعادة تعيين
          </Button>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                معاينة مباشرة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="rounded-xl p-4"
                style={{
                  background: config.darkMode ? "#0F172A" : "#F8FAFC",
                }}
              >
                <div
                  className="mb-3 h-2 w-3/4 rounded-full"
                  style={{ backgroundColor: config.secondary }}
                />
                <div
                  className="mb-2 h-3 w-1/2 rounded-full"
                  style={{ backgroundColor: config.accent }}
                />
                <div
                  className="mb-4 h-2 w-2/3 rounded-full"
                  style={{
                    backgroundColor: config.darkMode
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(15,23,42,0.1)",
                  }}
                />
                <div className="flex gap-2">
                  <span
                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${config.accent}, ${config.secondary})`,
                    }}
                  >
                    زر أساسي
                  </span>
                  <span
                    className="rounded-lg px-3 py-1.5 text-xs font-bold"
                    style={{
                      backgroundColor: config.gold,
                      color: "#1F2937",
                    }}
                  >
                    زر ذهبي
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>السلايدر</span>
                  <span className="font-mono">{config.marqueeSpeed}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>إيقاف عند التمرير</span>
                  <span>{config.marqueePaused ? "نعم" : "لا"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الوضع الداكن</span>
                  <span>{config.darkMode ? "مفعّل" : "معطّل"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
