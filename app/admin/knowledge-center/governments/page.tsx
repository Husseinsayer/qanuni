"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdminTable } from "@/lib/use-admin-table";
import { addItem, updateItem, softDeleteItem, restoreItem, getItems } from "@/lib/knowledge-center/store";
import { type GovernmentBody, GOVERNMENT_CATEGORIES, GOVERNORATES } from "@/lib/knowledge-center/types";
import { Plus, Pencil, Trash2, X, Search, ChevronRight, ChevronLeft, RotateCcw, Archive, Download, Upload } from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { exportSectionToJSON, importFromJSON, readFileAsText } from "@/lib/knowledge-center/import-export";

const emptyForm: Omit<GovernmentBody, "id" | "createdAt" | "updatedAt" | "deletedAt"> = {
  name: "", description: "", jurisdiction: "", address: "", governorate: GOVERNORATES[0], phoneNumbers: [], website: "", workingHours: "", notes: "", isActive: true,
};

export default function GovernmentsPage() {
  const [items, setItems] = useState<GovernmentBody[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newPhone, setNewPhone] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFileAsText(file);
      const result = importFromJSON(content, "governments");
      if (result.success) { toast.success(result.message); reload(); }
      else { toast.error(result.message); }
    } catch { toast.error("فشل استيراد الملف"); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const reload = () => setItems(getItems("governments", showArchived));
  useEffect(() => { reload(); }, [showArchived]);

  const filtered = showArchived ? items : items.filter((i) => !i.deletedAt);
  const { search, setSearch, page, setPage, paged, totalPages, total } = useAdminTable(filtered, ["name", "governorate", "jurisdiction"]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (item: GovernmentBody) => { const { id, createdAt, updatedAt, deletedAt, ...rest } = item; setForm(rest); setEditingId(id); setModalOpen(true); };
  const save = () => {
    if (!form.name.trim()) return toast.error("الرجاء إدخال اسم الجهة");
    if (editingId) { updateItem("governments", editingId, form); toast.success("تم التعديل"); }
    else { addItem("governments", form); toast.success("تمت الإضافة"); }
    setModalOpen(false); reload();
  };
  const remove = (id: string) => { softDeleteItem("governments", id); toast.success("تم الحذف"); setDeleteConfirm(null); reload(); };
  const restore = (id: string) => { restoreItem("governments", id); toast.success("تمت الاستعادة"); reload(); };
  const addPhone = () => { if (newPhone.trim()) { setForm({ ...form, phoneNumbers: [...form.phoneNumbers, newPhone] }); setNewPhone(""); } };
  const removePhone = (idx: number) => setForm({ ...form, phoneNumbers: form.phoneNumbers.filter((_, i) => i !== idx) });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">الجهات الحكومية</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowArchived(!showArchived)} variant="outline" size="sm"><Archive className="h-4 w-4" /> {showArchived ? "النشطة" : "الأرشيف"}</Button>
          <Button onClick={() => exportSectionToJSON("governments")} variant="outline" size="sm"><Download className="h-4 w-4" /> تصدير</Button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm"><Upload className="h-4 w-4" /> استيراد</Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> إضافة جديد</Button>
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">عرض {paged.length} من {total} جهة</p>
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
                  <th className="px-4 py-3 text-right font-semibold">المحافظة</th>
                  <th className="px-4 py-3 text-right font-semibold">الاختصاص</th>
                  <th className="px-4 py-3 text-right font-semibold">الموقع</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item) => (
                  <tr key={item.id} className={`border-b border-border/50 hover:bg-muted/20 ${item.deletedAt ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-medium">
                      {item.deletedAt ? item.name : <Link href={`/admin/knowledge-center/governments/${item.id}`} className="text-accent hover:underline">{item.name}</Link>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.governorate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.jurisdiction}</td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{item.website}</td>
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
                {paged.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">لا توجد بيانات</td></tr>}
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
      <ConfirmDialog open={deleteConfirm !== null} title="تأكيد الحذف" message="هل أنت متأكد من حذف هذه الجهة؟" onConfirm={() => { if (deleteConfirm) remove(deleteConfirm); }} onCancel={() => setDeleteConfirm(null)} />
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <Card className="my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "تعديل جهة" : "إضافة جهة جديدة"}</CardTitle>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60"><X className="h-5 w-5" /></button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">اسم الجهة *</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">المحافظة</label>
                <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}>
                  {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الاختصاص</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.jurisdiction} onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">الوصف</label>
                <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">العنوان</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الموقع الإلكتروني</label>
                <input type="url" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">ساعات الدوام</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">أرقام الاتصال</label>
                {form.phoneNumbers.map((p, i) => (
                  <div key={i} className="mb-1 flex items-center gap-2 text-sm"><span>•</span><span className="flex-1">{p}</span><button onClick={() => removePhone(i)} className="text-red-500 hover:text-red-700"><X className="h-3 w-3" /></button></div>
                ))}
                <div className="flex gap-2">
                  <input className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="رقم هاتف..." value={newPhone} onChange={(e) => setNewPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPhone()} />
                  <Button size="sm" onClick={addPhone}>إضافة</Button>
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
