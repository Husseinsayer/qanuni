"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../admin-context";
import { type SampleArticle } from "@/lib/data";
import { type SerializableLaw } from "@/lib/admin-data";
import { parseLawArticles } from "@/lib/law-parser";
import { Plus, Pencil, Trash2, X, ChevronDown, Search, ChevronRight, ChevronLeft, ListPlus, Check, Download, Tag, Scale } from "lucide-react";
import { useAdminTable } from "@/lib/use-admin-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";
import { toArabicDigits } from "@/lib/utils";
import { iconMap, iconNames } from "@/lib/icons";

const emptyLaw: Omit<SerializableLaw, "id"> = {
  name: "",
  articles: 0,
  updated: new Date().toISOString().slice(0, 7),
  icon: "Scale",
  color: "#1E3A8A",
  category: "",
};

const emptySample: SampleArticle = { num: 0, text: "" };

export default function LawsAdminPage() {
  const { data, update } = useAdminContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<SerializableLaw, "id">>(emptyLaw);
  const [iconName, setIconName] = useState(iconNames[0]);
  const [samples, setSamples] = useState<SampleArticle[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editSamples, setEditSamples] = useState<SampleArticle[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", icon: "Scale" });
  const [catEditId, setCatEditId] = useState<string | null>(null);
  const [catDeleteConfirm, setCatDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setForm(emptyLaw);
    setIconName(iconNames[0]);
    setSamples([]);
    setEditingId(null);
    setBulkOpen(false);
    setBulkText("");
    setModalOpen(true);
  };

  const openEdit = (law: SerializableLaw) => {
    const { id, ...rest } = law;
    setForm(rest);
    const foundIcon = iconNames.includes(rest.icon) ? rest.icon : iconNames[0];
    setIconName(foundIcon);
    setSamples(data.sampleArticles[id] || []);
    setEditingId(id);
    setBulkOpen(false);
    setBulkText("");
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;

    // Sort articles by number
    const sortedSamples = [...samples].sort((a, b) => a.num - b.num);

    if (editingId) {
      update(
        "laws",
        data.laws.map((l) => (l.id === editingId ? { ...form, id: editingId, icon: iconName } : l))
      );
      update("sampleArticles", { ...data.sampleArticles, [editingId]: sortedSamples });
      toast.success("تم الحفظ بنجاح");
    } else {
      const newId = `law-${Date.now()}`;
      const newLaw = { ...form, id: newId, icon: iconName };
      // Insert in sorted position (alphabetical by name)
      const insertAt = data.laws.findIndex(
        (l) => l.name.localeCompare(newLaw.name, "ar") > 0
      );
      const newLaws = [...data.laws];
      if (insertAt === -1) {
        newLaws.push(newLaw);
      } else {
        newLaws.splice(insertAt, 0, newLaw);
      }
      update("laws", newLaws);
      update("sampleArticles", { ...data.sampleArticles, [newId]: sortedSamples });
      toast.success("تم الحفظ بنجاح", `تمت إضافة القانون "${form.name}"`);
    }
    setModalOpen(false);
  };

  const remove = (id: string) => {
    const law = data.laws.find((l) => l.id === id);
    update("laws", data.laws.filter((l) => l.id !== id));
    const newSamples = { ...data.sampleArticles };
    delete newSamples[id];
    update("sampleArticles", newSamples);
    toast.success("تم الحذف", `تم حذف القانون "${law?.name || ""}"`);
    setDeleteConfirm(null);
  };

  const toggleExpand = (lawId: string) => {
    if (expandedLaw === lawId) {
      setExpandedLaw(null);
      setEditSamples([]);
      setHasChanges(false);
    } else {
      setExpandedLaw(lawId);
      const lawSamples = (data.sampleArticles[lawId] || []).sort((a, b) => a.num - b.num);
      setEditSamples(lawSamples);
      setHasChanges(false);
    }
  };

  const saveExpandedEdits = () => {
    if (!expandedLaw) return;
    const sorted = [...editSamples].sort((a, b) => a.num - b.num);
    update("sampleArticles", { ...data.sampleArticles, [expandedLaw]: sorted });
    update("laws", data.laws.map((l) => l.id === expandedLaw ? { ...l, articles: sorted.length } : l));
    setEditSamples(sorted);
    setHasChanges(false);
    toast.success("تم الحفظ", "تم حفظ التغييرات بنجاح");
  };

  const cancelExpandedEdits = () => {
    const lawSamples = data.sampleArticles[expandedLaw!] || [];
    setEditSamples(lawSamples);
    setHasChanges(false);
    toast.info("تم الإلغاء", "تم تجاهل التغييرات");
  };

  const addSample = () => setSamples([...samples, { ...emptySample }]);
  const removeSample = (idx: number) => setSamples(samples.filter((_, i) => i !== idx));
  const updateSample = (idx: number, field: keyof SampleArticle, value: string | number) => {
    setSamples(samples.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const parseBulkArticles = () => {
    if (!bulkText.trim()) return;
    const newArticles = parseLawArticles(bulkText);
    if (newArticles.length > 0) {
      setSamples([...samples, ...newArticles]);
      setBulkText("");
      setBulkOpen(false);
      toast.success("تمت الإضافة", `تمت إضافة ${newArticles.length} مادة بنجاح`);
    } else {
      toast.error("لم يتم العثور على مواد", "تأكد من أن النص يحتوي على أرقام مواد بصيغة صحيحة");
    }
  };

  // === Duplicate detection ===
  const lawNameCounts = new Map<string, string[]>();
  for (const law of data.laws) {
    const key = law.name.trim().toLowerCase();
    if (!lawNameCounts.has(key)) lawNameCounts.set(key, []);
    lawNameCounts.get(key)!.push(law.id);
  }
  const duplicateLawNames = new Set(
    [...lawNameCounts.entries()].filter(([, ids]) => ids.length > 1).flatMap(([, ids]) => ids)
  );

  // Per-law duplicate article numbers in expanded view
  const duplicateArticlesInExpanded = new Set<number>();
  if (expandedLaw) {
    const nums = editSamples.map((s) => s.num);
    const seen = new Set<number>();
    for (const n of nums) {
      if (seen.has(n)) duplicateArticlesInExpanded.add(n);
      seen.add(n);
    }
  }

  // === Sorting: laws alphabetically by name (Arabic-aware) ===
  const sortedLaws = [...data.laws].sort((a, b) =>
    a.name.localeCompare(b.name, "ar")
  );

  const filteredLaws = categoryFilter
    ? sortedLaws.filter((l) => l.category === categoryFilter)
    : sortedLaws;

  const { search, setSearch, page, setPage, pageSize, setPageSize, paged, totalPages, total } = useAdminTable(filteredLaws, ["name"]);

  const getIconForLaw = (law: SerializableLaw) => {
    return iconMap[law.icon] || Scale;
  };

  const exportToExcel = () => {
    // Create CSV content (Arabic-friendly)
    const headers = ["اسم القانون", "رقم المادة", "نص المادة"];
    const rows: string[][] = [];
    
    for (const law of filteredLaws) {
      const articles = data.sampleArticles[law.id] || [];
      if (articles.length === 0) {
        rows.push([law.name, "", ""]);
      } else {
        for (const article of articles) {
          rows.push([law.name, String(article.num), article.text]);
        }
      }
    }
    
    // Build CSV with BOM for Arabic support
    const bom = "\uFEFF";
    const csvContent = bom + [headers.join(","), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `قوانين_ومواد_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("تم التصدير", "تم تصدير القوانين والمواد بنجاح");
  };

  // Category management
  const openCatAdd = () => {
    setCatForm({ name: "", icon: "Scale" });
    setCatEditId(null);
    setCatModalOpen(true);
  };

  const openCatEdit = (cat: { id: string; name: string; icon: string }) => {
    setCatForm({ name: cat.name, icon: cat.icon });
    setCatEditId(cat.id);
    setCatModalOpen(true);
  };

  const saveCat = () => {
    if (!catForm.name.trim()) return;
    if (catEditId) {
      update("categories", data.categories.map((c) => (c.id === catEditId ? { ...c, name: catForm.name, icon: catForm.icon } : c)));
      toast.success("تم الحفظ", `تم تحديث التصنيف "${catForm.name}"`);
    } else {
      const newId = `cat-${Date.now()}`;
      update("categories", [...data.categories, { id: newId, name: catForm.name, icon: catForm.icon }]);
      toast.success("تمت الإضافة", `تمت إضافة التصنيف "${catForm.name}"`);
    }
    setCatModalOpen(false);
  };

  const removeCat = (id: string) => {
    const cat = data.categories.find((c) => c.id === id);
    // Check if category is in use by any law
    const inUse = data.laws.some((l) => l.category === id);
    if (inUse) {
      toast.error("لا يمكن الحذف", `التصنيف "${cat?.name}" مستخدم من قبل قوانين`);
      setCatDeleteConfirm(null);
      return;
    }
    update("categories", data.categories.filter((c) => c.id !== id));
    toast.success("تم الحذف", `تم حذف التصنيف "${cat?.name || ""}"`);
    setCatDeleteConfirm(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة القوانين</h1>
        <div className="flex items-center gap-2">
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <Download className="h-4 w-4" />
            تصدير CSV
          </Button>
          <Button onClick={openCatAdd} variant="outline" size="sm">
            <Tag className="h-4 w-4" />
            التصنيفات
          </Button>
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4" />
            إضافة جديد
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">عرض {toArabicDigits(paged.length)} من {toArabicDigits(total)} قانون</p>
        <select
          className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-accent"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
        >
          <option value="">جميع التصنيفات</option>
          {data.categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* === Duplicate alerts === */}
      {duplicateLawNames.size > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">!</span>
            تنبيه: توجد قوانين مكررة
          </div>
          <ul className="mt-1 list-inside list-disc space-y-0.5 pr-5">
            {[...lawNameCounts.entries()]
              .filter(([, ids]) => ids.length > 1)
              .map(([name, ids]) => (
                <li key={name}>
                  القانون &ldquo;{data.laws.find((l) => l.id === ids[0])?.name}&rdquo; مكرر ({ids.length} مرات)
                </li>
              ))}
          </ul>
        </div>
      )}

      {expandedLaw && duplicateArticlesInExpanded.size > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">!</span>
            تنبيه: توجد مواد مكررة في هذا القانون
          </div>
          <ul className="mt-1 list-inside list-disc space-y-0.5 pr-5">
            {[...duplicateArticlesInExpanded].map((n) => (
              <li key={n}>رقم المادة {toArabicDigits(n)} مكرر</li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">الاسم</th>
                  <th className="px-4 py-3 text-right font-semibold">عدد المواد</th>
                  <th className="px-4 py-3 text-right font-semibold">آخر تحديث</th>
                  <th className="px-4 py-3 text-right font-semibold">الأيقونة</th>
                  <th className="px-4 py-3 text-right font-semibold">اللون</th>
                  <th className="px-4 py-3 text-right font-semibold">المواد النموذجية</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((law) => {
                  const Icon = getIconForLaw(law);
                  const isExpanded = expandedLaw === law.id;
                  const lawSamples = data.sampleArticles[law.id] || [];
                  return (
                    <>
                      <tr key={law.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            {law.name}
                            {duplicateLawNames.has(law.id) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                مكرر
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{toArabicDigits(law.articles)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{law.updated}</td>
                        <td className="px-4 py-3">
                          <Icon className="h-4 w-4" style={{ color: law.color }} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: law.color }} />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleExpand(law.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {toArabicDigits(lawSamples.length)} مواد
                            <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(law)} className="rounded-lg p-1.5 hover:bg-muted/60">
                              <Pencil className="h-3.5 w-3.5 text-accent" />
                            </button>
                            <button onClick={() => setDeleteConfirm(law.id)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="bg-muted/20 px-8 py-3">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button variant="accent" size="sm" onClick={saveExpandedEdits} disabled={!hasChanges}>
                                  <Check className="h-3.5 w-3.5" />
                                  حفظ التغييرات
                                </Button>
                                {hasChanges && (
                                  <Button variant="outline" size="sm" onClick={cancelExpandedEdits}>
                                    <X className="h-3.5 w-3.5" />
                                    إلغاء
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  setBulkOpen(!bulkOpen);
                                }}>
                                  <ListPlus className="h-3.5 w-3.5" />
                                  إضافة متعددة
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  setEditSamples([...editSamples, { ...emptySample }]);
                                  setHasChanges(true);
                                }}>
                                  <Plus className="h-3.5 w-3.5" />
                                  إضافة مادة
                                </Button>
                              </div>
                            </div>
                            {bulkOpen && (
                              <div className="mb-3 rounded-xl border border-border bg-background p-3">
                                <p className="mb-2 text-xs text-muted-foreground">
                                  الصق النص الكامل للمواد (يدعم: المادة 1، 1، 1.، (1)، إلخ)
                                </p>
                                <textarea
                                  className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-accent"
                                  rows={6}
                                  placeholder="المادة 1&#10;ينظم القانون المدني العراقي...&#10;&#10;المادة 2&#10;يُسترشد في تفسير العقود..."
                                  value={bulkText}
                                  onChange={(e) => setBulkText(e.target.value)}
                                  dir="rtl"
                                />
                                <div className="mt-2 flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => {
                                    setBulkOpen(false);
                                    setBulkText("");
                                  }}>
                                    إلغاء
                                  </Button>
                                  <Button size="sm" onClick={() => {
                                    const parsed = parseLawArticles(bulkText);
                                    if (parsed.length > 0) {
                                      setEditSamples([...editSamples, ...parsed]);
                                      setHasChanges(true);
                                      setBulkText("");
                                      setBulkOpen(false);
                                      toast.success("تم التحليل", `تم استخراج ${parsed.length} مادة بنجاح`);
                                    } else {
                                      toast.error("فشل التحليل", "لم يتم العثور على مواد في النص");
                                    }
                                  }}>
                                    تحليل وإضافة
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div className="space-y-3">
                              {editSamples.map((s, i) => (
                                <div key={i} className="rounded-xl border border-border bg-background p-4">
                                  <div className="mb-3 flex items-center justify-between">
                                    <span className="rounded-lg bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
                                      المادة {toArabicDigits(s.num)}
                                    </span>
                                    <button
                                      onClick={() => {
                                        const newSamples = editSamples.filter((_, idx) => idx !== i);
                                        setEditSamples(newSamples);
                                        setHasChanges(true);
                                        toast.success("تم الحذف", `تم حذف المادة ${s.num}`);
                                      }}
                                      className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-4 gap-3">
                                    <input
                                      type="number"
                                      className={`rounded-lg border px-3 py-2 text-sm outline-none focus:border-accent ${
                                        duplicateArticlesInExpanded.has(s.num) && s.num !== 0
                                          ? "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/20"
                                          : "border-border bg-muted/40"
                                      }`}
                                      placeholder="رقم المادة"
                                      value={s.num}
                                      onChange={(e) => {
                                        const newSamples = [...editSamples];
                                        newSamples[i] = { ...s, num: Number(e.target.value) };
                                        setEditSamples(newSamples);
                                        setHasChanges(true);
                                      }}
                                    />
                                    <textarea
                                      className="col-span-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-accent"
                                      rows={3}
                                      placeholder="نص المادة"
                                      value={s.text}
                                      onChange={(e) => {
                                        const newSamples = [...editSamples];
                                        newSamples[i] = { ...s, text: e.target.value };
                                        setEditSamples(newSamples);
                                        setHasChanges(true);
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${p === page ? "bg-accent text-white" : "hover:bg-muted/60"}`}
            >
              {toArabicDigits(p)}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <span className="text-sm text-muted-foreground">صفحة {toArabicDigits(page)} من {toArabicDigits(totalPages)}</span>
        <select
          className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none"
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
        >
          {[5, 10, 25, 50].map((s) => <option key={s} value={s}>{s} / صفحة</option>)}
        </select>
      </div>

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا القانون؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => remove(deleteConfirm!)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <Card className="my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "تعديل قانون" : "إضافة قانون جديد"}</CardTitle>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">الاسم</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">عدد المواد</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.articles}
                  onChange={(e) => setForm({ ...form, articles: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">آخر تحديث</label>
                <input
                  type="month"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.updated}
                  onChange={(e) => setForm({ ...form, updated: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">اللون</label>
                <input
                  type="color"
                  className="h-10 w-full cursor-pointer rounded-xl border border-border"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الأيقونة</label>
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                >
                  {iconNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">التصنيف</label>
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">بدون تصنيف</option>
                  {data.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">المواد النموذجية</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setBulkOpen(!bulkOpen)}>
                      <ListPlus className="h-3.5 w-3.5" />
                      إضافة متعددة
                    </Button>
                    <Button variant="outline" size="sm" onClick={addSample}>
                      <Plus className="h-3.5 w-3.5" />
                      إضافة مادة
                    </Button>
                  </div>
                </div>
                {bulkOpen && (
                  <div className="mb-3 rounded-xl border border-border p-3">
                    <p className="mb-2 text-xs text-muted-foreground">
                      كل سطر = مادة واحدة بصيغة "رقم المادة: نص المادة"
                    </p>
                    <textarea
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                      rows={5}
                      placeholder={"1: ينظم القانون المدني العراقي...\n2: يُسترشد في تفسير العقود...\n10: العقد شريعة المتعاقدين..."}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      dir="rtl"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" onClick={parseBulkArticles}>
                        إضافة الكل
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {samples.map((sample, idx) => (
                    <div key={idx} className="rounded-xl border border-border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">مادة {toArabicDigits(idx + 1)}</span>
                        <button onClick={() => removeSample(idx)} className="rounded p-0.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          type="number"
                          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                          placeholder="رقم المادة"
                          value={sample.num}
                          onChange={(e) => updateSample(idx, "num", Number(e.target.value))}
                        />
                        <textarea
                          className="col-span-3 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                          rows={2}
                          placeholder="نص المادة"
                          value={sample.text}
                          onChange={(e) => updateSample(idx, "text", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
                <Button onClick={save}>{editingId ? "حفظ التعديلات" : "إضافة"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setCatModalOpen(false)}>
          <Card className="my-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{catEditId ? "تعديل تصنيف" : "إدارة التصنيفات"}</CardTitle>
              <button onClick={() => setCatModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              {/* Add/Edit form */}
              <div className="mb-4 flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  placeholder="اسم التصنيف الجديد"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") saveCat(); }}
                />
                {catEditId ? (
                  <div className="flex gap-1">
                    <Button onClick={saveCat} size="sm">حفظ</Button>
                    <Button variant="outline" size="sm" onClick={() => setCatModalOpen(false)}>إلغاء</Button>
                  </div>
                ) : (
                  <Button onClick={saveCat} size="sm">
                    <Plus className="h-4 w-4" />
                    إضافة
                  </Button>
                )}
              </div>

              {/* Categories list */}
              <div className="space-y-2">
                {data.categories.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">لا توجد تصنيفات بعد</p>
                )}
                {data.categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openCatEdit(cat)} className="rounded-lg p-1.5 hover:bg-muted/60">
                        <Pencil className="h-3.5 w-3.5 text-accent" />
                      </button>
                      <button onClick={() => setCatDeleteConfirm(cat.id)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={catDeleteConfirm !== null}
        title="تأكيد حذف التصنيف"
        message="هل أنت متأكد من حذف هذا التصنيف؟"
        onConfirm={() => removeCat(catDeleteConfirm!)}
        onCancel={() => setCatDeleteConfirm(null)}
      />
    </div>
  );
}
