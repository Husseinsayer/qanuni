"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import { useAdminContext } from "../admin-context";
import { pushActivityLog, type AdminAd, type AdminAdPlacement } from "@/lib/admin-data";
import { History, RotateCcw, Eye } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  create: "إنشاء",
  update: "تعديل",
  delete: "حذف",
  restore: "استعادة",
};

const ENTITY_LABELS: Record<string, string> = {
  ad: "إعلان",
  placement: "مكان إعلان",
  html: "كود HTML",
  adsense: "AdSense",
  settings: "إعدادات",
};

export default function ActivityLogPage() {
  const { data, update } = useAdminContext();
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const log = data.activityLog;

  const filtered = log.filter(
    (e) =>
      (filterEntity === "all" || e.entity === filterEntity) &&
      (filterAction === "all" || e.action === filterAction)
  );

  const restore = (entity: string, entityId: string, oldValues?: unknown) => {
    if (!oldValues || typeof oldValues !== "object") {
      toast.error("لا توجد قيم سابقة للاستعادة");
      return;
    }
    const patch = oldValues as Record<string, unknown>;
    if (entity === "ad") {
      const existing = data.ads.find((a) => a.id === entityId);
      if (!existing) {
        toast.error("الإعلان غير موجود");
        return;
      }
      const restored = { ...existing, ...patch } as AdminAd;
      update(
        "ads",
        data.ads.map((a) => (a.id === entityId ? restored : a))
      );
    } else if (entity === "placement") {
      const existing = data.adPlacements.find((p) => p.key === entityId);
      if (!existing) {
        toast.error("المكان غير موجود");
        return;
      }
      const restored = { ...existing, ...patch } as AdminAdPlacement;
      update(
        "adPlacements",
        data.adPlacements.map((p) => (p.key === entityId ? restored : p))
      );
    } else {
      toast.error("الاستعادة غير مدعومة لهذا النوع بعد");
      return;
    }
    const entry = pushActivityLog({
      entity: entity as "ad" | "placement",
      entityId,
      actor: "مدير النظام",
      action: "restore",
      oldValues,
      newValues: { restored: true },
    });
    update("activityLog", [entry, ...data.activityLog]);
    toast.success("تمت الاستعادة", `${ENTITY_LABELS[entity]}: ${entityId}`);
  };

  const fmtDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  return (
    <div className="mx-auto max-w-5xl space-y-8" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <History className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold">سجل العمليات</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="all">كل الكيانات</option>
          <option value="banner">بنر</option>
          <option value="placement">مكان إعلان</option>
          <option value="html">كود HTML</option>
          <option value="adsense">AdSense</option>
          <option value="settings">إعدادات</option>
        </select>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="all">كل العمليات</option>
          <option value="create">إنشاء</option>
          <option value="update">تعديل</option>
          <option value="delete">حذف</option>
          <option value="restore">استعادة</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد عمليات مسجلة بعد.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="rounded-lg bg-accent/10 px-2 py-1 font-semibold text-accent">
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </span>
                    <span className="text-muted-foreground">
                      {ENTITY_LABELS[entry.entity] ?? entry.entity} · {entry.entityId}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.actor} — {fmtDate(entry.timestamp)}
                  </span>
                </div>

                <div className="flex gap-2">
                  {Boolean(entry.oldValues || entry.newValues) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      التفاصيل
                    </Button>
                  )}
                  {entry.action === "update" && Boolean(entry.oldValues) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => restore(entry.entity, entry.entityId, entry.oldValues)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      استعادة النسخة السابقة
                    </Button>
                  )}
                </div>

                {expanded === entry.id && (
                  <div className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">
                        القيم القديمة
                      </p>
                      <pre className="max-h-48 overflow-auto rounded bg-muted/50 p-2 text-[10px]" dir="ltr">
                        {JSON.stringify((entry.oldValues as object) ?? {}, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">
                        القيم الجديدة
                      </p>
                      <pre className="max-h-48 overflow-auto rounded bg-muted/50 p-2 text-[10px]" dir="ltr">
                        {JSON.stringify((entry.newValues as object) ?? {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
