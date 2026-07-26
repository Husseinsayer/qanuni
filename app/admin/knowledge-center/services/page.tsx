"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdminTable } from "@/lib/use-admin-table";
import { addItem, updateItem, softDeleteItem, restoreItem, getItems } from "@/lib/knowledge-center/store";
import { type GovService, SERVICE_CATEGORIES, GOVERNORATES } from "@/lib/knowledge-center/types";
import { Plus, Pencil, Trash2, X, Search, ChevronRight, ChevronLeft, RotateCcw, Archive, Download, Upload } from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { exportSectionToJSON, importFromJSON, readFileAsText } from "@/lib/knowledge-center/import-export";

const emptyForm: Omit<GovService, "id" | "createdAt" | "updatedAt" | "deletedAt"> = {
  name: "", category: SERVICE_CATEGORIES[0], governmentBody: "", officialUrl: "", description: "", serviceType: "", requiresLogin: false, isFullyElectronic: false, supportedGovernorates: [], notes: "", isActive: true,
};

export default function ServicesPage() {
  const [items, setItems] = useState<GovService[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFileAsText(file);
      const result = importFromJSON(content, "services");
      if (result.success) { toast.success(result.message); reload(); }
      else { toast.error(result.message); }
    } catch { toast.error("فشل استيراد الملف"); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const reload = () => setItems(getItems("services", showArchived));
  useEffect(() => { reload(); }, [showArchived]);

  const filtered = showArchived ? items : items.filter((i) => !i.deletedAt);
  const { search, setSearch, page, setPage, paged, totalPages, total } = useAdminTable(filtered, ["name", "category", "governmentBody"]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (item: GovService) => { const { id, createdAt, updatedAt, deletedAt, ...rest } = item; setForm(rest); setEditingId(id); setModalOpen(true); };
  const save = () => {
    if (!form.name.trim()) return toast.error("الرجاء إدخال اسم الخدمة");
    if (editingId) { updateItem("services", editingId, form); toast.success("تم التعديل"); }
    else { addItem("services", form); toast.success("تمت الإضافة"); }
    setModalOpen(false); reload();
  };
  const remove = (id: string) => { softDeleteItem("services", id); toast.success("تم الحذف"); setDeleteConfirm(null); reload(); };
  const restore = (id: string) => { restoreItem("services", id); toast.success("تمت الاستعادة"); reload(); };

  const toggleGov = (g: string) => {
    setForm({ ...form, supportedGovernorates: form.supportedGovernorates.includes(g) ? form.supportedGovernorates.filter((x) => x !== g) : [...form.supportedGovernorates, g] });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">الخدمات والروابط الرسمية</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowArchived(!showArchived)} variant="outline" size="sm"><Archive className="h-4 w-4" /> {showArchived ? "النشطة" : "الأرشيف"}</Button>
          <Button onClick={() => exportSectionToJSON("services")} variant="outline" size="sm"><Download className="h-4 w-4" /> تصدير</Button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm"><Upload className="h-4 w-4" /> استيراد</Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> إضافة جديد</Button>
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">عرض {paged.length} من {total} خدمة</p>
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent" placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">الاسم</th>
                  <th className="px-4 py-3 text-right font-semibold">التصنيف</th>
                  <th className="px-4 py-3 text-right font-semibold">الجهة</th>
                  <th className="px-4 py-3 text-right font-semibold">النوع</th>
                  <th className="px-4 py-3 text-right font-semibold">إلكترونية</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item) => (
                  <tr key={item.id} className={`border-b border-border/50 hover:bg-muted/20 ${item.deletedAt ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-medium">
                      {item.deletedAt ? item.name : <Link href={`/admin/knowledge-center/services/${item.id}`} className="text-accent hover:underline">{item.name}</Link>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.governmentBody}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.serviceType}</td>
                    <td className="px-4 py-3">{item.isFullyElectronic ? "نعم" : "لا"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {item.deletedAt ? <button onClick={() => restore(item.id)} className="rounded-lg p-1.5 hover:bg-green-50"><RotateCcw className="h-3.5 w-3.5 text-green-500" /></button> : <>
                          <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 hover:bg-muted/60"><Pencil className="h-3.5 w-3.5 text-accent" /></button>
                          <button onClick={() => setDeleteConfirm(item.id)} className="rounded-lg p-1.5 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">لا توجد بيانات</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-sm font-medium ${p === page ? "bg-accent text-white" : "hover:bg-muted/60"}`}>{p}</button>
            ))}
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
          </div>
          <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
        </div>
      )}
      <ConfirmDialog open={deleteConfirm !== null} title="تأكيد الحذف" message="هل أنت متأكد من حذف هذه الخدمة؟" onConfirm={() => { if (deleteConfirm) remove(deleteConfirm); }} onCancel={() => setDeleteConfirm(null)} />
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <Card className="my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "تعديل خدمة" : "إضافة خدمة جديدة"}</CardTitle>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60"><X className="h-5 w-5" /></button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">اسم الخدمة *</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">التصنيف</label>
                <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">نوع الخدمة</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الجهة الحكومية</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.governmentBody} onChange={(e) => setForm({ ...form, governmentBody: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الرابط الرسمي</label>
                <input type="url" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.officialUrl} onChange={(e) => setForm({ ...form, officialUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">الوصف</label>
                <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.requiresLogin} onChange={(e) => setForm({ ...form, requiresLogin: e.target.checked })} className="rounded" /> تحتاج تسجيل دخول</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFullyElectronic} onChange={(e) => setForm({ ...form, isFullyElectronic: e.target.checked })} className="rounded" /> إلكترونية بالكامل</label>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">المحافظات المدعومة</label>
                <div className="flex flex-wrap gap-2">
                  {GOVERNORATES.map((g) => (
                    <button key={g} type="button" onClick={() => toggleGov(g)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${form.supportedGovernorates.includes(g) ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">ملاحظات</label>
                <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> فعال</label>
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
