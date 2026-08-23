"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useAdminContext } from "../admin-context";
import { pushActivityLog, type AdminAdPlacement } from "@/lib/admin-data";

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

const TYPE_OPTIONS: { value: AdminAdPlacement["type"]; label: string }[] = [
  { value: "adsense", label: "AdSense" },
  { value: "banner", label: "بنر (Banner)" },
  { value: "html", label: "كود HTML" },
  { value: "none", label: "معطل" },
];

export default function AdPlacementsPage() {
  const { data, update } = useAdminContext();

  const placements = data.adPlacements;
  const customAds = data.ads.filter((a) => a.adType === "custom-gradient" || a.adType === "custom-image");
  const htmlAds = data.ads.filter((a) => a.adType === "html" || a.adType === "script");

  const patchPlacement = (
    key: string,
    patch: Partial<AdminAdPlacement>
  ) => {
    const prev = placements.find((p) => p.key === key);
    const next = placements.map((p) => (p.key === key ? { ...p, ...patch } : p));
    update("adPlacements", next);
    const entry = pushActivityLog({
      entity: "placement",
      entityId: key,
      actor: "مدير النظام",
      action: "update",
      oldValues: { type: prev?.type, enabled: prev?.enabled, adId: prev?.adId },
      newValues: { type: patch.type ?? prev?.type, enabled: patch.enabled ?? prev?.enabled, adId: patch.adId ?? prev?.adId },
    });
    update("activityLog", [entry, ...data.activityLog]);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <MapPin className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold">إدارة أماكن الإعلانات</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع أماكن الإعلانات في الموقع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {placements.map((p) => (
            <div
              key={p.key}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{p.label}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {p.key}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={p.type}
                    onChange={(e) =>
                      patchPlacement(p.key, {
                        type: e.target.value as AdminAdPlacement["type"],
                        enabled: e.target.value !== "none",
                      })
                    }
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <Toggle
                    checked={p.enabled}
                    onChange={(v) => patchPlacement(p.key, { enabled: v })}
                  />
                </div>
              </div>

              {p.type === "banner" && (
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    البنر المرتبط
                  </label>
                  <select
                    value={p.adId ?? ""}
                    onChange={(e) => patchPlacement(p.key, { adId: e.target.value || undefined })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">اختر بنراً</option>
                    {customAds.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {p.type === "html" && (
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    كود HTML المرتبط
                  </label>
                  <select
                    value={p.adId ?? ""}
                    onChange={(e) => patchPlacement(p.key, { adId: e.target.value || undefined })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">اختر كوداً</option>
                    {htmlAds.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
