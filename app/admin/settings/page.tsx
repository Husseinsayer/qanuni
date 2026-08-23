"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Bot,
  MapPinned,
  RotateCcw,
  Save,
  Plus,
  X,
  AlertTriangle,
  Palette,
  Trash2,
  Lock,
  CheckCircle2,
  Scale,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAdminContext } from "../admin-context";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";

type GeneralConfig = {
  // AI
  aiEnabled: boolean;
  aiGreeting: string;
  aiExample: string;
  aiPlaceholder: string;
  aiComingSoon: string;
  // Lists
  cities: string[];
  specializations: string[];
  languages: string[];
  // Branding
  primaryColor: string;
  secondaryColor: string;
  headingFont: string;
  bodyFont: string;
  logoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
};

const defaults: GeneralConfig = {
  aiEnabled: true,
  aiGreeting: "مرحباً! أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك اليوم؟",
  aiExample: "ما هي شروط الحضانة في القانون العراقي؟",
  aiPlaceholder: "اكتب سؤالك القانوني هنا...",
  aiComingSoon: "قريباً — ميزة المحادثة المتقدمة",
  cities: [
    "بغداد",
    "البصرة",
    "أربيل",
    "الموصل",
    "النجف",
    "كربلاء",
    "السليمانية",
    "الكرخ",
  ],
  specializations: [
    "الأحوال الشخصية",
    "القانون التجاري",
    "قانون العقوبات",
    "القانون المدني",
    "قانون العمل",
    "الملكية الفكرية",
    "القانون الإداري",
  ],
  languages: ["العربية", "الكردية", "التركمانية", "الإنجليزية"],
  // Branding defaults
  primaryColor: "#0f766e",
  secondaryColor: "#6366f1",
  headingFont: "Tajawal",
  bodyFont: "Tajawal",
  logoUrl: "",
  darkLogoUrl: "",
  faviconUrl: "",
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

function TagList({
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder: string;
}) {
  const [val, setVal] = useState("");
  const add = () => {
    const v = val.trim();
    if (!v || items.includes(v)) return;
    onAdd(v);
    setVal("");
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="rounded-full p-0.5 hover:bg-accent/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function PasswordChangeSection() {
  const { data, update } = useAdminContext();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = async () => {
    setError("");
    setSuccess("");

    // Hash the entered current password and compare with stored hash
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(currentPassword));
    const currentHash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");

    if (currentHash !== data.adminAuth.passwordHash) {
      setError("كلمة المرور الحالية غير صحيحة");
      return;
    }
    if (newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    const bufNew = new TextEncoder().encode(newPassword);
    const bufNewHash = await crypto.subtle.digest("SHA-256", bufNew);
    const newHash = Array.from(new Uint8Array(bufNewHash)).map((b) => b.toString(16).padStart(2, "0")).join("");

    update("adminAuth", {
      ...data.adminAuth,
      passwordHash: newHash,
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess("تم تغيير كلمة المرور بنجاح");
  };

  return (
    <>
      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          كلمة المرور الحالية
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            setError("");
            setSuccess("");
          }}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          كلمة المرور الجديدة
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError("");
            setSuccess("");
          }}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold">
          تأكيد كلمة المرور الجديدة
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
            setSuccess("");
          }}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3">
          <p className="text-sm font-semibold text-danger">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </p>
        </div>
      )}

      <Button variant="accent" onClick={handleChange}>
        <Save className="h-4 w-4" />
        حفظ
      </Button>
    </>
  );
}

