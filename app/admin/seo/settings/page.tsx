"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Settings, Tag, Share2, Braces, Bot, Image as ImageIcon, ListTree, Zap } from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { useAdminContext } from "../../admin-context";
import { pushActivityLog, type AdminSeo, type SeoSchemaType } from "@/lib/admin-data";

const TABS = [
  { key: "general", label: "عام", icon: Settings },
  { key: "meta", label: "Meta", icon: Tag },
  { key: "og", label: "Open Graph", icon: Share2 },
  { key: "schema", label: "Schema", icon: Braces },
  { key: "robots", label: "Robots", icon: Bot },
  { key: "image", label: "صور", icon: ImageIcon },
  { key: "breadcrumb", label: "مسار التنقل", icon: ListTree },
  { key: "performance", label: "الأداء", icon: Zap },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
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

function Field({ label, desc, hint, children }: { label: string; desc?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      {desc && <p className="mb-1.5 text-xs text-muted-foreground">{desc}</p>}
      {children}
      {hint && <p className="mt-1 text-xs text-accent/80">💡 {hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default function SeoSettingsPage() {
  const { data, update } = useAdminContext();
  const [tab, setTab] = useState<TabKey>("general");
  const seo = data.seo;

  const setSeo = (patch: Partial<AdminSeo>) => {
    update("seo", { ...seo, ...patch });
  };
  const setNested = <K extends keyof AdminSeo>(key: K, patch: Partial<AdminSeo[K]>) => {
    setSeo({ [key]: { ...(seo[key] as object), ...patch } } as Partial<AdminSeo>);
  };

  const save = () => {
    const entry = pushActivityLog({
      entity: "settings",
      entityId: "seo",
      actor: "مدير النظام",
      action: "update",
      newValues: { tab },
    });
    update("activityLog", [entry, ...data.activityLog]);
    toast.success("تم الحفظ", "تم حفظ إعدادات SEO");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Settings className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold">إعدادات SEO</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Tabs */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                tab === t.key ? "bg-accent text-white" : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="min-w-0 space-y-6">
          {tab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="اسم الموقع" hint="يظهر في القوالب والـ Title">
                  <input className={inputCls} value={seo.general.siteName} onChange={(e) => setNested("general", { siteName: e.target.value })} />
                </Field>
                <Field label="الاسم المختصر">
                  <input className={inputCls} value={seo.general.shortName} onChange={(e) => setNested("general", { shortName: e.target.value })} />
                </Field>
                <Field label="الشعار (Tagline)">
                  <input className={inputCls} value={seo.general.tagline} onChange={(e) => setNested("general", { tagline: e.target.value })} />
                </Field>
                <Field label="اسم الشركة">
                  <input className={inputCls} value={seo.general.companyName} onChange={(e) => setNested("general", { companyName: e.target.value })} />
                </Field>
                <Field label="الكيان القانوني">
                  <input className={inputCls} value={seo.general.legalOrganization} onChange={(e) => setNested("general", { legalOrganization: e.target.value })} />
                </Field>
                <Field label="الدولة" desc="رمز ISO مثل IQ" hint="مهم لـ Local SEO">
                  <input dir="ltr" className={inputCls} value={seo.general.country} onChange={(e) => setNested("general", { country: e.target.value })} />
                </Field>
                <Field label="اللغة" desc="مثل ar">
                  <input dir="ltr" className={inputCls} value={seo.general.language} onChange={(e) => setNested("general", { language: e.target.value })} />
                </Field>
                <Field label="المنطقة الزمنية">
                  <input dir="ltr" className={inputCls} value={seo.general.timezone} onChange={(e) => setNested("general", { timezone: e.target.value })} />
                </Field>
                <Field label="البريد الإلكتروني">
                  <input dir="ltr" className={inputCls} value={seo.general.email} onChange={(e) => setNested("general", { email: e.target.value })} />
                </Field>
                <Field label="الهاتف">
                  <input dir="ltr" className={inputCls} value={seo.general.phone} onChange={(e) => setNested("general", { phone: e.target.value })} />
                </Field>
                <Field label="العنوان">
                  <input className={inputCls} value={seo.general.address} onChange={(e) => setNested("general", { address: e.target.value })} />
                </Field>
                <Field label="خط العرض (Latitude)">
                  <input dir="ltr" className={inputCls} value={seo.general.latitude} onChange={(e) => setNested("general", { latitude: e.target.value })} />
                </Field>
                <Field label="خط الطول (Longitude)">
                  <input dir="ltr" className={inputCls} value={seo.general.longitude} onChange={(e) => setNested("general", { longitude: e.target.value })} />
                </Field>
                <Field label="الشعار (Logo URL)">
                  <input dir="ltr" className={inputCls} value={seo.general.logo} onChange={(e) => setNested("general", { logo: e.target.value })} />
                </Field>
                <Field label="الصورة الافتراضية (Default Image)">
                  <input dir="ltr" className={inputCls} value={seo.general.defaultImage} onChange={(e) => setNested("general", { defaultImage: e.target.value })} />
                </Field>
                <Field label="Google Analytics (Measurement ID)" hint="G-XXXXXXXXXX">
                  <input dir="ltr" className={inputCls} value={seo.general.analytics.googleAnalytics} onChange={(e) => setNested("general", { analytics: { ...seo.general.analytics, googleAnalytics: e.target.value } })} />
                </Field>
                <Field label="Google Tag Manager">
                  <input dir="ltr" className={inputCls} value={seo.general.analytics.googleTagManager} onChange={(e) => setNested("general", { analytics: { ...seo.general.analytics, googleTagManager: e.target.value } })} />
                </Field>
                <Field label="Search Console Verification">
                  <input dir="ltr" className={inputCls} value={seo.general.analytics.searchConsole} onChange={(e) => setNested("general", { analytics: { ...seo.general.analytics, searchConsole: e.target.value } })} />
                </Field>
                <Field label="Bing Webmaster">
                  <input dir="ltr" className={inputCls} value={seo.general.analytics.bingWebmaster} onChange={(e) => setNested("general", { analytics: { ...seo.general.analytics, bingWebmaster: e.target.value } })} />
                </Field>
                <Field label="Yandex">
                  <input dir="ltr" className={inputCls} value={seo.general.analytics.yandex} onChange={(e) => setNested("general", { analytics: { ...seo.general.analytics, yandex: e.target.value } })} />
                </Field>
                <Field label="Facebook Verification">
                  <input dir="ltr" className={inputCls} value={seo.general.analytics.facebookVerification} onChange={(e) => setNested("general", { analytics: { ...seo.general.analytics, facebookVerification: e.target.value } })} />
                </Field>
              </CardContent>
            </Card>
          )}

          {tab === "meta" && (
            <Card>
              <CardHeader>
                <CardTitle>إعدادات Meta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="العنوان الافتراضي">
                  <input className={inputCls} value={seo.meta.defaultTitle} onChange={(e) => setNested("meta", { defaultTitle: e.target.value })} />
                </Field>
                <Field label="الوصف الافتراضي">
                  <textarea rows={3} className={inputCls} value={seo.meta.defaultDescription} onChange={(e) => setNested("meta", { defaultDescription: e.target.value })} />
                </Field>
                <Field label="فاصل العنوان (Separator)">
                  <input dir="ltr" className={inputCls} value={seo.meta.titleSeparator} onChange={(e) => setNested("meta", { titleSeparator: e.target.value })} />
                </Field>
                <Field label="قالب العنوان (Title Template)" desc="الرموز: %title% %sitename% %separator%" hint="مثل: %title% | %sitename%">
                  <input dir="ltr" className={inputCls} value={seo.meta.titleTemplate} onChange={(e) => setNested("meta", { titleTemplate: e.target.value })} />
                </Field>
                <Field label="قالب الوصف (Description Template)">
                  <input className={inputCls} value={seo.meta.descriptionTemplate} onChange={(e) => setNested("meta", { descriptionTemplate: e.target.value })} />
                </Field>
                <Field label="ترميز الأحرف (Charset)">
                  <input dir="ltr" className={inputCls} value={seo.meta.metaCharset} onChange={(e) => setNested("meta", { metaCharset: e.target.value })} />
                </Field>
                <Field label="Robots افتراضي" desc="index,follow / noindex,nofollow">
                  <input dir="ltr" className={inputCls} value={seo.meta.robotsDefault} onChange={(e) => setNested("meta", { robotsDefault: e.target.value })} />
                </Field>
                <Field label="المؤلف (Author Meta)">
                  <input className={inputCls} value={seo.meta.authorMeta} onChange={(e) => setNested("meta", { authorMeta: e.target.value })} />
                </Field>
                <Field label="الناشر (Publisher Meta)">
                  <input className={inputCls} value={seo.meta.publisherMeta} onChange={(e) => setNested("meta", { publisherMeta: e.target.value })} />
                </Field>
                <Field label="Generator Meta">
                  <input className={inputCls} value={seo.meta.generatorMeta} onChange={(e) => setNested("meta", { generatorMeta: e.target.value })} />
                </Field>
                <Field label="لون القالب (Theme Color)">
                  <input dir="ltr" className={inputCls} value={seo.meta.themeColor} onChange={(e) => setNested("meta", { themeColor: e.target.value })} />
                </Field>
                <Field label="القاعدة الأساسية (Metadata Base)" hint="رابط الموقع الكامل https://...">
                  <input dir="ltr" className={inputCls} value={seo.meta.metadataBase} onChange={(e) => setNested("meta", { metadataBase: e.target.value })} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Toggle checked={seo.meta.autoGenerateMeta} onChange={(v) => setNested("meta", { autoGenerateMeta: v })} />
                    توليد Meta تلقائياً
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Toggle checked={seo.meta.autoTrimDescription} onChange={(v) => setNested("meta", { autoTrimDescription: v })} />
                    قص الوصف تلقائياً
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "og" && (
            <Card>
              <CardHeader>
                <CardTitle>Open Graph & Twitter</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Facebook Title">
                  <input className={inputCls} value={seo.openGraph.facebookTitle} onChange={(e) => setNested("openGraph", { facebookTitle: e.target.value })} />
                </Field>
                <Field label="Facebook Description">
                  <textarea rows={2} className={inputCls} value={seo.openGraph.facebookDescription} onChange={(e) => setNested("openGraph", { facebookDescription: e.target.value })} />
                </Field>
                <Field label="Facebook Image">
                  <input dir="ltr" className={inputCls} value={seo.openGraph.facebookImage} onChange={(e) => setNested("openGraph", { facebookImage: e.target.value })} />
                </Field>
                <Field label="Twitter Card">
                  <select className={inputCls} value={seo.openGraph.twitterCard} onChange={(e) => setNested("openGraph", { twitterCard: e.target.value as AdminSeo["openGraph"]["twitterCard"] })}>
                    <option value="summary">summary</option>
                    <option value="summary_large_image">summary_large_image</option>
                    <option value="app">app</option>
                    <option value="player">player</option>
                  </select>
                </Field>
                <Field label="Twitter Image">
                  <input dir="ltr" className={inputCls} value={seo.openGraph.twitterImage} onChange={(e) => setNested("openGraph", { twitterImage: e.target.value })} />
                </Field>
                <Field label="Twitter Creator">
                  <input dir="ltr" className={inputCls} value={seo.openGraph.twitterCreator} onChange={(e) => setNested("openGraph", { twitterCreator: e.target.value })} />
                </Field>
                <Field label="Twitter Site">
                  <input dir="ltr" className={inputCls} value={seo.openGraph.twitterSite} onChange={(e) => setNested("openGraph", { twitterSite: e.target.value })} />
                </Field>
                <Field label="OG Locale">
                  <input dir="ltr" className={inputCls} value={seo.openGraph.ogLocale} onChange={(e) => setNested("openGraph", { ogLocale: e.target.value })} />
                </Field>
                <Field label="OG Type">
                  <input dir="ltr" className={inputCls} value={seo.openGraph.ogType} onChange={(e) => setNested("openGraph", { ogType: e.target.value })} />
                </Field>
                <Field label="OG Site Name">
                  <input className={inputCls} value={seo.openGraph.ogSiteName} onChange={(e) => setNested("openGraph", { ogSiteName: e.target.value })} />
                </Field>
              </CardContent>
            </Card>
          )}

          {tab === "schema" && <SchemaTab seo={seo} setNested={setNested} />}

          {tab === "robots" && (
            <Card>
              <CardHeader>
                <CardTitle>إعدادات Robots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="الإرشاد العام (Global)" desc="index,follow / noindex,nofollow / noarchive ..." hint="noindex سيمنع أرشفة الموقع بالكامل">
                  <input dir="ltr" className={inputCls} value={seo.robots.global} onChange={(e) => setNested("robots", { global: e.target.value })} />
                </Field>
                <Field label="Max Image Preview">
                  <input dir="ltr" className={inputCls} value={seo.robots.maxImagePreview} onChange={(e) => setNested("robots", { maxImagePreview: e.target.value })} />
                </Field>
                <Field label="Max Snippet (-1 = غير محدود)">
                  <input dir="ltr" type="number" className={inputCls} value={seo.robots.maxSnippet} onChange={(e) => setNested("robots", { maxSnippet: Number(e.target.value) })} />
                </Field>
                <Field label="Max Video Preview">
                  <input dir="ltr" type="number" className={inputCls} value={seo.robots.maxVideoPreview} onChange={(e) => setNested("robots", { maxVideoPreview: Number(e.target.value) })} />
                </Field>
              </CardContent>
            </Card>
          )}

          {tab === "image" && (
            <Card>
              <CardHeader>
                <CardTitle>تحسين الصور (Image SEO)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Row label="توليد Alt تلقائياً" checked={seo.image.autoAlt} onChange={(v) => setNested("image", { autoAlt: v })} />
                <Row label="توليد Title تلقائياً" checked={seo.image.autoTitle} onChange={(v) => setNested("image", { autoTitle: v })} />
                <Row label="توليد Caption تلقائياً" checked={seo.image.autoCaption} onChange={(v) => setNested("image", { autoCaption: v })} />
                <Row label="توليد Description تلقائياً" checked={seo.image.autoDescription} onChange={(v) => setNested("image", { autoDescription: v })} />
                <Row label="تحويل الصور إلى WebP" checked={seo.image.webp} onChange={(v) => setNested("image", { webp: v })} />
                <Row label="Lazy Load للصور" checked={seo.image.lazyLoad} onChange={(v) => setNested("image", { lazyLoad: v })} />
                <Row label="إدراج صور في Sitemap" checked={seo.image.imageSitemap} onChange={(v) => setNested("image", { imageSitemap: v })} />
                <Row label="ImageObject Schema" checked={seo.image.imageSchema} onChange={(v) => setNested("image", { imageSchema: v })} />
              </CardContent>
            </Card>
          )}

          {tab === "breadcrumb" && (
            <Card>
              <CardHeader>
                <CardTitle>مسار التنقل (Breadcrumb)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Row label="تفعيل Breadcrumb" checked={seo.breadcrumb.enabled} onChange={(v) => setNested("breadcrumb", { enabled: v })} />
                <Row label="BreadcrumbList Schema" checked={seo.breadcrumb.schema} onChange={(v) => setNested("breadcrumb", { schema: v })} />
                <Row label="إظهار الصفحة الرئيسية" checked={seo.breadcrumb.showHome} onChange={(v) => setNested("breadcrumb", { showHome: v })} />
                <Row label="إظهار التصنيف" checked={seo.breadcrumb.showCategory} onChange={(v) => setNested("breadcrumb", { showCategory: v })} />
                <Row label="إظهار الكاتب" checked={seo.breadcrumb.showAuthor} onChange={(v) => setNested("breadcrumb", { showAuthor: v })} />
                <Field label="فاصل المسار">
                  <input className={inputCls} value={seo.breadcrumb.separator} onChange={(e) => setNested("breadcrumb", { separator: e.target.value })} />
                </Field>
              </CardContent>
            </Card>
          )}

          {tab === "performance" && (
            <Card>
              <CardHeader>
                <CardTitle>الأداء الفني (Performance SEO)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Row label="تصغير CSS" checked={seo.performance.minifyCss} onChange={(v) => setNested("performance", { minifyCss: v })} />
                <Row label="تصغير JS" checked={seo.performance.minifyJs} onChange={(v) => setNested("performance", { minifyJs: v })} />
                <Row label="Critical CSS" checked={seo.performance.criticalCss} onChange={(v) => setNested("performance", { criticalCss: v })} />
                <Row label="تأجيل JS (Defer)" checked={seo.performance.deferJs} onChange={(v) => setNested("performance", { deferJs: v })} />
                <Row label="Lazy Load" checked={seo.performance.lazyLoad} onChange={(v) => setNested("performance", { lazyLoad: v })} />
                <Row label="تحميل الخطوط المسبق (Preload)" checked={seo.performance.preloadFonts} onChange={(v) => setNested("performance", { preloadFonts: v })} />
                <Row label="DNS Prefetch" checked={seo.performance.dnsPrefetch} onChange={(v) => setNested("performance", { dnsPrefetch: v })} />
                <Row label="Preconnect" checked={seo.performance.preconnect} onChange={(v) => setNested("performance", { preconnect: v })} />
                <Row label="HTTP/3" checked={seo.performance.http3} onChange={(v) => setNested("performance", { http3: v })} />
                <Row label="ضغط Brotli" checked={seo.performance.brotli} onChange={(v) => setNested("performance", { brotli: v })} />
                <Row label="ضغط Gzip" checked={seo.performance.gzip} onChange={(v) => setNested("performance", { gzip: v })} />
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="accent" onClick={save}>
              <Save className="h-4 w-4" />
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
      <span>{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </label>
  );
}

function SchemaTab({
  seo,
  setNested,
}: {
  seo: AdminSeo;
  setNested: <K extends keyof AdminSeo>(key: K, patch: Partial<AdminSeo[K]>) => void;
}) {
  const all: SeoSchemaType[] = [
    "Organization", "LegalService", "Attorney", "Blog", "NewsMediaOrganization",
    "LocalBusiness", "WebSite", "CollectionPage", "Person", "GovernmentOrganization",
    "FAQPage", "BreadcrumbList", "Article", "NewsArticle", "BlogPosting", "Review",
    "Rating", "SearchAction", "VideoObject", "ImageObject", "Speakable", "Dataset",
    "HowTo", "Event", "Book", "ProfilePage", "QAPage", "DiscussionForumPosting",
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات Schema.org</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="نوع الموقع الرئيسي (Site Type)">
          <select className={inputCls} value={seo.schema.siteType} onChange={(e) => setNested("schema", { siteType: e.target.value as SeoSchemaType, enabled: { ...seo.schema.enabled } })}>
            {all.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <p className="text-sm font-semibold">تفعيل/تعطيل كل نوع Schema</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((t) => (
            <label key={t} className="flex items-center justify-between rounded-lg border border-border p-2 text-xs">
              <span>{t}</span>
              <Toggle
                checked={!!seo.schema.enabled[t]}
                onChange={(v) => setNested("schema", { enabled: { ...seo.schema.enabled, [t]: v } })}
              />
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
