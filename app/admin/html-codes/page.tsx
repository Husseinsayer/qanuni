"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";
import { useAdminContext } from "../admin-context";
import { pushActivityLog, type AdminHtmlCode } from "@/lib/admin-data";
import { Code2, Plus, Pencil, Trash2, Check, X, Eye } from "lucide-react";

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

export default function HtmlCodesPage() {
  const { data, update } = useAdminContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdminHtmlCode>>({});
  const [preview, setPreview] = useState<string | null>(null);

  const codes = data.htmlCodes;

  const startEdit = (c: AdminHtmlCode) => {
    setEditingId(c.id);
    setEditForm({ ...c });
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!editForm.name || !editForm.name.trim()) {
      toast.error("اسم الكود مطلوب");
      return;
    }
    const prev = codes.find((c) => c.id === editingId);
    const next = codes.map((c) =>
      c.id === editingId ? ({ ...c, ...editForm } as AdminHtmlCode) : c
    );
    update("htmlCodes", next);
    const entry = pushActivityLog({
      entity: "html",
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

  const addCode = () => {
    const newId = `html-${Date.now()}`;
    const newCode: AdminHtmlCode = {
      id: newId,
      name: "كود جديد",
      code: "",
      enabled: true,
      location: "",
    };
    update("htmlCodes", [...codes, newCode]);
    const entry = pushActivityLog({
      entity: "html",
      entityId: newId,
      actor: "مدير النظام",
      action: "create",
      newValues: newCode,
    });
    update("activityLog", [entry, ...data.activityLog]);
    toast.success("تمت الإضافة", "كود جديد");
    startEdit(newCode);
  };

  const deleteCode = (id: string) => {
    const c = codes.find((x) => x.id === id);
    update(
      "htmlCodes",
      codes.filter((x) => x.id !== id)
    );
    const entry = pushActivityLog({
      entity: "html",
      entityId: id,
      actor: "مدير النظام",
      action: "delete",
      oldValues: c,
    });
    update("activityLog", [entry, ...data.activityLog]);
    toast.success("تم الحذف", c?.name ?? "");
    setDeleteConfirm(null);
    if (editingId === id) cancelEdit();
  };

  const toggleCode = (id: string) => {
    update(
      "htmlCodes",
      codes.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const supported = ["AdSense", "Media.net", "Ezoic", "Affiliate", "JavaScript", "iframe"];

  return (
    <div className="mx-auto max-w-5xl space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Code2 className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold">إدارة أكواد HTML</h1>
        </div>
        <Button variant="accent" size="sm" onClick={addCode}>
          <Plus className="h-4 w-4" />
          إضافة كود
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        الأنواع المدعومة: {supported.join(" · ")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {codes.map((c) => (
          <div key={c.id}>
            {editingId === c.id ? (
              <Card className="border-accent/30">
                <CardContent className="space-y-3 p-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                      اسم الكود
                    </label>
                    <input
                      value={editForm.name ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                      المكان (Location)
                    </label>
                    <input
                      value={editForm.location ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="داخل <head> / قبل الفوتر"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                      الكود
                    </label>
                    <textarea
                      value={editForm.code ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))}
                      dir="ltr"
                      rows={6}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editForm.enabled ?? true}
                        onChange={(e) => setEditForm((f) => ({ ...f, enabled: e.target.checked }))}
                        className="size-4 accent-accent"
                      />
                      مفعل
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreview(editForm.code ?? "")}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      معاينة
                    </Button>
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
              <Card>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <Toggle checked={c.enabled} onChange={() => toggleCode(c.id)} />
                  </div>
                  {c.location && (
                    <p className="text-xs text-muted-foreground">{c.location}</p>
                  )}
                  <pre className="max-h-24 overflow-auto rounded-lg bg-muted/50 p-2 text-[10px] text-muted-foreground" dir="ltr">
                    {c.code || "(فارغ)"}
                  </pre>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => startEdit(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                      تعديل
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(c.id)}
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
        {codes.length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد أكواد بعد.</p>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا الكود؟"
        onConfirm={() => deleteCode(deleteConfirm!)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {preview !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setPreview(null)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">معاينة الكود</p>
              <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        </div>
      )}
    </div>
  );
}
