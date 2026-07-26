"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check, Clock, Calendar, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMyWorkingHours, updateWorkingHours,
  seedLawyerDemoData, type WorkingHours, type DayHours,
} from "@/lib/lawyer-profiles";
import { getUserSession } from "@/lib/user-auth";

const dayNames: Record<keyof WorkingHours, string> = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الاثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

const defaultHours: DayHours = { enabled: true, from: "09:00", to: "17:00" };
const disabledHours: DayHours = { enabled: false, from: "09:00", to: "17:00" };

function emptyHours(): WorkingHours {
  return {
    saturday: { ...defaultHours }, sunday: { ...defaultHours },
    monday: { ...defaultHours }, tuesday: { ...defaultHours },
    wednesday: { ...defaultHours },
    thursday: { enabled: true, from: "09:00", to: "14:00" },
    friday: { ...disabledHours },
  };
}

export default function SchedulePage() {
  const router = useRouter();
  const [hours, setHours] = useState<WorkingHours>(emptyHours());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getUserSession();
    if (!s || s.role !== "lawyer") { router.push("/auth/login"); return; }
    seedLawyerDemoData();
    setHours(getMyWorkingHours());
  }, [router]);

  const updateDay = (day: keyof WorkingHours, field: keyof DayHours, value: boolean | string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = () => {
    updateWorkingHours(hours);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const days = Object.entries(dayNames) as [keyof WorkingHours, string][];

  // Count enabled days
  const enabledCount = Object.values(hours).filter((d) => d.enabled).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">مواعيد العمل</h1>
          <p className="mt-1 text-muted-foreground">
            {enabledCount > 0
              ? `تعمل ${enabledCount} أيام في الأسبوع`
              : "حدد أيام وساعات عملك"}
          </p>
        </div>
        <Button onClick={handleSave} variant="accent" className="gap-2 shadow-soft">
          {saved ? <><Check className="size-4" /> تم الحفظ</> : <><Save className="size-4" /> حفظ المواعيد</>}
        </Button>
      </div>

      {saved && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success flex items-center gap-2">
          <Check className="size-4" /> تم حفظ مواعيد العمل ✓
        </div>
      )}

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="size-5 text-accent" />
            أيام وساعات العمل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {days.map(([day, label]) => (
            <div key={day} className={cn(
              "flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-4 transition-all",
              hours[day].enabled ? "border-border bg-card" : "border-dashed border-muted-foreground/30 bg-muted/10"
            )}>
              {/* Day name + toggle */}
              <div className="flex items-center gap-3 sm:w-40">
                <div className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                  hours[day].enabled ? "bg-accent" : "bg-muted-foreground/30"
                )} onClick={() => updateDay(day, "enabled", !hours[day].enabled)}>
                  <span className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                    hours[day].enabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </div>
                <span className={cn("font-semibold text-sm", hours[day].enabled ? "text-foreground" : "text-muted-foreground/60")}>
                  {label}
                </span>
              </div>

              {/* Time inputs */}
              {hours[day].enabled ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={hours[day].from}
                    onChange={(e) => updateDay(day, "from", e.target.value)}
                    className="h-10 rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 flex-1" />
                  <span className="text-muted-foreground font-bold">—</span>
                  <input type="time" value={hours[day].to}
                    onChange={(e) => updateDay(day, "to", e.target.value)}
                    className="h-10 rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 flex-1" />
                </div>
              ) : (
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground/50">يوم عطلة</span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="size-5 text-accent" />
            ملخص الأسبوع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {days.map(([day, label]) => (
              <div key={day} className={cn(
                "rounded-lg px-3 py-2 text-xs font-bold border",
                hours[day].enabled
                  ? "bg-accent/10 text-accent border-accent/30"
                  : "bg-muted/30 text-muted-foreground/50 border-muted-foreground/20"
              )}>
                <p>{label}</p>
                {hours[day].enabled && (
                  <p className="mt-0.5 font-normal" dir="ltr">{hours[day].from} - {hours[day].to}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
