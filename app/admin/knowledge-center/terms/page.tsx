"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdminTable } from "@/lib/use-admin-table";
import { addItem, updateItem, softDeleteItem, restoreItem, getItems } from "@/lib/knowledge-center/store";
import { type LegalTerm, TERM_CATEGORIES } from "@/lib/knowledge-center/types";
import { Plus, Pencil, Trash2, X, Search, ChevronRight, ChevronLeft, RotateCcw, Archive, Download, Upload } from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { exportSectionToJSON, importFromJSON, readFileAsText } from "@/lib/knowledge-center/import-export";

const emptyForm: Omit<LegalTerm, "id" | "createdAt" | "updatedAt" | "deletedAt"> = {
  name: "",
  category: TERM_CATEGORIES[0],
  simplifiedDefinition: "",
  legalDefinition: "",
  examples: [],
  keywords: [],
  notes: "",
  isActive: true,
  documentTitle: "",
  author: "",
  publicationDate: "",
  documentContent: "",
};

export default function TermsPage() {
  const [items, setItems] = useState<LegalTerm[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newExample, setNewExample] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFileAsText(file);
      const result = importFromJSON(content, "terms");
      if (result.success) {
        toast.success(result.message);
        reload();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("فشل استيراد الملف");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const reload = () => setItems(getItems("terms", showArchived));
  useEffect(() => { reload(); }, [showArchived]);

  const filtered = showArchived ? items : items.filter((i) => !i.deletedAt);
  const { search, setSearch, page, setPage, paged, totalPages, total } = useAdminTable(filtered, ["documentTitle", "name", "author", "simplifiedDefinition"]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (item: LegalTerm) => {
    const { id, createdAt, updatedAt, deletedAt, ...rest } = item;
    setForm(rest);
    setEditingId(id);
    setModalOpen(true);
  };
  const save = () => {
    if (!form.documentTitle.trim() && !form.name.trim()) return toast.error("الرجاء إدخال عنوان الكتاب");
    if (editingId) { updateItem("terms", editingId, form); toast.success("تم التعديل"); }
    else { addItem("terms", form); toast.success("تمت الإضافة"); }
    setModalOpen(false);
    reload();
  };
  const remove = (id: string) => { softDeleteItem("terms", id); toast.success("تم الحذف"); setDeleteConfirm(null); reload(); };
  const restore = (id: string) => { restoreItem("terms", id); toast.success("تمت الاستعادة"); reload(); };
  const addExample = () => { if (newExample.trim()) { setForm({ ...form, examples: [...form.examples, newExample] }); setNewExample(""); } };
  const removeExample = (idx: number) => setForm({ ...form, examples: form.examples.filter((_, i) => i !== idx) });
  const addKeyword = () => { if (newKeyword.trim()) { setForm({ ...form, keywords: [...form.keywords, newKeyword] }); setNewKeyword(""); } };
  const removeKeyword = (idx: number) => setForm({ ...form, keywords: form.keywords.filter((_, i) => i !== idx) });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">الكتب والمؤلفات</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowArchived(!showArchived)} variant="outline" size="sm"><Archive className="h-4 w-4" /> {showArchived ? "النشطة" : "الأرشيف"}</Button>
          <Button onClick={() => exportSectionToJSON("terms")} variant="outline" size="sm"><Download className="h-4 w-4" /> تصدير</Button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm"><Upload className="h-4 w-4" /> استيراد</Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> إضافة جديد</Button>
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">عرض {paged.length} من {total} كتاب</p>
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
                  <th className="px-4 py-3 text-right font-semibold">عنوان الكتاب</th>
                  <th className="px-4 py-3 text-right font-semibold">المؤلف</th>
                  <th className="px-4 py-3 text-right font-semibold">تاريخ الإصدار</th>
                  <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item) => (
                  <tr key={item.id} className={`border-b border-border/50 hover:bg-muted/20 ${item.deletedAt ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3">
                      {item.deletedAt ? (
                        <span className="font-medium">{item.documentTitle || item.name}</span>
                      ) : (
                        <Link href={`/admin/knowledge-center/terms/${item.id}`} className="font-medium text-accent hover:underline">
                          {item.documentTitle || item.name}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.author || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.publicationDate || "-"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.isActive ? "فعال" : "مخفي"}</span></td>
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
      <ConfirmDialog open={deleteConfirm !== null} title="تأكيد الحذف" message="هل أنت متأكد من حذف هذا المصطلح؟" onConfirm={() => { if (deleteConfirm) remove(deleteConfirm); }} onCancel={() => setDeleteConfirm(null)} />
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <Card className="my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "تعديل كتاب" : "إضافة كتاب جديد"}</CardTitle>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60"><X className="h-5 w-5" /></button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">اسم الكتاب *</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">التصنيف</label>
                <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {TERM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">عنوان الكتاب/المستند</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.documentTitle} onChange={(e) => setForm({ ...form, documentTitle: e.target.value })} placeholder="مثال: قانون العقود العراقي" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">المؤلف/الناشر</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="اسم المؤلف أو الناشر" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">تاريخ الإصدار</label>
                <input type="date" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.publicationDate} onChange={(e) => setForm({ ...form, publicationDate: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">محتوى الكتاب</label>
                <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={6} value={form.documentContent} onChange={(e) => setForm({ ...form, documentContent: e.target.value })} placeholder="النص الكامل للكتاب..." />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">التعريف المبسط</label>
                <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={3} value={form.simplifiedDefinition} onChange={(e) => setForm({ ...form, simplifiedDefinition: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">التعريف القانوني</label>
                <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={4} value={form.legalDefinition} onChange={(e) => setForm({ ...form, legalDefinition: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">الأمثلة</label>
                {form.examples.map((ex, i) => (
                  <div key={i} className="mb-1 flex items-center gap-2 text-sm"><span>•</span><span className="flex-1">{ex}</span><button onClick={() => removeExample(i)} className="text-red-500 hover:text-red-700"><X className="h-3 w-3" /></button></div>
                ))}
                <div className="flex gap-2">
                  <input className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="إضافة مثال..." value={newExample} onChange={(e) => setNewExample(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addExample()} />
                  <Button size="sm" onClick={addExample}>إضافة</Button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">الكلمات المفتاحية</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.keywords.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {kw}<button onClick={() => removeKeyword(i)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="كلمة مفتاحية..." value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKeyword()} />
                  <Button size="sm" onClick={addKeyword}>إضافة</Button>
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
