"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  MousePointerClick,
  Copy,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  getAdminData,
  saveAdminData,
  type AdminAd,
  type AdType,
  type AdSize,
  adCtr,
  pushActivityLog,
} from "@/lib/admin-data";

const AD_TYPE_LABELS: Record<AdType, string> = {
  "adsense": "AdSense",
  "custom-image": "صورة مخصصة",
  "custom-gradient": "تدرج مخصص",
  "html": "HTML",
  "script": "سكريبت",
  "affiliate": "تسويق بالعمولة",
};

const AD_SIZE_LABELS: Record<AdSize, string> = {
  "responsive": "متجاوب",
  "leaderboard": "728×90 لوحة أفقية",
  "large-leaderboard": "970×90 لوحة كبيرة",
  "billboard": "970×250 لوحة فسيحة",
  "medium-rectangle": "300×250 مستطيل متوسط",
  "large-rectangle": "336×280 مستطيل كبير",
  "skyscraper": "160×600 ناطح سحاب",
  "wide-skyscraper": "300×600 ناطح سحاب عريض",
  "mobile-banner": "320×50 بنر جوال",
  "inline": "468×60 مدمج",
  "full-page": "صفحة كاملة",
  "sticky-bottom": "مثبت أسفل",
  "native": "أصلي",
};

const PAGE_TYPES = ["home", "law", "lawyer", "article", "service", "search", "category", "contact", "about", "faq"];
const PAGE_TYPE_LABELS: Record<string, string> = {
  home: "الرئيسية", law: "القانون", lawyer: "المحامي", article: "المقال", service: "الخدمة",
  search: "البحث", category: "التصنيف", contact: "اتصل بنا", about: "حول", faq: "FAQ",
};

