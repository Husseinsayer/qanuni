"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdminTable } from "@/lib/use-admin-table";
import { addItem, updateItem, softDeleteItem, restoreItem, getItems } from "@/lib/knowledge-center/store";
import { type LegalTemplate, type TemplateVariable, TEMPLATE_CATEGORIES } from "@/lib/knowledge-center/types";
import { Plus, Pencil, Trash2, X, Search, ChevronRight, ChevronLeft, RotateCcw, Archive, Download, Upload, Eye, EyeOff, Bold, Italic, Underline, List, ListOrdered, AlignRight, AlignCenter, FileText, Copy, Check } from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { exportSectionToJSON, importFromJSON, readFileAsText } from "@/lib/knowledge-center/import-export";

const emptyForm: Omit<LegalTemplate, "id" | "createdAt" | "updatedAt" | "deletedAt"> = {
  name: "", category: TEMPLATE_CATEGORIES[0], description: "", content: "", variables: [], keywords: [], notes: "", isActive: true,
};

// Predefined fillable field types for legal templates
const FIELD_TYPES = [
  { id: "name", label: "الاسم الكامل", placeholder: "{{الاسم_الكامل}}" },
  { id: "national_id", label: "رقم الهوية", placeholder: "{{رقم_الهوية}}" },
  { id: "date", label: "التاريخ", placeholder: "{{التاريخ}}" },
  { id: "address", label: "العنوان", placeholder: "{{العنوان}}" },
  { id: "phone", label: "رقم الهاتف", placeholder: "{{رقم_الهاتف}}" },
  { id: "amount", label: "المبلغ", placeholder: "{{المبلغ}}" },
  { id: "description", label: "الوصف", placeholder: "{{الوصف}}" },
  { id: "signature", label: "التوقيع", placeholder: "{{التوقيع}}" },
];

