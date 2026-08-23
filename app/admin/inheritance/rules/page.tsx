"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";
import {
  Plus, Pencil, Trash2, X, Save, Eye, EyeOff, Loader2,
} from "lucide-react";

interface InheritanceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: number;
  isActive: boolean;
  status: string;
  version: number;
  effectiveFrom: string;
  effectiveTo: string;
  conditions: string;
  calculation: string;
  notes: string;
}

const CATEGORIES = [
  { value: "general", label: "عام" },
  { value: "spouse", label: "الزوج/الزوجة" },
  { value: "children", label: "الأبناء" },
  { value: "parents", label: "الوالدان" },
  { value: "siblings", label: "الإخوة" },
  { value: "grandparents", label: "الأجداد" },
  { value: "special", label: "حالات خاصة" },
];

const STATUSES = [
  { value: "draft", label: "مسودة", color: "bg-gray-100 text-gray-700" },
  { value: "review", label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700" },
  { value: "approved", label: "معتمدة", color: "bg-green-100 text-green-700" },
  { value: "published", label: "منشورة", color: "bg-blue-100 text-blue-700" },
  { value: "archived", label: "مؤرشفة", color: "bg-red-100 text-red-700" },
];

const emptyRule: Omit<InheritanceRule, "id"> = {
  name: "",
  description: "",
  category: "general",
  priority: 0,
  isActive: true,
  status: "draft",
  version: 1,
  effectiveFrom: "",
  effectiveTo: "",
  conditions: "[]",
  calculation: "{}",
  notes: "",
};

export default function InheritanceRulesPage() {
  const [rules, setRules] = useState<InheritanceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<InheritanceRule, "id">>(emptyRule);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/inheritance/rules");
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch {
      toast.error("فشل تحميل القواعد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const filtered = rules.filter((r) => {
    if (filterCategory && r.category !== filterCategory) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyRule });
    setModalOpen(true);
  };

  const openEdit = (rule: InheritanceRule) => {
    setEditingId(rule.id);
    const { id, ...rest } = rule;
    setForm(rest);
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("اسم القاعدة مطلوب"); return; }
    try {
      if (editingId) {
        const res = await fetch(`/api/inheritance/rules/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          toast.success("تم تحديث القاعدة");
          fetchRules();
        } else {
          toast.error("فشل التحديث");
        }
      } else {
        const res = await fetch("/api/inheritance/rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          toast.success("تم إضافة القاعدة");
          fetchRules();
        } else {
          toast.error("فشل الإضافة");
        }
      }
      setModalOpen(false);
    } catch {
      toast.error("فشل الاتصال بالخادم");
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/inheritance/rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteConfirm(null);
        toast.success("تم حذف القاعدة");
        fetchRules();
      }
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const toggleActive = async (rule: InheritanceRule) => {
    try {
      await fetch(`/api/inheritance/rules/${rule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rule, isActive: !rule.isActive }),
      });
      fetchRules();
    } catch {
      toast.error("فشل التحديث");
    }
  };

  const getStatusColor = (status: string) => STATUSES.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-700";
  const getCategoryLabel = (cat: string) => CATEGORIES.find((c) => c.value === cat)?.label || cat;

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
          <h1 className="text-2xl font-bold">قواعد الحساب</h1>
          <p className="text-sm text-muted-foreground">إدارة القواعد القانونية لحساب أنصبة الميراث</p>
        </div>
        <Button onClick={openAdd}><Plus className="ml-2 size-4" /> إضافة قاعدة</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-3">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="">كل التصنيفات</option>
            {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="">كل الحالات</option>
            {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <span className="text-sm text-muted-foreground">{filtered.length} قاعدة</span>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-xs text-muted-foreground">
                <th className="p-3">الاسم</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">الأولوية</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الإصدار</th>
                <th className="p-3">مفعل</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rule) => (
                <tr key={rule.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-3">
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{rule.description}</p>
                  </td>
                  <td className="p-3"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{getCategoryLabel(rule.category)}</span></td>
                  <td className="p-3 text-center">{rule.priority}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(rule.status)}`}>{STATUSES.find((s) => s.value === rule.status)?.label}</span></td>
                  <td className="p-3 text-center">v{rule.version}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleActive(rule)} className="text-green-500 hover:text-green-700">
                      {rule.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4 text-gray-400" />}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(rule)} className="rounded p-1 hover:bg-muted"><Pencil className="size-4" /></button>
                      <button onClick={() => setDeleteConfirm(rule.id)} className="rounded p-1 hover:bg-red-50 text-red-500"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-background shadow-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">{editingId ? "تعديل القاعدة" : "إضافة قاعدة جديدة"}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-muted"><X className="size-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">اسم القاعدة *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="مثال: نصيب الزوج مع الأولاد" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">التصنيف</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                    {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الأولوية</label>
                  <input type="number" min={0} value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الحالة</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                    {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الإصدار</label>
                  <input type="number" min={1} value={form.version} onChange={(e) => setForm({ ...form, version: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">يسري من</label>
                  <input type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">يسري إلى</label>
                  <input type="date" value={form.effectiveTo} onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="فارغ = لا نهائية" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">ملاحظات قانونية</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" rows={3} placeholder="المرجع القانوني، المادة، التعديل..." />
              </div>
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
                <Button onClick={save}><Save className="ml-2 size-4" /> حفظ</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteConfirm} onConfirm={() => deleteRule(deleteConfirm!)} onCancel={() => setDeleteConfirm(null)} title="حذف القاعدة" message="هل أنت متأكد من حذف هذه القاعدة؟" />
    </div>
  );
}
