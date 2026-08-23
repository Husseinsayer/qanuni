"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  Plus,
  Trash2,
  Save,
  Loader2,
  Star,
  Sprout,
  PenLine,
  FileText,
  Crown,
  Gem,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/lib/admin-toast";

interface RewardTier {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  minPoints: number;
  description: string;
}

interface RewardsConfig {
  pointsPerArticle: number;
  pointsPerProfileComplete: number;
  pointsPerReview: number;
  tiers: RewardTier[];
}

const ICON_OPTIONS = [
  { value: "Sprout", label: "Sprout", Icon: Sprout },
  { value: "PenLine", label: "PenLine", Icon: PenLine },
  { value: "FileText", label: "FileText", Icon: FileText },
  { value: "Award", label: "Award", Icon: Award },
  { value: "Crown", label: "Crown", Icon: Crown },
  { value: "Gem", label: "Gem", Icon: Gem },
  { value: "Star", label: "Star", Icon: Star },
];

const COLOR_PRESETS = [
  "#6B7280",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#EC4899",
  "#06B6D4",
];

function getIconComponent(iconName: string) {
  const found = ICON_OPTIONS.find((o) => o.value === iconName);
  return found?.Icon || Award;
}

export default function RewardsAdminPage() {
  const [config, setConfig] = useState<RewardsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rewards");
      if (res.ok) {
        const { config: c } = await res.json();
        setConfig(c);
      }
    } catch {
      toast.error("خطأ", "تعذر تحميل الإعدادات");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/rewards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        toast.success("تم الحفظ", "تم حفظ إعدادات النقاط والمكافآت");
      } else {
        toast.error("خطأ", "تعذر الحفظ");
      }
    } catch {
      toast.error("خطأ", "تعذر الاتصال بالخادم");
    }
    setSaving(false);
  };

  const addTier = () => {
    if (!config) return;
    const newTier: RewardTier = {
      id: `tier-${Date.now()}`,
      name: "New Tier",
      nameAr: "شارة جديدة",
      icon: "Award",
      color: "#3B82F6",
      minPoints: 0,
      description: "وصف الشارة",
    };
    setConfig({ ...config, tiers: [...config.tiers, newTier] });
  };

  const updateTier = (idx: number, updates: Partial<RewardTier>) => {
    if (!config) return;
    const newTiers = config.tiers.map((t, i) => (i === idx ? { ...t, ...updates } : t));
    setConfig({ ...config, tiers: newTiers });
  };

  const removeTier = (idx: number) => {
    if (!config) return;
    setConfig({ ...config, tiers: config.tiers.filter((_, i) => i !== idx) });
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sortedTiers = [...config.tiers].sort((a, b) => a.minPoints - b.minPoints);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">النقاط والمكافآت</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة نقاط المحامين وعتبات المكافآت لتحفيز النشر
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchConfig}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ
          </Button>
        </div>
      </div>

      {/* Points Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-amber-500" />
            نقاط النشاط
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <label className="mb-2 block text-sm font-semibold">نقاط نشر مقال</label>
              <input
                type="number"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={config.pointsPerArticle}
                onChange={(e) =>
                  setConfig({ ...config, pointsPerArticle: Number(e.target.value) })
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                تُمنح عند نشر المقال (حالة: منشور)
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <label className="mb-2 block text-sm font-semibold">نقاط إكمال الملف</label>
              <input
                type="number"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={config.pointsPerProfileComplete}
                onChange={(e) =>
                  setConfig({ ...config, pointsPerProfileComplete: Number(e.target.value) })
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                تُمنح عند إكمال ملف المحامي الشخصي
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <label className="mb-2 block text-sm font-semibold">نقاط كل تقييم</label>
              <input
                type="number"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                value={config.pointsPerReview}
                onChange={(e) =>
                  setConfig({ ...config, pointsPerReview: Number(e.target.value) })
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                تُمنح عند كل تقييم جديد من العميل
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reward Tiers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-accent" />
            شارات المكافآت
          </CardTitle>
          <Button size="sm" variant="outline" onClick={addTier}>
            <Plus className="h-4 w-4" />
            إضافة شارة
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedTiers.map((tier, idx) => {
            const IconComp = getIconComponent(tier.icon);
            return (
              <div
                key={tier.id}
                className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/20"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: tier.color + "20" }}
                  >
                    <IconComp className="h-5 w-5" style={{ color: tier.color }} />
                  </div>
                  <div className="flex-1">
                    <input
                      className="mb-1 w-full bg-transparent text-sm font-bold outline-none"
                      value={tier.nameAr}
                      onChange={(e) => updateTier(idx, { nameAr: e.target.value })}
                      placeholder="الاسم بالعربية"
                    />
                    <input
                      className="w-full bg-transparent text-xs text-muted-foreground outline-none"
                      value={tier.description}
                      onChange={(e) => updateTier(idx, { description: e.target.value })}
                      placeholder="الوصف"
                    />
                  </div>
                  <button
                    onClick={() => removeTier(idx)}
                    className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">الاسم الإنجليزي</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent"
                      value={tier.name}
                      onChange={(e) => updateTier(idx, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">الحد الأدنى للنقاط</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent"
                      value={tier.minPoints}
                      onChange={(e) =>
                        updateTier(idx, { minPoints: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">الأيقونة</label>
                    <select
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent"
                      value={tier.icon}
                      onChange={(e) => updateTier(idx, { icon: e.target.value })}
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">اللون</label>
                    <div className="flex flex-wrap gap-1">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateTier(idx, { color: c })}
                          className={`h-6 w-6 rounded-full border-2 transition-transform ${
                            tier.color === c ? "scale-110 border-foreground" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">معاينة الشارات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {sortedTiers.map((tier) => {
              const IconComp = getIconComponent(tier.icon);
              return (
                <div
                  key={tier.id}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5"
                >
                  <IconComp className="h-4 w-4" style={{ color: tier.color }} />
                  <span className="text-sm font-medium" style={{ color: tier.color }}>
                    {tier.nameAr}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tier.minPoints}+ نقطة
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
