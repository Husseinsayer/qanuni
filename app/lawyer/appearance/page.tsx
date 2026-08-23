"use client";

import { useEffect, useState } from "react";
import { Palette, Save, Check, Eye, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyLawyerProfile, updateMyProfile, hueOptions } from "@/lib/lawyer-profiles";
import type { Lawyer } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function LawyerAppearancePage() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Lawyer | null>(null);
  const [selectedHue, setSelectedHue] = useState("from-blue-600 to-indigo-700");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = getMyLawyerProfile();
    if (p) {
      setProfile(p);
      setSelectedHue(p.hue);
    }
  }, []);

  const handleSave = async () => {
    updateMyProfile({ hue: selectedHue });
    try {
      await fetch("/api/lawyer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hue: selectedHue }),
      });
    } catch { /* silent */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">المظهر</h1>
          <p className="mt-1 text-muted-foreground">اختر الألوان المناسبة لملفك الشخصي</p>
        </div>
        <Button onClick={handleSave} variant="accent" className="gap-2">
          {saved ? <><Check className="size-4" /> تم الحفظ</> : <><Save className="size-4" /> حفظ</>}
        </Button>
      </div>

      {saved && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          تم حفظ المظهر ✓
        </div>
      )}

      {/* Theme Toggle */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sun className="size-5 text-accent" />
            الوضع اللوني
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 px-5 py-3 transition-all",
              "hover:border-accent/50 focus:outline-none",
              "border-border"
            )}
          >
            <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-muted">
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </div>
            <div className="text-right">
              <p className="font-semibold">{theme === "dark" ? "وضع فاتح" : "وضع داكن"}</p>
              <p className="text-sm text-muted-foreground">اضغط للتبديل</p>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="size-5 text-accent" />
            الألوان الأساسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-5 text-sm text-muted-foreground">
            هذه الألوان تظهر في صورتك الرمزية وبطاقة ملفك في الموقع
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {hueOptions.map((hue) => (
              <button
                key={hue.value}
                onClick={() => setSelectedHue(hue.value)}
                className={cn(
                  "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  selectedHue === hue.value
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-border hover:border-accent/50"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl bg-gradient-to-br shadow-soft",
                  hue.value
                )} />
                <span className="text-xs font-medium">{hue.label}</span>
                {selectedHue === hue.value && (
                  <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="size-5 text-accent" />
            معاينة البطاقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-soft",
              selectedHue
            )}>
              {profile.initials || profile.name.slice(0, 2)}
            </div>
            <div>
              <p className="text-base font-bold">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{profile.city} · {profile.specialization}</p>
              <p className="text-sm text-muted-foreground">{profile.experience} سنة خبرة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