export default function SettingsPage() {
  const { data, update: adminUpdate } = useAdminContext();
  const [showResetModal, setShowResetModal] = useState(false);

  const buildConfig = (): GeneralConfig => ({
    aiEnabled: data.floatingAI?.enabled ?? defaults.aiEnabled,
    aiGreeting: data.floatingAI?.greeting || defaults.aiGreeting,
    aiExample: data.floatingAI?.example || defaults.aiExample,
    aiPlaceholder: data.floatingAI?.placeholder || defaults.aiPlaceholder,
    aiComingSoon: data.floatingAI?.soonText || defaults.aiComingSoon,
    cities: data.cities?.length ? data.cities : defaults.cities,
    specializations: data.specializations?.length ? data.specializations : defaults.specializations,
    languages: defaults.languages,
    primaryColor: data.theme?.accentColor || defaults.primaryColor,
    secondaryColor: data.theme?.secondaryColor || defaults.secondaryColor,
    headingFont: defaults.headingFont,
    bodyFont: defaults.bodyFont,
    logoUrl: data.seo?.general?.logo || defaults.logoUrl,
    darkLogoUrl: defaults.darkLogoUrl,
    faviconUrl: defaults.faviconUrl,
  });

  const [config, setConfig] = useState<GeneralConfig>(buildConfig);

  const update = <K extends keyof GeneralConfig>(
    key: K,
    val: GeneralConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  const saveToAdmin = async () => {
    adminUpdate("floatingAI", {
      greeting: config.aiGreeting,
      example: config.aiExample,
      placeholder: config.aiPlaceholder,
      soonText: config.aiComingSoon,
      enabled: config.aiEnabled,
    });
    adminUpdate("theme", {
      ...data.theme,
      accentColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
    });
    adminUpdate("cities", config.cities);
    adminUpdate("specializations", config.specializations);
    // Sync all settings to API so public site picks up changes
    try {
      const res = await fetch("/api/site-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          registrationEnabled: data.registrationEnabled !== false,
          lawTypeVisibility: data.lawTypeVisibility || { all: true, decisions: true, regulations: true, systems: true },
          lawPageTabs: data.lawPageTabs,
          categories: data.categories,
          hero: {
            badge: data.hero?.badge || "",
            title: data.hero?.title || "",
            titleGradient: data.hero?.titleGradient || "",
            subtitle: data.hero?.subtitle || "",
            btnPrimary: data.hero?.btnPrimary || "",
            btnSecondary: data.hero?.btnSecondary || "",
          },
          footer: data.footer ? {
            description: data.footer.description || "",
            newsletterText: data.footer.newsletterText || "",
            phone: data.footer.phone || "",
            email: data.footer.email || "",
            address: data.footer.address || "",
            workingHours: data.footer.workingHours || "",
            socials: data.footer.socials || {},
            legalLinks: data.footer.legalLinks || [],
          } : undefined,
        }),
      });
      if (!res.ok) {
        console.error("Settings sync failed:", res.status);
      }
    } catch (e) {
      console.error("Settings sync error:", e);
    }
    toast.success("تم الحفظ بنجاح", "تم حفظ جميع الإعدادات وتطبيقها على الموقع");
  };

  const reset = () => {
    setConfig(defaults);
    setShowResetModal(false);
    toast.warning("تم إعادة التعيين", "تمت إعادة جميع الإعدادات إلى الوضع الافتراضي");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Settings className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold">الإعدادات العامة</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            المساعد الذكي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-semibold">تفعيل الزر العائم</p>
              <p className="text-xs text-muted-foreground">
                إظهار زر المساعد الذكي في جميع الصفحات
              </p>
            </div>
            <Toggle
              checked={config.aiEnabled}
              onChange={(v) => update("aiEnabled", v)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              رسالة الترحيب
            </label>
            <textarea
              value={config.aiGreeting}
              onChange={(e) => update("aiGreeting", e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              سؤال مثال
            </label>
            <input
              value={config.aiExample}
              onChange={(e) => update("aiExample", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              نص العنصر الناسخ
            </label>
            <input
              value={config.aiPlaceholder}
              onChange={(e) => update("aiPlaceholder", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              نص &quot;قريباً&quot;
            </label>
            <input
              value={config.aiComingSoon}
              onChange={(e) => update("aiComingSoon", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-accent" />
            المدن والتخصصات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold">المدن</label>
            <TagList
              items={config.cities}
              onAdd={(v) => update("cities", [...config.cities, v])}
              onRemove={(v) =>
                update(
                  "cities",
                  config.cities.filter((c) => c !== v)
                )
              }
              placeholder="أضف مدينة..."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">
              التخصصات
            </label>
            <TagList
              items={config.specializations}
              onAdd={(v) =>
                update("specializations", [...config.specializations, v])
              }
              onRemove={(v) =>
                update(
                  "specializations",
                  config.specializations.filter((s) => s !== v)
                )
              }
              placeholder="أضف تخصص..."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">اللغات</label>
            <TagList
              items={config.languages}
              onAdd={(v) => update("languages", [...config.languages, v])}
              onRemove={(v) =>
                update(
                  "languages",
                  config.languages.filter((l) => l !== v)
                )
              }
              placeholder="أضف لغة..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Law Page Tabs Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            أزرار تصنيف القوانين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            الأزرار التي تظهر في أعلى صفحة القوانين لتصفية القوانين حسب النوع. يمكنك إضافة وتعديل وحذف الأزرار.
          </p>

          <div className="space-y-3">
            {data.lawPageTabs.map((tab) => (
              <TabItem
                key={tab.id}
                tab={tab}
                onChange={(updated) => {
                  adminUpdate(
                    "lawPageTabs",
                    data.lawPageTabs.map((t) => (t.id === tab.id ? updated : t))
                  );
                }}
                onDelete={() => {
                  adminUpdate(
                    "lawPageTabs",
                    data.lawPageTabs.filter((t) => t.id !== tab.id)
                  );
                  toast.success("تم الحذف", `تم حذف "${tab.name}"`);
                }}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const id = `tab-${Date.now()}`;
              adminUpdate("lawPageTabs", [
                ...data.lawPageTabs,
                { id, name: "تبويب جديد", filterCategory: "" },
              ]);
            }}
          >
            <Plus className="h-4 w-4" />
            إضافة تبويب جديد
          </Button>
        </CardContent>
      </Card>

      {/* Law Type Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-accent" />
            إظهار/إخفاء أنواع القوانين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            التحكم في إظهار أو إخفاء كل نوع قوانين في صفحة القوانين.
          </p>
          {[
            { key: "all", label: "القوانين العراقية" },
            { key: "decisions", label: "قرارات محكمة التمييز" },
            { key: "regulations", label: "التعليمات" },
            { key: "systems", label: "الأنظمة" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                {data.lawTypeVisibility?.[key] !== false ? (
                  <Eye className="h-4 w-4 text-success" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.lawTypeVisibility?.[key] !== false ? "ظاهر في الموقع" : "مخفي من الموقع"}
                  </p>
                </div>
              </div>
              <Toggle
                checked={data.lawTypeVisibility?.[key] !== false}
                onChange={(v) => {
                  const current = data.lawTypeVisibility || { all: true, decisions: true, regulations: true, systems: true };
                  adminUpdate("lawTypeVisibility", { ...current, [key]: v });
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Registration Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-accent" />
            التسجيل في الموقع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-semibold">تفعيل التسجيل</p>
              <p className="text-xs text-muted-foreground">
                عند التعطيل، لن يتمكن الزوار من إنشاء حساب جديد
              </p>
            </div>
            <Toggle
              checked={data.registrationEnabled !== false}
              onChange={(v) => adminUpdate("registrationEnabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent" />
            تغيير كلمة المرور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PasswordChangeSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-accent" />
            الهوية البصرية والعلامة التجارية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">اللون الأساسي</label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.primaryColor} onChange={(e) => update("primaryColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-border" />
                <input value={config.primaryColor} onChange={(e) => update("primaryColor", e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-mono" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">اللون الثانوي</label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.secondaryColor} onChange={(e) => update("secondaryColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-border" />
                <input value={config.secondaryColor} onChange={(e) => update("secondaryColor", e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-mono" dir="ltr" />
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">خط العناوين</label>
              <select value={config.headingFont} onChange={(e) => update("headingFont", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm">
                <option value="Tajawal">Tajawal (تجوال)</option>
                <option value="Cairo">Cairo (القاهرة)</option>
                <option value="Almarai">Almarai (المرعي)</option>
                <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                <option value="Noto Sans Arabic">Noto Sans Arabic</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">خط النصوص</label>
              <select value={config.bodyFont} onChange={(e) => update("bodyFont", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm">
                <option value="Tajawal">Tajawal (تجوال)</option>
                <option value="Cairo">Cairo (القاهرة)</option>
                <option value="Almarai">Almarai (المرعي)</option>
                <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                <option value="Noto Sans Arabic">Noto Sans Arabic</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">الشعار (Light)</label>
              <div className="space-y-2">
                {config.logoUrl && (
                  <div className="relative h-20 w-40 overflow-hidden rounded-lg border border-border bg-muted/30 p-2">
                    <img src={config.logoUrl} alt="معاينة الشعار" className="h-full w-full object-contain" />
                    <button onClick={() => update("logoUrl", "")} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-danger text-white hover:bg-danger/80"><X className="h-3 w-3" /></button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => update("logoUrl", ev.target?.result as string); r.readAsDataURL(f); }}
                  className="w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent hover:file:bg-accent/20" />
                <input value={config.logoUrl.startsWith("data:") ? "" : config.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} placeholder="أو أدخل رابط الصورة..." className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">الشعار (Dark)</label>
              <div className="space-y-2">
                {config.darkLogoUrl && (
                  <div className="relative h-20 w-40 overflow-hidden rounded-lg border border-border bg-muted/30 p-2">
                    <img src={config.darkLogoUrl} alt="معاينة الشعار الداكن" className="h-full w-full object-contain" />
                    <button onClick={() => update("darkLogoUrl", "")} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-danger text-white hover:bg-danger/80"><X className="h-3 w-3" /></button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => update("darkLogoUrl", ev.target?.result as string); r.readAsDataURL(f); }}
                  className="w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent hover:file:bg-accent/20" />
                <input value={config.darkLogoUrl.startsWith("data:") ? "" : config.darkLogoUrl} onChange={(e) => update("darkLogoUrl", e.target.value)} placeholder="أو أدخل رابط الصورة..." className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">الأيقونة المفضلة (Favicon)</label>
              <div className="space-y-2">
                {config.faviconUrl && (
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-muted/30 p-1">
                    <img src={config.faviconUrl} alt="معاينة الأيقونة" className="h-full w-full object-contain" />
                    <button onClick={() => update("faviconUrl", "")} className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-danger text-white hover:bg-danger/80"><X className="h-2.5 w-2.5" /></button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => update("faviconUrl", ev.target?.result as string); r.readAsDataURL(f); }}
                  className="w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent hover:file:bg-accent/20" />
                <input value={config.faviconUrl.startsWith("data:") ? "" : config.faviconUrl} onChange={(e) => update("faviconUrl", e.target.value)} placeholder="أو أدخل رابط الصورة..." className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" dir="ltr" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm font-semibold mb-2">معاينة الألوان</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-20 rounded-lg" style={{ backgroundColor: config.primaryColor }} />
              <div className="h-10 w-20 rounded-lg" style={{ backgroundColor: config.secondaryColor }} />
              <div className="text-sm text-muted-foreground">اللون الأساسي والثانوي</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-5 w-5" />
            بيانات الموقع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-danger/30 text-danger hover:bg-danger/10"
            onClick={() => setShowResetModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            إعادة تعيين كل البيانات
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="accent" onClick={saveToAdmin}>
          <Save className="h-4 w-4" />
          حفظ الإعدادات
        </Button>
        <Button variant="outline" onClick={() => { setConfig(defaults); toast.warning("تم إعادة التعيين", "تمت إعادة الإعدادات إلى الوضع الافتراضي"); }}>
          <RotateCcw className="h-4 w-4" />
          إعادة تعيين
        </Button>
      </div>

      <ConfirmDialog
        open={showResetModal}
        title="تأكيد إعادة التعيين"
        message="هل أنت متأكد من إعادة تعيين جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="إعادة تعيين"
        variant="danger"
        onConfirm={reset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
}

interface TabItemProps {
  tab: { id: string; name: string; filterCategory?: string };
  onChange: (tab: { id: string; name: string; filterCategory?: string }) => void;
  onDelete: () => void;
}

function TabItem({ tab, onChange, onDelete }: TabItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <div className="flex-1 space-y-2">
        <input
          value={tab.name}
          onChange={(e) => onChange({ ...tab, name: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
          placeholder="اسم التبويب"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">تصفية حسب التصنيف:</span>
          <select
            value={tab.filterCategory || ""}
            onChange={(e) =>
              onChange({ ...tab, filterCategory: e.target.value || undefined })
            }
            className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
          >
            <option value="">الكل (بدون تصفية)</option>
            {["civil", "penal", "personal", "labor", "traffic", "companies", "investment", "commercial", "cassation", "regulation", "system"].map((cat) => (
              <option key={cat} value={cat}>
                {cat === "civil" ? "القانون المدني" :
                 cat === "penal" ? "قانون العقوبات" :
                 cat === "personal" ? "الأحوال الشخصية" :
                 cat === "labor" ? "قانون العمل" :
                 cat === "traffic" ? "قانون المرور" :
                 cat === "companies" ? "قانون الشركات" :
                 cat === "investment" ? "قانون الاستثمار" :
                 cat === "commercial" ? "القانون التجاري" :
                 cat === "cassation" ? "قرارات محكمة التمييز" :
                 cat === "regulation" ? "التعليمات" :
                 cat === "system" ? "الأنظمة" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="rounded-lg p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
        title="حذف"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