export default function TemplatesPage() {
  const [items, setItems] = useState<LegalTemplate[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newVarName, setNewVarName] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFileAsText(file);
      const result = importFromJSON(content, "templates");
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

  const reload = () => setItems(getItems("templates", showArchived));
  useEffect(() => { reload(); }, [showArchived]);

  const filtered = showArchived ? items : items.filter((i) => !i.deletedAt);
  const { search, setSearch, page, setPage, paged, totalPages, total } = useAdminTable(filtered, ["name", "category"]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (item: LegalTemplate) => {
    const { id, createdAt, updatedAt, deletedAt, ...rest } = item;
    setForm(rest); setEditingId(id); setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return toast.error("الرجاء إدخال اسم النموذج");
    if (editingId) { updateItem("templates", editingId, form); toast.success("تم التعديل"); }
    else { addItem("templates", form); toast.success("تمت الإضافة"); }
    setModalOpen(false); reload();
  };

  const remove = (id: string) => { softDeleteItem("templates", id); toast.success("تم الحذف"); setDeleteConfirm(null); reload(); };
  const restore = (id: string) => { restoreItem("templates", id); toast.success("تمت الاستعادة"); reload(); };

  const addVar = () => {
    if (!newVarName.trim()) return;
    setForm({ ...form, variables: [...form.variables, { id: `v-${Date.now()}`, name: newVarName, placeholder: "", defaultValue: "", required: true }] });
    setNewVarName("");
  };
  const removeVar = (id: string) => setForm({ ...form, variables: form.variables.filter((v) => v.id !== id) });
  const addKeyword = () => { if (newKeyword.trim()) { setForm({ ...form, keywords: [...form.keywords, newKeyword] }); setNewKeyword(""); } };
  const removeKeyword = (idx: number) => setForm({ ...form, keywords: form.keywords.filter((_, i) => i !== idx) });

  // Insert variable at cursor position in textarea
  const insertVariable = (variableName: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = form.content;
      const newText = text.substring(0, start) + `{{${variableName}}}` + text.substring(end);
      setForm({ ...form, content: newText });
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableName.length + 4, start + variableName.length + 4);
      }, 0);
    }
  };

  // Insert field type at cursor position
  const insertFieldType = (placeholder: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = form.content;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setForm({ ...form, content: newText });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  // Copy variable to clipboard
  const copyVariable = (varName: string) => {
    navigator.clipboard.writeText(`{{${varName}}}`);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
    toast.success(`تم نسخ {{${varName}}}`);
  };

  // Apply formatting to selected text
  const applyFormat = (format: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = form.content;
      const selectedText = text.substring(start, end);
      let newText = "";
      let newCursorPos = end;

      switch (format) {
        case "bold":
          newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
          newCursorPos = end + 4;
          break;
        case "italic":
          newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
          newCursorPos = end + 2;
          break;
        case "underline":
          newText = text.substring(0, start) + `__${selectedText}__` + text.substring(end);
          newCursorPos = end + 4;
          break;
        case "list":
          newText = text.substring(0, start) + `\n• ${selectedText}` + text.substring(end);
          newCursorPos = end + 3;
          break;
        case "ordered-list":
          newText = text.substring(0, start) + `\n1. ${selectedText}` + text.substring(end);
          newCursorPos = end + 4;
          break;
        default:
          return;
      }

      setForm({ ...form, content: newText });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">النماذج القانونية</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowArchived(!showArchived)} variant="outline" size="sm"><Archive className="h-4 w-4" /> {showArchived ? "النشطة" : "الأرشيف"}</Button>
          <Button onClick={() => exportSectionToJSON("templates")} variant="outline" size="sm"><Download className="h-4 w-4" /> تصدير</Button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm"><Upload className="h-4 w-4" /> استيراد</Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4" /> إضافة جديد</Button>
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">عرض {paged.length} من {total} نموذج</p>
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
                  <th className="px-4 py-3 text-right font-semibold">المتغيرات</th>
                  <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item) => (
                  <tr key={item.id} className={`border-b border-border/50 hover:bg-muted/20 ${item.deletedAt ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-medium">
                      {item.deletedAt ? item.name : <Link href={`/admin/knowledge-center/templates/${item.id}`} className="text-accent hover:underline">{item.name}</Link>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.variables.length}</td>
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
      <ConfirmDialog open={deleteConfirm !== null} title="تأكيد الحذف" message="هل أنت متأكد من حذف هذا النموذج؟" onConfirm={() => { if (deleteConfirm) remove(deleteConfirm); }} onCancel={() => setDeleteConfirm(null)} />
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <Card className="my-8 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "تعديل نموذج" : "إضافة نموذج جديد"}</CardTitle>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60"><X className="h-5 w-5" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium">اسم النموذج *</label>
                  <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">التصنيف</label>
                  <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {TEMPLATE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">الحالة</label>
                  <label className="flex items-center gap-2 h-10 px-3 text-sm">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                    فعال
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium">الوصف</label>
                  <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>

              {/* Professional Template Editor */}
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">نص النموذج</label>
                
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-border bg-muted/30 px-2 py-1.5">
                  <button onClick={() => applyFormat("bold")} className="rounded p-1.5 hover:bg-muted/60" title="غامق"><Bold className="h-4 w-4" /></button>
                  <button onClick={() => applyFormat("italic")} className="rounded p-1.5 hover:bg-muted/60" title="مائل"><Italic className="h-4 w-4" /></button>
                  <button onClick={() => applyFormat("underline")} className="rounded p-1.5 hover:bg-muted/60" title="تحته خط"><Underline className="h-4 w-4" /></button>
                  <div className="mx-1 h-4 w-px bg-border" />
                  <button onClick={() => applyFormat("list")} className="rounded p-1.5 hover:bg-muted/60" title="قائمة نقطية"><List className="h-4 w-4" /></button>
                  <button onClick={() => applyFormat("ordered-list")} className="rounded p-1.5 hover:bg-muted/60" title="قائمة مرقمة"><ListOrdered className="h-4 w-4" /></button>
                  <div className="mx-1 h-4 w-px bg-border" />
                  <button onClick={() => setShowPreview(!showPreview)} className={`rounded p-1.5 ${showPreview ? "bg-accent text-white" : "hover:bg-muted/60"}`} title="معاينة">
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <textarea 
                  ref={textareaRef}
                  className="w-full rounded-b-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent font-mono" 
                  rows={12} 
                  value={form.content} 
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="اكتب نص النموذج هنا... استخدم {{اسم_المتغير}} لإدراج متغير"
                />
                
                {/* Quick Insert Fields */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">حقول سريعة:</span>
                  {FIELD_TYPES.map((field) => (
                    <button
                      key={field.id}
                      onClick={() => insertFieldType(field.placeholder)}
                      className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {field.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="col-span-2 rounded-xl border border-border bg-muted/20 p-4">
                  <h4 className="mb-2 text-sm font-semibold flex items-center gap-2"><Eye className="h-4 w-4 text-accent" /> معاينة النموذج</h4>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {form.content.split(/(\{\{[^}]+\}\})/).map((part, i) => {
                      if (part.match(/^\{\{[^}]+\}\}$/)) {
                        const varName = part.slice(2, -2);
                        return (
                          <span key={i} className="inline-flex items-center gap-1 rounded bg-accent/20 px-1.5 py-0.5 text-xs font-semibold text-accent">
                            {varName}
                          </span>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                </div>
              )}

              {/* Variables Management */}
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">المتغيرات ({form.variables.length})</label>
                {form.variables.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">لم تضف أي متغيرات بعد. أضف متغيرات يدوياً أو استخدم الحقول السريعة أعلاه.</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {form.variables.map((v) => (
                      <div key={v.id} className="flex items-center gap-2 rounded-lg border border-border p-2 bg-muted/20">
                        <span className="text-sm font-medium font-mono text-accent">{`{{${v.name}}}`}</span>
                        <span className="text-xs text-muted-foreground flex-1">{v.placeholder || v.defaultValue || "بدون وصف"}</span>
                        <button onClick={() => copyVariable(v.name)} className="rounded p-1 hover:bg-muted/60" title="نسخ">
                          {copiedVar === v.name ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                        <button onClick={() => insertVariable(v.name)} className="rounded p-1 hover:bg-muted/60" title="إدراج في النص">
                          <Plus className="h-3.5 w-3.5 text-accent" />
                        </button>
                        <button onClick={() => removeVar(v.id)} className="rounded p-1 hover:bg-red-50 text-red-500 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="اسم المتغير الجديد..." value={newVarName} onChange={(e) => setNewVarName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addVar()} />
                  <Button size="sm" onClick={addVar}><Plus className="h-3.5 w-3.5" /> إضافة</Button>
                </div>
              </div>

              {/* Keywords */}
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

              {/* Notes */}
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">ملاحظات</label>
                <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-border">
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