function emptyAd(): AdminAd {
  return {
    id: `ad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    enabled: true,
    adType: "custom-gradient",
    size: "responsive",
    title: "",
    subtitle: "",
    cta: "",
    gradient: "from-blue-600 to-indigo-700",
    image: "",
    linkUrl: "",
    openInNew: false,
    startAt: "",
    endAt: "",
    priority: 5,
    weight: 1,
    devices: { desktop: true, tablet: true, mobile: true },
    targeting: { countries: [], languages: [], categories: [], tags: [], pageTypes: [], deviceTypes: [], loggedUsers: "all" },
    stats: { impressions: 0, clicks: 0, ctr: 0, dailyStats: [] },
  };
}

type Step = "type" | "content" | "size" | "placements" | "targeting" | "schedule";
const STEPS: Step[] = ["type", "content", "size", "placements", "targeting", "schedule"];
const STEP_LABELS: Record<Step, string> = {
  type: "نوع الإعلان", content: "المحتوى", size: "الحجم", placements: "الأماكن", targeting: "الاستهداف", schedule: "الجدولة",
};

export default function CampaignsPage() {
  const [data, setData] = useState(getAdminData);
  const [search, setSearch] = useState("");
  const [editingAd, setEditingAd] = useState<AdminAd | null>(null);
  const [step, setStep] = useState<Step>("type");
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return data.ads;
    const q = search.toLowerCase();
    return data.ads.filter((a) => a.name.includes(q) || a.title?.includes(q));
  }, [data.ads, search]);

  const save = useCallback((ad: AdminAd) => {
    const exists = data.ads.find((a) => a.id === ad.id);
    let ads: AdminAd[];
    if (exists) {
      ads = data.ads.map((a) => (a.id === ad.id ? ad : a));
      pushActivityLog({ entity: "ad", entityId: ad.id, actor: "المشرف", action: "update", newValues: ad });
    } else {
      ads = [...data.ads, ad];
      pushActivityLog({ entity: "ad", entityId: ad.id, actor: "المشرف", action: "create", newValues: ad });
    }
    saveAdminData({ ...data, ads });
    setData({ ...data, ads });
    setShowModal(false);
    setEditingAd(null);
    setStep("type");
  }, [data]);

  const deleteAd = useCallback((id: string) => {
    const ad = data.ads.find((a) => a.id === id);
    if (ad) pushActivityLog({ entity: "ad", entityId: id, actor: "المشرف", action: "delete", oldValues: ad });
    const ads = data.ads.filter((a) => a.id !== id);
    saveAdminData({ ...data, ads });
    setData({ ...data, ads });
    setConfirmDelete(null);
  }, [data]);

  const duplicateAd = useCallback((ad: AdminAd) => {
    const copy: AdminAd = {
      ...ad,
      id: `ad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: `${ad.name} (نسخة)`,
      stats: { impressions: 0, clicks: 0, ctr: 0, dailyStats: [] },
    };
    const ads = [...data.ads, copy];
    saveAdminData({ ...data, ads });
    setData({ ...data, ads });
  }, [data]);

  const toggleAd = useCallback((id: string) => {
    const ads = data.ads.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    saveAdminData({ ...data, ads });
    setData({ ...data, ads });
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الحملات الإعلانية</h1>
          <p className="text-sm text-muted-foreground mt-1">إنشاء وإدارة حملاتك الإعلانية</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />العودة
          </Link>
          <button
            onClick={() => { setEditingAd(emptyAd()); setShowModal(true); setStep("type"); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />حملة جديدة
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث في الحملات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-lg border bg-background text-sm"
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "الحملات", value: data.ads.length, icon: Megaphone },
          { label: "النشطة", value: data.ads.filter((a) => a.enabled).length, icon: CheckCircle2 },
          { label: "إجمالي الظهور", value: data.ads.reduce((s, a) => s + a.stats.impressions, 0), icon: Eye },
          { label: "إجمالي النقرات", value: data.ads.reduce((s, a) => s + a.stats.clicks, 0), icon: MousePointerClick },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-3 text-center">
            <c.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-bold">{c.value.toLocaleString("ar-IQ")}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>لا توجد حملات{search ? " تطابق البحث" : ""}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-right py-3 px-4 font-medium">الاسم</th>
                  <th className="text-right py-3 px-4 font-medium">النوع</th>
                  <th className="text-right py-3 px-4 font-medium">الحجم</th>
                  <th className="text-right py-3 px-4 font-medium">الظهور</th>
                  <th className="text-right py-3 px-4 font-medium">النقرات</th>
                  <th className="text-right py-3 px-4 font-medium">CTR</th>
                  <th className="text-right py-3 px-4 font-medium">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ad) => (
                  <tr key={ad.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{ad.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{AD_TYPE_LABELS[ad.adType]}</td>
                    <td className="py-3 px-4 text-muted-foreground">{AD_SIZE_LABELS[ad.size]}</td>
                    <td className="py-3 px-4">{ad.stats.impressions.toLocaleString("ar-IQ")}</td>
                    <td className="py-3 px-4">{ad.stats.clicks.toLocaleString("ar-IQ")}</td>
                    <td className="py-3 px-4">{adCtr(ad.stats)}%</td>
                    <td className="py-3 px-4">
                      {ad.enabled ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs"><CheckCircle2 className="w-3.5 h-3.5" />نشط</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs"><XCircle className="w-3.5 h-3.5" />معطّل</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingAd(ad); setShowModal(true); setStep("type"); }} className="p-1.5 rounded-md hover:bg-muted" title="تعديل"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => duplicateAd(ad)} className="p-1.5 rounded-md hover:bg-muted" title="نسخ"><Copy className="w-4 h-4" /></button>
                        <button onClick={() => toggleAd(ad.id)} className="p-1.5 rounded-md hover:bg-muted" title={ad.enabled ? "تعطيل" : "تفعيل"}>
                          {ad.enabled ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        {confirmDelete === ad.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => deleteAd(ad.id)} className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">حذف</button>
                            <button onClick={() => setConfirmDelete(null)} className="text-xs bg-muted px-2 py-1 rounded">إلغاء</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(ad.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="حذف"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wizard Modal */}
      {showModal && editingAd && (
        <AdWizard
          ad={editingAd}
          step={step}
          setStep={setStep}
          onSave={save}
          onClose={() => { setShowModal(false); setEditingAd(null); setStep("type"); }}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────── */
/*                AD WIZARD COMPONENT              */
/* ──────────────────────────────────────────────── */

function AdWizard({
  ad,
  step,
  setStep,
  onSave,
  onClose,
}: {
  ad: AdminAd;
  step: Step;
  setStep: (s: Step) => void;
  onSave: (ad: AdminAd) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState({ ...ad });
  const [tagInput, setTagInput] = useState("");
  const stepIdx = STEPS.indexOf(step);
  const canNext = stepIdx < STEPS.length - 1;
  const canPrev = stepIdx > 0;

  const update = (patch: Partial<AdminAd>) => setLocal((p) => ({ ...p, ...patch }));

  const addTag = (field: "countries" | "languages" | "categories" | "tags") => {
    if (!tagInput.trim()) return;
    update({ targeting: { ...local.targeting, [field]: [...local.targeting[field], tagInput.trim()] } });
    setTagInput("");
  };

  const removeTag = (field: "countries" | "languages" | "categories" | "tags", idx: number) => {
    update({ targeting: { ...local.targeting, [field]: local.targeting[field].filter((_, i) => i !== idx) } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{ad.name ? `تعديل: ${ad.name}` : "حملة جديدة"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 px-6 py-3 border-b bg-muted/30 overflow-x-auto">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                s === step ? "bg-primary text-primary-foreground" : i < stepIdx ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {i < stepIdx ? "✓ " : ""}{STEP_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {step === "type" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم الحملة</label>
                <input value={local.name} onChange={(e) => update({ name: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="مثال: استشارة مجانية" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">نوع الإعلان</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(["custom-gradient", "custom-image", "adsense", "html", "script", "affiliate"] as AdType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => update({ adType: t })}
                      className={`p-3 rounded-xl border text-sm text-center transition-all ${
                        local.adType === t ? "border-primary bg-primary/10 ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {AD_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "content" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العنوان</label>
                <input value={local.title || ""} onChange={(e) => update({ title: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">العنوان الفرعي</label>
                <input value={local.subtitle || ""} onChange={(e) => update({ subtitle: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">نص الزر</label>
                  <input value={local.cta || ""} onChange={(e) => update({ cta: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">رابط الزر</label>
                  <input value={local.linkUrl || ""} onChange={(e) => update({ linkUrl: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="/contact" />
                </div>
              </div>
              {local.adType === "custom-gradient" && (
                <div>
                  <label className="block text-sm font-medium mb-1">التدرج اللوني</label>
                  <input value={local.gradient || ""} onChange={(e) => update({ gradient: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="from-blue-600 to-indigo-700" />
                </div>
              )}
              {(local.adType === "html" || local.adType === "script") && (
                <div>
                  <label className="block text-sm font-medium mb-1">الكود</label>
                  <textarea value={local.htmlCode || ""} onChange={(e) => update({ htmlCode: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono min-h-[120px]" dir="ltr" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={local.openInNew || false} onChange={(e) => update({ openInNew: e.target.checked })} className="rounded" />
                <label className="text-sm">فتح في نافذة جديدة</label>
              </div>
              {/* Preview */}
              <div className="rounded-xl border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2">معاينة:</p>
                <div className={`rounded-lg bg-gradient-to-r ${local.gradient || "from-blue-600 to-indigo-700"} text-white p-4 text-center`}>
                  {local.title && <p className="text-lg font-bold">{local.title}</p>}
                  {local.subtitle && <p className="text-sm opacity-90 mt-1">{local.subtitle}</p>}
                  {local.cta && <button className="mt-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-lg text-sm font-medium">{local.cta}</button>}
                </div>
              </div>
            </div>
          )}

          {step === "size" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">حجم الإعلان</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(AD_SIZE_LABELS).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => update({ size: k as AdSize })}
                      className={`p-3 rounded-xl border text-sm text-center transition-all ${
                        local.size === k ? "border-primary bg-primary/10 ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "placements" && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 bg-muted/30 text-xs text-muted-foreground">
                حدد الأجهزة المستهدفة لهذا الإعلان
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(["desktop", "tablet", "mobile"] as const).map((d) => (
                  <label key={d} className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${local.devices[d] ? "border-primary bg-primary/10" : "border-border"}`}>
                    <input type="checkbox" checked={local.devices[d]} onChange={(e) => update({ devices: { ...local.devices, [d]: e.target.checked } })} className="rounded" />
                    <span className="text-sm">{d === "desktop" ? "سطح المكتب" : d === "tablet" ? "لوحي" : "جوال"}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === "targeting" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {([
                  { field: "countries" as const, label: "الدول" },
                  { field: "languages" as const, label: "اللغات" },
                  { field: "categories" as const, label: "التصنيفات" },
                  { field: "tags" as const, label: "الوسوم" },
                ]).map(({ field, label }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <div className="flex gap-1 mb-1">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(field); } }}
                        className="flex-1 px-2 py-1.5 rounded-lg border bg-background text-xs"
                        placeholder={`إضافة ${label}`}
                      />
                      <button onClick={() => addTag(field)} className="px-2 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs">+</button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {local.targeting[field].map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs">
                          {tag}
                          <button onClick={() => removeTag(field, i)} className="text-muted-foreground hover:text-foreground">×</button>
                        </span>
                      ))}
                      {local.targeting[field].length === 0 && <span className="text-xs text-muted-foreground">الكل</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">نوع الصفحة</label>
                <div className="flex flex-wrap gap-1.5">
                  {PAGE_TYPES.map((pt) => (
                    <button
                      key={pt}
                      onClick={() => {
                        const pts = local.targeting.pageTypes.includes(pt)
                          ? local.targeting.pageTypes.filter((p) => p !== pt)
                          : [...local.targeting.pageTypes, pt];
                        update({ targeting: { ...local.targeting, pageTypes: pts } });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                        local.targeting.pageTypes.includes(pt) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {PAGE_TYPE_LABELS[pt] || pt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">المستخدمون</label>
                <div className="flex gap-2">
                  {(["all", "logged-in", "guests"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => update({ targeting: { ...local.targeting, loggedUsers: v } })}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        local.targeting.loggedUsers === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {v === "all" ? "الكل" : v === "logged-in" ? "المسجلون" : "الزوار"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "schedule" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ البدء</label>
                  <input type="datetime-local" value={local.startAt?.slice(0, 16) || ""} onChange={(e) => update({ startAt: e.target.value ? new Date(e.target.value).toISOString() : "" })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
                  <input type="datetime-local" value={local.endAt?.slice(0, 16) || ""} onChange={(e) => update({ endAt: e.target.value ? new Date(e.target.value).toISOString() : "" })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">الأولوية (1–10)</label>
                  <input type="number" min={1} max={10} value={local.priority || 5} onChange={(e) => update({ priority: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الوزن (1–10)</label>
                  <input type="number" min={1} max={10} value={local.weight || 1} onChange={(e) => update({ weight: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                </div>
              </div>
              <div className="rounded-lg border p-3 bg-muted/30 text-xs text-muted-foreground">
                الوزن يحدد احتمال ظهور الإعلان مقارنة بالإعلانات الأخرى في نفس المكان. الأولوية تحدد الترتيب عند وجود عدة إعلانات.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">إلغاء</button>
          <div className="flex items-center gap-2">
            {canPrev && (
              <button onClick={() => setStep(STEPS[stepIdx - 1])} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm hover:bg-muted">
                <ArrowRight className="w-4 h-4" />السابق
              </button>
            )}
            {canNext ? (
              <button onClick={() => setStep(STEPS[stepIdx + 1])} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90">
                التالي<ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => onSave(local)} disabled={!local.name.trim()} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
                حفظ الحملة
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Re-export Link for the top bar */
import Link from "next/link";
