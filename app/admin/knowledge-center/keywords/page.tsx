"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdminTable } from "@/lib/use-admin-table";
import { addItem, updateItem, softDeleteItem, restoreItem, getItems } from "@/lib/knowledge-center/store";
import { type Keyword, type LegalProcedure, type LegalTemplate, type KnowledgeQA, type GovService, type LegalTerm, KEYWORD_CATEGORIES } from "@/lib/knowledge-center/types";
import { Plus, Pencil, Trash2, X, Search, ChevronRight, ChevronLeft, RotateCcw, Archive, Download, Upload, Link } from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { exportSectionToJSON, importFromJSON, readFileAsText } from "@/lib/knowledge-center/import-export";

const emptyForm: Omit<Keyword, "id" | "createdAt" | "updatedAt" | "deletedAt"> = {
  name: "", category: KEYWORD_CATEGORIES[0], notes: "", isActive: true,
  relatedProcedureIds: [], relatedTemplateIds: [], relatedQAIds: [], relatedServiceIds: [], relatedTermIds: [],
};

export default function KeywordsPage() {
  const [items, setItems] = useState<Keyword[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [linkTab, setLinkTab] = useState<"procedures" | "templates" | "qa" | "services" | "terms">("procedures");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all items for linking
  const [allProcedures, setAllProcedures] = useState<LegalProcedure[]>([]);
  const [allTemplates, setAllTemplates] = useState<LegalTemplate[]>([]);
  const [allQA, setAllQA] = useState<KnowledgeQA[]>([]);
  const [allServices, setAllServices] = useState<GovService[]>([]);
  const [allTerms, setAllTerms] = useState<LegalTerm[]>([]);

  useEffect(() => {
    setAllProcedures(getItems("procedures", false));
    setAllTemplates(getItems("templates", false));
    setAllQA(getItems("qa", false));
    setAllServices(getItems("services", false));
    setAllTerms(getItems("terms", false));
  }, [modalOpen]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFileAsText(file);
      const result = importFromJSON(content, "keywords");
      if (result.success) { toast.success(result.message); reload(); }
      else { toast.error(result.message); }
    } catch { toast.error("فشل استيراد الملف"); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const reload = () => setItems(getItems("keywords", showArchived));
  useEffect(() => { reload(); }, [showArchived]);

  const filtered = showArchived ? items : items.filter((i) => !i.deletedAt);
  const { search, setSearch, page, setPage, paged, totalPages, total } = useAdminTable(filtered, ["name", "category"]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (item: Keyword) => { const { id, createdAt, updatedAt, deletedAt, ...rest } = item; setForm(rest); setEditingId(id); setModalOpen(true); };
  const save = () => {
    if (!form.name.trim()) return toast.error("الرجاء إدخال اسم الكلمة");
    if (editingId) { updateItem("keywords", editingId, form); toast.success("تم التعديل"); }
    else { addItem("keywords", form); toast.success("تمت الإضافة"); }
    setModalOpen(false); reload();
  };
  const remove = (id: string) => { softDeleteItem("keywords", id); toast.success("تم الحذف"); setDeleteConfirm(null); reload(); };
  const restore = (id: string) => { restoreItem("keywords", id); toast.success("تمت الاستعادة"); reload(); };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">الكلمات المفتاحية</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowArchived(!showArchived)} variant="outline" size="sm"><Archive className="h-4 w-4" /> {showArchived ? "النشطة" : "الأرشيف"}</Button>
          <Button onClick={() => exportSectionToJSON("keywords")} variant="outline" size="sm"><Download className="h-4 w-4" /> تصدير</Button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm"><Upload className="h-4 w-4" /> استيراد</Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> إضافة جديد</Button>
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">عرض {paged.length} من {total} كلمة</p>
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
                  <th className="px-4 py-3 text-right font-semibold">الكلمة</th>
                  <th className="px-4 py-3 text-right font-semibold">التصنيف</th>
                  <th className="px-4 py-3 text-right font-semibold">الروابط</th>
                  <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item) => (
                  <tr key={item.id} className={`border-b border-border/50 hover:bg-muted/20 ${item.deletedAt ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {item.relatedProcedureIds.length + item.relatedTemplateIds.length + item.relatedQAIds.length + item.relatedServiceIds.length + item.relatedTermIds.length}
                    </td>
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
      <ConfirmDialog open={deleteConfirm !== null} title="تأكيد الحذف" message="هل أنت متأكد من حذف هذه الكلمة؟" onConfirm={() => { if (deleteConfirm) remove(deleteConfirm); }} onCancel={() => setDeleteConfirm(null)} />
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <Card className="my-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "تعديل كلمة" : "إضافة كلمة جديدة"}</CardTitle>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60"><X className="h-5 w-5" /></button>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">الكلمة *</label>
                <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">التصنيف</label>
                <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {KEYWORD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">ملاحظات</label>
                <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> فعال</label>
              </div>
              {/* Linking Section */}
              <div className="border-t border-border pt-4">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium"><Link className="h-4 w-4" /> ربط بعناصر أخرى</label>
                <div className="flex gap-1 mb-2">
                  {(["procedures", "templates", "qa", "services", "terms"] as const).map((tab) => (
                    <button key={tab} onClick={() => setLinkTab(tab)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${linkTab === tab ? "bg-accent text-white" : "bg-muted/60 hover:bg-muted"}`}>
                      {tab === "procedures" ? "إجراءات" : tab === "templates" ? "نماذج" : tab === "qa" ? "أسئلة" : tab === "services" ? "خدمات" : "مصطلحات"}
                    </button>
                  ))}
                </div>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border p-2">
                  {linkTab === "procedures" && allProcedures.filter(p => !p.deletedAt).map((p) => (
                    <label key={p.id} className="flex items-center gap-2 rounded-lg p-1.5 text-sm hover:bg-muted/40 cursor-pointer">
                      <input type="checkbox" className="rounded"
                        checked={form.relatedProcedureIds.includes(p.id)}
                        onChange={(e) => setForm({ ...form, relatedProcedureIds: e.target.checked ? [...form.relatedProcedureIds, p.id] : form.relatedProcedureIds.filter(id => id !== p.id) })} />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                  {linkTab === "templates" && allTemplates.filter(t => !t.deletedAt).map((t) => (
                    <label key={t.id} className="flex items-center gap-2 rounded-lg p-1.5 text-sm hover:bg-muted/40 cursor-pointer">
                      <input type="checkbox" className="rounded"
                        checked={form.relatedTemplateIds.includes(t.id)}
                        onChange={(e) => setForm({ ...form, relatedTemplateIds: e.target.checked ? [...form.relatedTemplateIds, t.id] : form.relatedTemplateIds.filter(id => id !== t.id) })} />
                      <span className="truncate">{t.name}</span>
                    </label>
                  ))}
                  {linkTab === "qa" && allQA.filter(q => !q.deletedAt).map((q) => (
                    <label key={q.id} className="flex items-center gap-2 rounded-lg p-1.5 text-sm hover:bg-muted/40 cursor-pointer">
                      <input type="checkbox" className="rounded"
                        checked={form.relatedQAIds.includes(q.id)}
                        onChange={(e) => setForm({ ...form, relatedQAIds: e.target.checked ? [...form.relatedQAIds, q.id] : form.relatedQAIds.filter(id => id !== q.id) })} />
                      <span className="truncate">{q.question}</span>
                    </label>
                  ))}
                  {linkTab === "services" && allServices.filter(s => !s.deletedAt).map((s) => (
                    <label key={s.id} className="flex items-center gap-2 rounded-lg p-1.5 text-sm hover:bg-muted/40 cursor-pointer">
                      <input type="checkbox" className="rounded"
                        checked={form.relatedServiceIds.includes(s.id)}
                        onChange={(e) => setForm({ ...form, relatedServiceIds: e.target.checked ? [...form.relatedServiceIds, s.id] : form.relatedServiceIds.filter(id => id !== s.id) })} />
                      <span className="truncate">{s.name}</span>
                    </label>
                  ))}
                  {linkTab === "terms" && allTerms.filter(t => !t.deletedAt).map((t) => (
                    <label key={t.id} className="flex items-center gap-2 rounded-lg p-1.5 text-sm hover:bg-muted/40 cursor-pointer">
                      <input type="checkbox" className="rounded"
                        checked={form.relatedTermIds.includes(t.id)}
                        onChange={(e) => setForm({ ...form, relatedTermIds: e.target.checked ? [...form.relatedTermIds, t.id] : form.relatedTermIds.filter(id => id !== t.id) })} />
                      <span className="truncate">{t.name}</span>
                    </label>
                  ))}
                  {((linkTab === "procedures" && allProcedures.filter(p => !p.deletedAt).length === 0) ||
                    (linkTab === "templates" && allTemplates.filter(t => !t.deletedAt).length === 0) ||
                    (linkTab === "qa" && allQA.filter(q => !q.deletedAt).length === 0) ||
                    (linkTab === "services" && allServices.filter(s => !s.deletedAt).length === 0) ||
                    (linkTab === "terms" && allTerms.filter(t => !t.deletedAt).length === 0)) && (
                    <p className="py-2 text-center text-xs text-muted-foreground">لا توجد عناصر متاحة</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
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
