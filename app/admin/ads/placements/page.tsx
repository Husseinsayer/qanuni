"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowLeft,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import {
  getAdminData,
  saveAdminData,
  type AdminAdPlacement,
  type AdPlacementType,
  type AdSize,
  pushActivityLog,
} from "@/lib/admin-data";

const PLACEMENT_TYPE_LABELS: Record<AdPlacementType, string> = {
  adsense: "AdSense",
  banner: "بنر مخصص",
  html: "HTML",
  script: "سكريبت",
  none: "معطّل",
};

const SIZE_LABELS: Record<AdSize, string> = {
  "responsive": "متجاوب", "leaderboard": "728×90", "large-leaderboard": "970×90",
  "billboard": "970×250", "medium-rectangle": "300×250", "large-rectangle": "336×280",
  "skyscraper": "160×600", "wide-skyscraper": "300×600", "mobile-banner": "320×50",
  "inline": "468×60", "full-page": "صفحة كاملة", "sticky-bottom": "مثبت", "native": "أصلي",
};

const PAGE_GROUPS: Record<string, string[]> = {
  "الرئيسية": ["top-banner", "below-hero", "mid-content", "sticky-mobile", "page-footer"],
  "القوانين": ["laws-top", "laws-inline"],
  "تفاصيل القانون": ["law-detail-top", "law-detail-mid"],
  "المحامون": ["lawyers-top", "lawyers-inline", "lawyer-promo"],
  "تفاصيل المحامي": ["lawyer-sidebar"],
  "المكاتب": ["law-firms-top"],
  "تفاصيل المكتب": ["law-firm-sidebar"],
  "المدونة": ["blog-top", "blog-inline", "article-mid", "article-end"],
  "الخدمات": ["services-top"],
  "البحث": ["search-top"],
};

export default function PlacementsPage() {
  const [data, setData] = useState(getAdminData);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const placements = data.adPlacements;
  const ads = data.ads;

  const updatePlacement = useCallback((key: string, patch: Partial<AdminAdPlacement>) => {
    const updated = placements.map((p) => (p.key === key ? { ...p, ...patch } : p));
    saveAdminData({ ...data, adPlacements: updated });
    setData({ ...data, adPlacements: updated });
    pushActivityLog({ entity: "ad", entityId: key, actor: "المشرف", action: "update", newValues: patch });
  }, [data, placements]);

  const resetDefaults = useCallback(() => {
    const fresh = getAdminData();
    setData({ ...data, adPlacements: fresh.adPlacements });
    saveAdminData({ data, adPlacements: fresh.adPlacements } as any);
  }, [data]);

  const editing = editingKey ? placements.find((p) => p.key === editingKey) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">أماكن الإعلانات</h1>
          <p className="text-sm text-muted-foreground mt-1">تحديد مواقع الإعلانات في صفحات الموقع — {placements.length} مكان مسجل</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />العودة
          </Link>
          <button onClick={resetDefaults} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-muted">
            <RotateCcw className="w-4 h-4" />إعادة ضبط
          </button>
        </div>
      </div>

      {/* Visual Map by Page Group */}
      {Object.entries(PAGE_GROUPS).map(([group, keys]) => (
        <div key={group} className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/50">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />{group}
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {keys.map((key) => {
                const p = placements.find((pl) => pl.key === key);
                if (!p) return null;
                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md ${
                      p.enabled ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20" : "border-border opacity-60"
                    } ${editingKey === key ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setEditingKey(editingKey === key ? null : key)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); updatePlacement(key, { enabled: !p.enabled }); }}
                        className={`p-1 rounded-md transition-colors ${p.enabled ? "text-emerald-600 hover:bg-emerald-100" : "text-muted-foreground hover:bg-muted"}`}
                      >
                        {p.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted">
                        {PLACEMENT_TYPE_LABELS[p.type]}
                      </span>
                      <span>{SIZE_LABELS[p.recommendedSize]}</span>
                    </div>
                    {p.adId && (
                      <div className="mt-1.5 text-xs">
                        <span className="text-muted-foreground">الإعلان: </span>
                        <span className="font-medium">{ads.find((a) => a.id === p.adId)?.name || p.adId}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* All placements list */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/50">
          <h2 className="text-sm font-semibold">جميع الأماكن</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-right py-2 px-4 font-medium">المفتاح</th>
                <th className="text-right py-2 px-4 font-medium">الاسم</th>
                <th className="text-right py-2 px-4 font-medium">الصفحة</th>
                <th className="text-right py-2 px-4 font-medium">النوع</th>
                <th className="text-right py-2 px-4 font-medium">الحجم الموصى</th>
                <th className="text-right py-2 px-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {placements.map((p) => (
                <tr key={p.key} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2 px-4 font-mono text-xs">{p.key}</td>
                  <td className="py-2 px-4">{p.label}</td>
                  <td className="py-2 px-4 text-muted-foreground">{p.page}</td>
                  <td className="py-2 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${p.type === "adsense" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : p.type === "banner" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : p.type === "html" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "bg-gray-100 text-gray-500"}`}>
                      {PLACEMENT_TYPE_LABELS[p.type]}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-muted-foreground text-xs">{SIZE_LABELS[p.recommendedSize]}</td>
                  <td className="py-2 px-4">
                    {p.enabled ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs"><Eye className="w-3.5 h-3.5" />مفعّل</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs"><EyeOff className="w-3.5 h-3.5" />معطّل</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditingKey(null)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing.label}</h2>
              <button onClick={() => setEditingKey(null)} className="p-1.5 rounded-lg hover:bg-muted"><RotateCcw className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">نوع الإعلان</label>
                <div className="flex gap-2">
                  {(["adsense", "banner", "html", "none"] as AdPlacementType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => updatePlacement(editing.key, { type: t })}
                      className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                        editing.type === t ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {PLACEMENT_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              {editing.type === "banner" && (
                <div>
                  <label className="block text-sm font-medium mb-1">الإعلان المربوط</label>
                  <select
                    value={editing.adId || ""}
                    onChange={(e) => updatePlacement(editing.key, { adId: e.target.value || undefined })}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                  >
                    <option value="">— اختر إعلاناً —</option>
                    {ads.filter((a) => a.enabled).map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <input
                  value={editing.description}
                  onChange={(e) => updatePlacement(editing.key, { description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setEditingKey(null)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
