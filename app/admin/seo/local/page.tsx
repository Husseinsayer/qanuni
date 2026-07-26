"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, MapPin, Users } from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { useAdminContext } from "../../admin-context";
import { pushActivityLog, type AdminSeo } from "@/lib/admin-data";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? "bg-accent" : "bg-muted"}`}>
      <span className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-0" : "-translate-x-5"}`} />
    </button>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}
const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default function SeoLocalPage() {
  const { data, update } = useAdminContext();
  const seo = data.seo;

  const setNested = <K extends keyof AdminSeo>(key: K, patch: Partial<AdminSeo[K]>) => {
    update("seo", { ...seo, [key]: { ...(seo[key] as object), ...patch } } as AdminSeo);
  };

  const save = () => {
    const e = pushActivityLog({ entity: "settings", entityId: "seo-local", actor: "مدير النظام", action: "update", newValues: {} });
    update("activityLog", [e, ...data.activityLog]);
    toast.success("تم الحفظ", "إعدادات Local SEO");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <MapPin className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold">Local SEO والدليل</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات الـ Local SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم الشركة"><input className={inputCls} value={seo.local.companyName} onChange={(e) => setNested("local", { companyName: e.target.value })} /></Field>
          <Field label="المهنة"><input className={inputCls} value={seo.local.profession} onChange={(e) => setNested("local", { profession: e.target.value })} /></Field>
          <Field label="ساعات العمل"><input className={inputCls} value={seo.local.workingHours} onChange={(e) => setNested("local", { workingHours: e.target.value })} /></Field>
          <Field label="خط العرض"><input dir="ltr" className={inputCls} value={seo.local.lat} onChange={(e) => setNested("local", { lat: e.target.value })} /></Field>
          <Field label="خط الطول"><input dir="ltr" className={inputCls} value={seo.local.lng} onChange={(e) => setNested("local", { lng: e.target.value })} /></Field>
          <Field label="رابط Google Maps"><input dir="ltr" className={inputCls} value={seo.local.googleMaps} onChange={(e) => setNested("local", { googleMaps: e.target.value })} /></Field>
          <Field label="واتساب"><input dir="ltr" className={inputCls} value={seo.local.whatsapp} onChange={(e) => setNested("local", { whatsapp: e.target.value })} /></Field>
          <Field label="تيليجرام"><input dir="ltr" className={inputCls} value={seo.local.telegram} onChange={(e) => setNested("local", { telegram: e.target.value })} /></Field>
          <div className="sm:col-span-2">
            <Field label="المحافظات (مفصولة بفاصلة)">
              <input className={inputCls} value={seo.local.governorates.join("، ")} onChange={(e) => setNested("local", { governorates: e.target.value.split("،").map((s) => s.trim()).filter(Boolean) })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="المدن (مفصولة بفاصلة)">
              <input className={inputCls} value={seo.local.cities.join("، ")} onChange={(e) => setNested("local", { cities: e.target.value.split("،").map((s) => s.trim()).filter(Boolean) })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="الخدمات القانونية (مفصولة بفاصلة)">
              <input className={inputCls} value={seo.local.services.join("، ")} onChange={(e) => setNested("local", { services: e.target.value.split("،").map((s) => s.trim()).filter(Boolean) })} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            حقول دليل المحامين (Directory SEO)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span>تفعيل Attorney Schema لكل محامٍ</span>
            <Toggle checked={seo.directory.enableAttorneySchema} onChange={(v) => setNested("directory", { enableAttorneySchema: v })} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span>تفعيل LegalService Schema</span>
            <Toggle checked={seo.directory.enableLegalServiceSchema} onChange={(v) => setNested("directory", { enableLegalServiceSchema: v })} />
          </label>
          <Field label="التخصص الافتراضي">
            <input className={inputCls} value={seo.directory.defaultSpecialization} onChange={(e) => setNested("directory", { defaultSpecialization: e.target.value })} />
          </Field>
          <p className="text-xs text-muted-foreground">
            الحقول الخاصة بكل محامٍ (الاسم، اللقب، رقم النقابة، المحافظة، المدينة، التخصص، سنوات الخبرة، اللغات، الهاتف، واتساب، البريد، الموقع، الإحداثيات، مواعيد العمل، التقييم، عدد القضايا) تُدار من صفحة المحامين وتُصدَر تلقائياً عبر Attorney / LegalService Schema.
          </p>
        </CardContent>
      </Card>

      <Button variant="accent" onClick={save}>
        <Save className="h-4 w-4" />
        حفظ الإعدادات
      </Button>
    </div>
  );
}
