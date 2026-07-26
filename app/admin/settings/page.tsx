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
  Phone,
  Bot,
  MapPinned,
  RotateCcw,
  Save,
  Plus,
  X,
  AlertTriangle,
  Palette,
  Type,
  Image,
  Trash2,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { useAdminContext } from "../admin-context";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";

type GeneralConfig = {
  siteName: string;
  siteDescription: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  aiEnabled: boolean;
  aiGreeting: string;
  aiExample: string;
  aiPlaceholder: string;
  aiComingSoon: string;
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
  siteName: "قانوني",
  siteDescription:
    "منصة قانونية عراقية شاملة — ابحث في القوانين والمحامين والمقالات",
  tagline: "دليلك الذكي للقوانين العراقية",
  phone: "+964 700 000 0000",
  email: "info@iqlegal.example",
  address: "بغداد — الكرخ، شارع الرشيد",
  workingHours: "السبت — الخميس · 9 ص — 5 م",
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
  const [config, setConfig] = useState<GeneralConfig>(defaults);
  const [showResetModal, setShowResetModal] = useState(false);

  const update = <K extends keyof GeneralConfig>(
    key: K,
    val: GeneralConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
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
          <CardTitle>معلومات المنصة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              اسم الموقع
            </label>
            <input
              value={config.siteName}
              onChange={(e) => update("siteName", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              وصف الموقع (Footer)
            </label>
            <textarea
              value={config.siteDescription}
              onChange={(e) => update("siteDescription", e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              الشعار المختصر
            </label>
            <input
              value={config.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-accent" />
            معلومات التواصل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                رقم الهاتف
              </label>
              <input
                value={config.phone}
                onChange={(e) => update("phone", e.target.value)}
                dir="ltr"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-left text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                البريد الإلكتروني
              </label>
              <input
                value={config.email}
                onChange={(e) => update("email", e.target.value)}
                dir="ltr"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-left text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              العنوان
            </label>
            <input
              value={config.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              ساعات العمل
            </label>
            <input
              value={config.workingHours}
              onChange={(e) => update("workingHours", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </CardContent>
      </Card>

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
              <input value={config.logoUrl} onChange={(e) => update("logoUrl", e.target.value)}
                placeholder="رابط الصورة..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" dir="ltr" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">الشعار (Dark)</label>
              <input value={config.darkLogoUrl} onChange={(e) => update("darkLogoUrl", e.target.value)}
                placeholder="رابط الصورة..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" dir="ltr" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">الأيقونة المفضلة (Favicon)</label>
              <input value={config.faviconUrl} onChange={(e) => update("faviconUrl", e.target.value)}
                placeholder="رابط الصورة..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm" dir="ltr" />
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
        <Button variant="accent" onClick={() => toast.success("تم الحفظ بنجاح", "تم حفظ الإعدادات العامة")}>
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
