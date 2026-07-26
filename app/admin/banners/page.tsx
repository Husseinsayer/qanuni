"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";
import { useAdminContext } from "../admin-context";
import {
  pushActivityLog,
  type AdminAd,
  type AdTargetDevices,
} from "@/lib/admin-data";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Monitor,
  Tablet,
  Smartphone,
  Image as ImageIcon,
} from "lucide-react";

const GRADIENT_PRESETS = [
  { label: "أزرق-نيلي", value: "from-blue-600 to-indigo-700" },
  { label: "كهرماني-برتقالي", value: "from-amber-500 to-orange-600" },
  { label: "زمردي-أخضر", value: "from-emerald-500 to-teal-600" },
  { label: "بنفسجي-فوشيا", value: "from-purple-500 to-fuchsia-600" },
  { label: "رمادي داكن", value: "from-slate-700 to-slate-900" },
  { label: "وردي-زهري", value: "from-rose-500 to-pink-600" },
];

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

function DeviceCheckbox({
  label,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string;
  icon: typeof Monitor;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border p-2 text-xs">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-accent"
      />
      <Icon className="size-4" />
      {label}
    </label>
  );
}

export default function BannersPage() {
  const { data, update } = useAdminContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdminAd>>({});

  const banners = data.ads.filter((a) => a.adType === "custom");

  const startEdit = (ad: AdminAd) => {
    setEditingId(ad.id);
    setEditForm({ ...ad });
  };

  const setDevice = (key: keyof AdTargetDevices, v: boolean) => {
    setEditForm((f) => ({
      ...f,
      devices: { ...(f.devices as AdTargetDevices), [key]: v },
    }));
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!editForm.name || !editForm.name.trim()) {
      toast.error("اسم الإعلان مطلوب");
      return;
    }
    const prev = data.ads.find((a) => a.id === editingId);
    const next = data.ads.map((a) =>
      a.id === editingId ? ({ ...a, ...editForm } as AdminAd) : a
    );
    update("ads", next);
    const entry = pushActivityLog({
      entity: "banner",
      entityId: editingId,
      actor: "مدير النظام",
      action: "update",
      oldValues: prev,
      newValues: { ...prev, ...editForm },
    });
    update("activityLog", [entry, ...data.activityLog]);
    toast.success("تم الحفظ بنجاح", editForm.name);
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const addBanner = () => {
    const newId = `ad-${Date.now()}`;
    const newAd: AdminAd = {
      id: newId,
      name: "إعلان جديد",
      enabled: true,
      adType: "custom",
      title: "",
      subtitle: "",
      cta: "",
      gradient: GRADIENT_PRESETS[0].value,
      image: "",
      linkUrl: "#",
      openInNew: false,
      priority: 5,
      devices: { desktop: true, tablet: true, mobile: true },
      targeting: {
        countries: [],
        languages: [],
        categories: [],
        tags: [],
        authors: [],
        pageTypes: [],
      },
      stats: { impressions: 0, clicks: 0 },
    };
    update("ads", [...data.ads, newAd]);
    const entry = pushActivityLog({
      entity: "banner",
      entityId: newId,
      actor: "مدير النظام",
      action: "create",
      newValues: newAd,
    });
    update("activityLog", [entry, ...data.activityLog]);
    toast.success("تمت الإضافة", "إعلان جديد");
    startEdit(newAd);
  };

  const deleteBanner = (id: string) => {
    const ad = data.ads.find((a) => a.id === id);
    update(
      "ads",
      data.ads.filter((a) => a.id !== id)
    );
    const entry = pushActivityLog({
      entity: "banner",
      entityId: id,
      actor: "مدير النظام",
      action: "delete",
      oldValues: ad,
    });
    update("activityLog", [entry, ...data.activityLog]);
    toast.success("تم الحذف", ad?.name ?? "");
    setDeleteConfirm(null);
    if (editingId === id) cancelEdit();
  };

  const toggleBanner = (id: string) => {
    update(
      "ads",
      data.ads.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Megaphone className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold">إدارة البنرات الإعلانية</h1>
        </div>
        <Button variant="accent" size="sm" onClick={addBanner}>
          <Plus className="h-4 w-4" />
          إضافة إعلان
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((ad) => (
          <div key={ad.id}>
            {editingId === ad.id ? (
              <Card className="border-accent/30">
                <CardContent className="space-y-3 p-4">
                  <Field label="اسم الإعلان">
                    <input
                      value={editForm.name ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </Field>
                  <Field label="صورة (رابط URL)">
                    <input
                      value={editForm.image ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, image: e.target.value }))}
                      dir="ltr"
                      placeholder="https://..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </Field>
                  <Field label="رابط">
                    <input
                      value={editForm.linkUrl ?? ""}
                      dir="ltr"
                      onChange={(e) => setEditForm((f) => ({ ...f, linkUrl: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editForm.openInNew ?? false}
                      onChange={(e) => setEditForm((f) => ({ ...f, openInNew: e.target.checked }))}
                      className="size-4 accent-accent"
                    />
                    فتح في نافذة جديدة
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="تاريخ البداية">
                      <input
                        type="date"
                        value={editForm.startAt?.slice(0, 10) ?? ""}
                        onChange={(e) => setEditForm((f) => ({ ...f, startAt: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </Field>
                    <Field label="تاريخ الانتهاء">
                      <input
                        type="date"
                        value={editForm.endAt?.slice(0, 10) ?? ""}
                        onChange={(e) => setEditForm((f) => ({ ...f, endAt: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </Field>
                  </div>
                  <Field label="الأولوية">
                    <input
                      type="number"
                      value={editForm.priority ?? 5}
                      onChange={(e) => setEditForm((f) => ({ ...f, priority: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </Field>

                  {/* Devices */}
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      الأجهزة المستهدفة
                    </p>
                    <div className="flex gap-2">
                      <DeviceCheckbox
                        label="سطح المكتب"
                        icon={Monitor}
                        checked={editForm.devices?.desktop ?? true}
                        onChange={(v) => setDevice("desktop", v)}
                      />
                      <DeviceCheckbox
                        label="اللوحي"
                        icon={Tablet}
                        checked={editForm.devices?.tablet ?? true}
                        onChange={(v) => setDevice("tablet", v)}
                      />
                      <DeviceCheckbox
                        label="الجوال"
                        icon={Smartphone}
                        checked={editForm.devices?.mobile ?? true}
                        onChange={(v) => setDevice("mobile", v)}
                      />
                    </div>
                  </div>

                  {/* Gradient picker (fallback when no image) */}
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      التدرج اللوني (عند عدم وجود صورة)
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {GRADIENT_PRESETS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setEditForm((f) => ({ ...f, gradient: g.value }))}
                          className={`rounded-lg bg-gradient-to-l ${g.value} px-2 py-1.5 text-[10px] font-bold text-white transition ${
                            editForm.gradient === g.value
                              ? "ring-2 ring-accent ring-offset-2"
                              : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="accent" size="sm" onClick={saveEdit} className="flex-1">
                      <Check className="h-4 w-4" />
                      حفظ
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelEdit} className="flex-1">
                      <X className="h-4 w-4" />
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div
                  className={`${
                    ad.image
                      ? "bg-muted"
                      : `bg-gradient-to-l ${ad.gradient ?? GRADIENT_PRESETS[0].value}`
                  } flex h-32 items-center justify-center p-3 text-white`}
                >
                  {ad.image ? (
                    <img src={ad.image} alt={ad.name} loading="lazy" className="max-h-full rounded object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-center">{ad.title || ad.name}</span>
                  )}
                </div>
                <CardContent className="space-y-2 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{ad.name}</p>
                    <Toggle checked={ad.enabled} onChange={() => toggleBanner(ad.id)} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    الظهور: {ad.stats?.impressions ?? 0} · النقرات: {ad.stats?.clicks ?? 0}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => startEdit(ad)}>
                      <Pencil className="h-3.5 w-3.5" />
                      تعديل
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(ad.id)}
                      className="text-muted-foreground hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => deleteBanner(deleteConfirm!)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
