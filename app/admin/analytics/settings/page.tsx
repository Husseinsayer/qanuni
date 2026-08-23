"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Settings2 } from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { useAdminContext } from "../../admin-context";
import { pushActivityLog } from "@/lib/admin-data";
import { type AnalyticsSettings } from "@/lib/analytics";

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default function AnalyticsSettingsPage() {
  const { data, update } = useAdminContext();
  const a = data.analytics;

  const set = (patch: Partial<AnalyticsSettings>) => {
    update("analytics", { ...a, ...patch });
  };

  const save = () => {
    const e = pushActivityLog({ entity: "settings", entityId: "analytics", actor: "مدير النظام", action: "update", newValues: {} });
    update("activityLog", [e, ...data.activityLog]);
    toast.success("تم الحفظ", "إعدادات التحليلات");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Settings2 className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold">إعدادات التحليلات</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>التسجيل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span>تفعيل التحليلات</span>
            <Toggle checked={a.enabled} onChange={(v) => set({ enabled: v })} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span>تتبع الصفحات العامة</span>
            <Toggle checked={a.trackPublic} onChange={(v) => set({ trackPublic: v })} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span>تجاهل روبوتات محركات البحث</span>
            <Toggle checked={a.ignoreBots} onChange={(v) => set({ ignoreBots: v })} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            <span>
              نشر بيانات JSON-LD (Schema.org Dataset)
              <span className="block text-[11px] text-muted-foreground">
                يضيف وسماً وصفية في الموقع العام لتحسين فهم محركات البحث للإحصائيات
              </span>
            </span>
            <Toggle checked={a.exposeSchema} onChange={(v) => set({ exposeSchema: v })} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الاحتفاظ والجودة</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="مدة الاحتفاظ بالبيانات (أيام)">
            <input
              type="number"
              min={1}
              max={3650}
              className={inputCls}
              value={a.retentionDays}
              onChange={(e) => set({ retentionDays: Number(e.target.value) || 180 })}
            />
          </Field>
          <Field label="نسبة العينة (1-100)">
            <input
              type="number"
              min={1}
              max={100}
              className={inputCls}
              value={a.sampleRate}
              onChange={(e) => set({ sampleRate: Math.min(100, Math.max(1, Number(e.target.value) || 100)) })}
            />
          </Field>
          <Field label="الدولة الافتراضية (ISO-2)">
            <input dir="ltr" className={inputCls} value={a.defaultCountry} onChange={(e) => set({ defaultCountry: e.target.value })} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المسارات المستثناة</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="مسارات لا تسجل (مفصولة بفاصلة)">
            <input
              className={inputCls}
              value={a.ignorePaths.join(", ")}
              onChange={(e) => set({ ignorePaths: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </Field>
          <p className="mt-2 text-xs text-muted-foreground">
            تُستثنى عادة لوحة الإدارة وعناوين URL للويب هوك. مثال: /admin, /api
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
