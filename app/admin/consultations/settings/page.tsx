"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import { Settings, Clock, Bell, CreditCard, Save, Loader2 } from "lucide-react";

interface ConsultSettings {
  enabled: boolean;
  allowOnlineBooking: boolean;
  requirePaymentUpfront: boolean;
  maxFreeConsultations: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string;
  autoAssignLawyer: boolean;
  sendNotifications: boolean;
}

const DEFAULT_SETTINGS: ConsultSettings = {
  enabled: true, allowOnlineBooking: true, requirePaymentUpfront: false,
  maxFreeConsultations: 1, workingHoursStart: "09:00", workingHoursEnd: "17:00",
  workingDays: "0,1,2,3,6", autoAssignLawyer: false, sendNotifications: true,
};

const DAYS = [
  { value: "0", label: "الأحد" }, { value: "1", label: "الإثنين" }, { value: "2", label: "الثلاثاء" },
  { value: "3", label: "الأربعاء" }, { value: "4", label: "الخميس" }, { value: "5", label: "الجمعة" },
  { value: "6", label: "السبت" },
];

export default function ConsultSettingsPage() {
  const [settings, setSettings] = useState<ConsultSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/consultations/settings").then((r) => r.json()).then((d) => { setSettings(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const update = <K extends keyof ConsultSettings>(key: K, value: ConsultSettings[K]) => setSettings((p) => ({ ...p, [key]: value }));

  const toggleDay = (day: string) => {
    const days = settings.workingDays.split(",").filter((d) => d);
    if (days.includes(day)) update("workingDays", days.filter((d) => d !== day).join(","));
    else update("workingDays", [...days, day].join(","));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/consultations/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      toast.success(res.ok ? "تم حفظ الإعدادات" : "فشل الحفظ");
    } catch { toast.error("فشل الاتصال"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات الاستشارات القانونية</h1>
          <p className="text-sm text-muted-foreground">ضبط إعدادات نظام الحجز والاستشارات</p>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Save className="ml-2 size-4" />} حفظ</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="size-5" /> الإعدادات العامة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.enabled} onChange={(e) => update("enabled", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">تفعيل الاستشارات</p><p className="text-xs text-muted-foreground">إظهار أو إخفاء نظام الاستشارات</p></div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.allowOnlineBooking} onChange={(e) => update("allowOnlineBooking", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">الحجز عبر الإنترنت</p><p className="text-xs text-muted-foreground">السماح بالحجز المباشر من الموقع</p></div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.requirePaymentUpfront} onChange={(e) => update("requirePaymentUpfront", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">الدفع المسبق</p><p className="text-xs text-muted-foreground">طلب الدفع قبل الاستشارة</p></div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.autoAssignLawyer} onChange={(e) => update("autoAssignLawyer", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">تعيين محامٍ تلقائياً</p><p className="text-xs text-muted-foreground">تعيين محامٍ متخصص تلقائياً</p></div>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="size-5" /> أوقات العمل</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">من الساعة</label>
                <input type="time" value={settings.workingHoursStart} onChange={(e) => update("workingHoursStart", e.target.value)} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">إلى الساعة</label>
                <input type="time" value={settings.workingHoursEnd} onChange={(e) => update("workingHoursEnd", e.target.value)} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">أيام العمل</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button key={d.value} onClick={() => toggleDay(d.value)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${settings.workingDays.split(",").includes(d.value) ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="size-5" /> الدفع والاستشارات المجانية</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">عدد الاستشارات المجانية</label>
              <input type="number" min={0} value={settings.maxFreeConsultations} onChange={(e) => update("maxFreeConsultations", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-2.5 text-sm" />
              <p className="mt-1 text-xs text-muted-foreground">العدد الأقصى من الاستشارات المجانية لكل عميل</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="size-5" /> الإشعارات</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.sendNotifications} onChange={(e) => update("sendNotifications", e.target.checked)} className="size-4" />
              <div><p className="text-sm font-medium">إرسال إشعارات</p><p className="text-xs text-muted-foreground">إرسال إشعارات بالبريد الإلكتروني</p></div>
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
