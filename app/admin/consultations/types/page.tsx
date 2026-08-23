"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import { Plus, Trash2, Pencil, X, Save, Loader2, GripVertical } from "lucide-react";

interface ConsultType {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  sortOrder: number;
}

const CATEGORIES = [
  { value: "family", label: "أحوال شخصية" },
  { value: "civil", label: "مدني" },
  { value: "criminal", label: "جنائي" },
  { value: "commercial", label: "تجاري" },
  { value: "administrative", label: "إداري" },
];

export default function ConsultTypesPage() {
  const [types, setTypes] = useState<ConsultType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ConsultType, "id">>({ name: "", description: "", category: "family", price: 0, durationMinutes: 30, isActive: true, sortOrder: 0 });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/consultations/types");
      if (res.ok) setTypes(await res.json());
    } catch { toast.error("فشل التحميل"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditingId(null); setForm({ name: "", description: "", category: "family", price: 0, durationMinutes: 30, isActive: true, sortOrder: types.length }); setModalOpen(true); };
  const openEdit = (t: ConsultType) => { setEditingId(t.id); const { id, ...rest } = t; setForm(rest); setModalOpen(true); };

  const save = async () => {
    if (!form.name) { toast.error("الاسم مطلوب"); return; }
    try {
      const url = editingId ? `/api/consultations/types/${editingId}` : "/api/consultations/types";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { toast.success(editingId ? "تم التحديث" : "تم الإضافة"); fetchData(); setModalOpen(false); }
    } catch { toast.error("فشل الحفظ"); }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/consultations/types/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("تم الحذف"); fetchData(); }
    } catch { toast.error("فشل الحذف"); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">أنواع الاستشارات</h1>
          <p className="text-sm text-muted-foreground">إدارة أنواع الاستشارات القانونية وأسعارها</p>
        </div>
        <Button onClick={openAdd}><Plus className="ml-2 size-4" /> إضافة نوع</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {types.map((t) => (
          <Card key={t.id} className="hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <GripVertical className="size-4 text-muted-foreground" />
                    <h3 className="font-bold">{t.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">{CATEGORIES.find((c) => c.value === t.category)?.label || t.category}</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">{t.price > 0 ? `${t.price} دينار` : "مجاني"}</span>
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">{t.durationMinutes} دقيقة</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(t)} className="rounded p-1 hover:bg-muted"><Pencil className="size-4" /></button>
                  <button onClick={() => remove(t.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-background shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">{editingId ? "تعديل النوع" : "إضافة نوع جديد"}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-muted"><X className="size-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div><label className="mb-1.5 block text-sm font-medium">الاسم *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-medium">الوصف</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">التصنيف</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                    {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                  </select>
                </div>
                <div><label className="mb-1.5 block text-sm font-medium">المدة (دقيقة)</label><input type="number" min={15} step={15} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" /></div>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium">السعر (0 = مجاني)</label><input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" /></div>
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
