"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import { Plus, Trash2, Pencil, AlertTriangle, X, Save, Loader2 } from "lucide-react";

interface StopCase {
  id: string;
  name: string;
  description: string;
  condition: string;
  message: string;
  action: "stop" | "lawyer" | "review";
  isActive: boolean;
  priority: number;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  stop: { label: "إيقاف الحساب", color: "bg-red-100 text-red-700" },
  lawyer: { label: "إحالة لمحامٍ", color: "bg-amber-100 text-amber-700" },
  review: { label: "مراجعة يدوية", color: "bg-yellow-100 text-yellow-700" },
};

export default function InheritanceStopCasesPage() {
  const [cases, setCases] = useState<StopCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StopCase, "id">>({ name: "", description: "", condition: "", message: "", action: "stop", isActive: true, priority: 0 });

  const fetchCases = useCallback(async () => {
    try {
      const res = await fetch("/api/inheritance/stop-cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch {
      toast.error("فشل تحميل حالات الإيقاف");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const openAdd = () => { setEditingId(null); setForm({ name: "", description: "", condition: "", message: "", action: "stop", isActive: true, priority: 0 }); setModalOpen(true); };
  const openEdit = (c: StopCase) => { setEditingId(c.id); const { id, ...rest } = c; setForm(rest); setModalOpen(true); };

  const save = async () => {
    if (!form.name) { toast.error("الاسم مطلوب"); return; }
    try {
      if (editingId) {
        const res = await fetch(`/api/inheritance/stop-cases/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success("تم التحديث"); fetchCases(); }
      } else {
        const res = await fetch("/api/inheritance/stop-cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success("تم الإضافة"); fetchCases(); }
      }
      setModalOpen(false);
    } catch {
      toast.error("فشل الاتصال بالخادم");
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/inheritance/stop-cases/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("تم الحذف"); fetchCases(); }
    } catch {
      toast.error("فشل الحذف");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">حالات الإيقاف</h1>
          <p className="text-sm text-muted-foreground">تحديد الحالات التي يتوقف عندها الحساب أو يُحال لمحامٍ</p>
        </div>
        <Button onClick={openAdd}><Plus className="ml-2 size-4" /> إضافة حالة</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cases.map((c) => (
          <Card key={c.id} className="hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-500" />
                    <h3 className="font-bold">{c.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${actionLabels[c.action]?.color || ""}`}>
                      {actionLabels[c.action]?.label || c.action}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-2 rounded-lg bg-muted/50 p-2 text-xs">{c.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    الشرط: <code className="rounded bg-muted px-1">{c.condition}</code>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)} className="rounded p-1 hover:bg-muted"><Pencil className="size-4" /></button>
                  <button onClick={() => remove(c.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {cases.length === 0 && (
          <Card className="col-span-2">
            <CardContent className="p-8 text-center text-muted-foreground">لا توجد حالات إيقاف بعد</CardContent>
          </Card>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-background shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">{editingId ? "تعديل الحالة" : "إضافة حالة"}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-muted"><X className="size-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">اسم الحالة *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">الوصف</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">شرط التفعيل (JavaScript)</label>
                <input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm font-mono" placeholder="specialCases.includes('...')" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">رسالة المستخدم</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الإجراء</label>
                  <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value as StopCase["action"] })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                    <option value="stop">إيقاف الحساب</option>
                    <option value="lawyer">إحالة لمحامٍ</option>
                    <option value="review">مراجعة يدوية</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الأولوية</label>
                  <input type="number" min={0} value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
                <Button onClick={save}><Save className="ml-2 size-4" /> حفظ</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
