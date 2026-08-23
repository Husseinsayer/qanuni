"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { useAdminTable } from "@/lib/use-admin-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";
import { toArabicDigits } from "@/lib/utils";

interface CassationDecision {
  id: string;
  number: string;
  year: string;
  date: string;
  subject: string;
  judgmentType: string;
  fullText: string;
  source: string;
  category: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const emptyItem: Omit<CassationDecision, "id"> = {
  number: "",
  year: "",
  date: "",
  subject: "",
  judgmentType: "",
  fullText: "",
  source: "",
  category: "civil",
  isActive: true,
};

const categories = [
  { value: "civil", label: "مدنية" },
  { value: "criminal", label: "جنائية" },
  { value: "administrative", label: "إدارية" },
];

const judgmentTypes = [
  { value: "نقض", label: "نقض" },
  { value: "تأييد", label: "تأييد" },
  { value: "إبطال", label: "إبطال" },
  { value: "تعديل", label: "تعديل" },
  { value: "رفض", label: "رفض" },
  { value: "قطع بانتظار", label: "قطع بانتظار" },
];

const sources = [
  { value: "محكمة التمييز المدنية", label: "محكمة التمييز المدنية" },
  { value: "محكمة التمييز الجنائية", label: "محكمة التمييز الجنائية" },
  { value: "محكمة التمييز الإدارية", label: "محكمة التمييز الإدارية" },
];

export default function CassationAdminPage() {
  const [items, setItems] = useState<CassationDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CassationDecision, "id">>(emptyItem);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/cassation");
      const data = await res.json();
      setItems(data);
    } catch {
      toast.error("خطأ", "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  const { search, setSearch, page, setPage, pageSize, setPageSize, paged, totalPages, total } = useAdminTable(items, ["number", "subject", "judgmentType", "source", "year"], 10);

  const openAdd = () => {
    setForm(emptyItem);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: CassationDecision) => {
    const { id, createdAt, updatedAt, ...rest } = item;
    setForm(rest);
    setEditingId(id);
    setModalOpen(true);
  };

  async function save() {
    if (!form.number.trim()) {
      toast.error("خطأ", "رقم القرار مطلوب");
      return;
    }
    try {
      if (editingId) {
        await fetch("/api/cassation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: editingId }),
        });
        // Use PUT for update
        await fetch(`/api/cassation/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("تم الحفظ", "تم تحديث القرار بنجاح");
      } else {
        const res = await fetch("/api/cassation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setItems((prev) => [created, ...prev]);
        toast.success("تمت الإضافة", "تم إضافة القرار بنجاح");
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      toast.error("خطأ", "فشل الحفظ");
    }
  }

  async function remove(id: string) {
    try {
      await fetch(`/api/cassation/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("تم الحذف", "تم حذف القرار بنجاح");
    } catch {
      toast.error("خطأ", "فشل الحذف");
    }
    setDeleteConfirm(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">قرارات محكمة التمييز</h1>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" />
          إضافة جديد
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">عرض {toArabicDigits(paged.length)} من {toArabicDigits(total)} قرار</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
          placeholder="بحث في القرارات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">رقم القرار</th>
                  <th className="px-4 py-3 text-right font-semibold">السنة</th>
                  <th className="px-4 py-3 text-right font-semibold">التاريخ</th>
                  <th className="px-4 py-3 text-right font-semibold">الموضوع</th>
                  <th className="px-4 py-3 text-right font-semibold">نوع الحكم</th>
                  <th className="px-4 py-3 text-right font-semibold">المصدر</th>
                  <th className="px-4 py-3 text-right font-semibold">التصنيف</th>
                  <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{item.number}</td>
                    <td className="px-4 py-3">{item.year}</td>
                    <td className="px-4 py-3">{item.date}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{item.subject}</td>
                    <td className="px-4 py-3">{item.judgmentType}</td>
                    <td className="px-4 py-3 max-w-[150px] truncate">{item.source}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                        {categories.find((c) => c.value === item.category)?.label || item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 hover:bg-muted/60">
                          <Pencil className="h-3.5 w-3.5 text-accent" />
                        </button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none">
            <ChevronRight className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 3, totalPages - 6));
            return start + i;
          }).filter((p) => p >= 1 && p <= totalPages).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-sm font-medium ${p === page ? "bg-accent text-white" : "hover:bg-muted/60"}`}>
              {toArabicDigits(p)}
            </button>
          ))}
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <span className="text-sm text-muted-foreground">صفحة {toArabicDigits(page)} من {toArabicDigits(totalPages)}</span>
        <select className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
          {[5, 10, 25, 50].map((s) => <option key={s} value={s}>{s} / صفحة</option>)}
        </select>
      </div>

      <ConfirmDialog open={deleteConfirm !== null} title="تأكيد الحذف" message="هل أنت متأكد من حذف هذا القرار؟ لا يمكن التراجع عن هذا الإجراء." onConfirm={() => remove(deleteConfirm!)} onCancel={() => setDeleteConfirm(null)} />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <Card className="my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "تعديل قرار" : "إضافة قرار جديد"}</CardTitle>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">رقم القرار *</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">السنة</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">تاريخ الجلسة</label>
                <input type="date" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">نوع الحكم</label>
                <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.judgmentType} onChange={(e) => setForm({ ...form, judgmentType: e.target.value })}>
                  <option value="">اختر نوع الحكم</option>
                  {judgmentTypes.map((j) => <option key={j.value} value={j.value}>{j.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">المصدر</label>
                <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                  <option value="">اختر المصدر</option>
                  {sources.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">التصنيف</label>
                <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">الموضوع</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">نص القرار الكامل</label>
                <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={6} value={form.fullText} onChange={(e) => setForm({ ...form, fullText: e.target.value })} dir="rtl" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-border accent-accent" />
                <label htmlFor="isActive" className="text-sm font-medium">نشط</label>
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
                <Button onClick={save}>{editingId ? "حفظ التعديلات" : "إضافة"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
