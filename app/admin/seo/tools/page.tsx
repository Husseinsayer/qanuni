"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import { useAdminContext } from "../../admin-context";
import { pushActivityLog } from "@/lib/admin-data";
import { Plus, Trash2, ArrowRightLeft, Bot } from "lucide-react";

function Banner({ children: _ }: { children?: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-200">
      ⚠️ يتطلب هذا القسم خادماً (API/Route Handler) لتطبيقه فعلياً على الطلبات. الإعدادات تُحفظ الآن؛ الربط بـ middleware قادم.
    </div>
  );
}

export default function SeoToolsPage() {
  const { data, update } = useAdminContext();
  const seo = data.seo;

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<301 | 302 | 307 | 410 | 451>(301);
  const [regex, setRegex] = useState(false);

  const addRedirect = () => {
    if (!from || !to) {
      toast.error("يجب تعبئة المصدر والوجهة");
      return;
    }
    const id = `r-${Date.now()}`;
    const next = [
      ...seo.redirects,
      { id, from, to, type, regex, enabled: true, hits: 0, createdAt: new Date().toISOString() },
    ];
    update("seo", { ...seo, redirects: next });
    const e = pushActivityLog({ entity: "settings", entityId: "redirect", actor: "مدير النظام", action: "create", newValues: { from, to, type } });
    update("activityLog", [e, ...data.activityLog]);
    setFrom(""); setTo("");
    toast.success("تمت الإضافة", "إعادة توجيه جديدة");
  };

  const delRedirect = (id: string) => {
    update("seo", { ...seo, redirects: seo.redirects.filter((r) => r.id !== id) });
    toast.success("تم الحذف");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <ArrowRightLeft className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold">أدوات SEO</h1>
      </div>

      <Banner />

      {/* Redirect Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-accent" />
            مدير إعادة التوجيه (Redirect Manager)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input dir="ltr" placeholder="/old-path" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
            <input dir="ltr" placeholder="/new-path" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
            <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={type} onChange={(e) => setType(Number(e.target.value) as typeof type)}>
              <option value={301}>301 دائم</option>
              <option value={302}>302 مؤقت</option>
              <option value={307}>307</option>
              <option value={410}>410 محذوف</option>
              <option value={451}>451 غير متاح قانونياً</option>
            </select>
            <Button variant="accent" onClick={addRedirect}>
              <Plus className="h-4 w-4" />
              إضافة
            </Button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} className="size-4 accent-accent" />
            استخدام تعبير منتظم (Regex)
          </label>
          <div className="space-y-2">
            {seo.redirects.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                <span dir="ltr" className="flex-1 truncate">{r.from} → {r.to}</span>
                <span className="rounded bg-muted px-2 py-0.5 text-xs">{r.type}</span>
                <Button variant="ghost" size="sm" onClick={() => delRedirect(r.id)} className="text-muted-foreground hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {seo.redirects.length === 0 && <p className="text-sm text-muted-foreground">لا توجد عمليات توجيه بعد.</p>}
          </div>
        </CardContent>
      </Card>

      {/* 404 Monitor */}
      <Card>
        <CardHeader>
          <CardTitle>مراقب 404 (404 Monitor)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            يُسجَّل تلقائياً عند تفعيل middleware المراقبة. حالياً: {seo.notFoundMonitor.length} مدخل.
          </p>
        </CardContent>
      </Card>

      {/* Indexing */}
      <Card>
        <CardHeader>
          <CardTitle>الأرشفة الفورية (Indexing)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span>Google Index API</span>
            <input type="checkbox" checked={seo.indexing.googleIndexApi} onChange={(e) => update("seo", { ...seo, indexing: { ...seo.indexing, googleIndexApi: e.target.checked } })} className="size-4 accent-accent" />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span>Bing IndexNow</span>
            <input type="checkbox" checked={seo.indexing.bingIndexNow} onChange={(e) => update("seo", { ...seo, indexing: { ...seo.indexing, bingIndexNow: e.target.checked } })} className="size-4 accent-accent" />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span>الأرشفة الفورية</span>
            <input type="checkbox" checked={seo.indexing.instantIndex} onChange={(e) => update("seo", { ...seo, indexing: { ...seo.indexing, instantIndex: e.target.checked } })} className="size-4 accent-accent" />
          </label>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">مفتاح IndexNow</label>
            <input dir="ltr" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={seo.indexing.indexNowKey} onChange={(e) => update("seo", { ...seo, indexing: { ...seo.indexing, indexNowKey: e.target.value } })} />
          </div>
        </CardContent>
      </Card>

      {/* AI SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            الذكاء الاصطناعي لـ SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span>تفعيل اقتراحات الذكاء الاصطناعي</span>
            <input type="checkbox" checked={seo.ai.enabled} onChange={(e) => update("seo", { ...seo, ai: { ...seo.ai, enabled: e.target.checked } })} className="size-4 accent-accent" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">المزود (Provider)</label>
              <input dir="ltr" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={seo.ai.provider} onChange={(e) => update("seo", { ...seo, ai: { ...seo.ai, provider: e.target.value } })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">مفتاح API</label>
              <input dir="ltr" type="password" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={seo.ai.apiKey} onChange={(e) => update("seo", { ...seo, ai: { ...seo.ai, apiKey: e.target.value } })} />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {([
              ["autoTitle", "إنشاء Title"],
              ["autoDescription", "إنشاء Description"],
              ["autoAlt", "إنشاء ALT"],
              ["suggestH2", "اقتراح H2"],
              ["suggestFaq", "اقتراح FAQ"],
              ["suggestKeywords", "اقتراح الكلمات"],
              ["suggestLsi", "اقتراح LSI"],
              ["suggestInternalLinks", "اقتراح روابط داخلية"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs">
                <input type="checkbox" checked={seo.ai[key]} onChange={(e) => update("seo", { ...seo, ai: { ...seo.ai, [key]: e.target.checked } })} className="size-4 accent-accent" />
                {label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk SEO */}
      <Card>
        <CardHeader>
          <CardTitle>التعديل الجماعي (Bulk SEO)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            إنشاء مهام جماعية لتوليد Meta / ALT / Slug / Schema لكل أنواع المحتوى.
          </p>
          <div className="flex flex-wrap gap-2">
            {(["meta", "alt", "slug", "schema"] as const).map((t) => (
              <Button key={t} variant="outline" size="sm" onClick={() => {
                const id = `b-${Date.now()}`;
                update("seo", { ...seo, bulk: [...seo.bulk, { id, type: t, target: "all", status: "pending", createdAt: new Date().toISOString() }] });
                toast.info("تم إنشاء مهمة", t);
              }}>
                توليد {t === "meta" ? "Meta" : t === "alt" ? "ALT" : t === "slug" ? "Slug" : "Schema"}
              </Button>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {seo.bulk.map((b) => (
              <div key={b.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                <span className="flex-1">{b.type} — {b.target}</span>
                <span className={`rounded px-2 py-0.5 text-xs ${b.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
