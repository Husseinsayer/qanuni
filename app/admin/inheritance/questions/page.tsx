"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import { Plus, Trash2, Pencil, TreePine, GripVertical, X, Save, Loader2 } from "lucide-react";

interface QuestionNode {
  id: string;
  step: number;
  field: string;
  question: string;
  type: "select" | "number" | "boolean" | "text";
  options?: string;
  condition?: string;
  isRequired: boolean;
  order: number;
}

const STEP_NAMES: Record<number, string> = {
  1: "بيانات المتوفى", 2: "النظام القانوني", 3: "التركة", 4: "الديون والوصايا",
  5: "الزوج/الزوجة", 6: "الأبناء", 7: "الأب والأم", 8: "الإخوة",
  9: "الأقارب", 10: "الحالات الخاصة", 11: "المراجعة", 12: "النتيجة",
};

export default function InheritanceQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<QuestionNode>>({});

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch("/api/inheritance/questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.map((q: QuestionNode) => ({ ...q, options: q.options || "[]", condition: q.condition || "" })));
      }
    } catch {
      toast.error("فشل تحميل الأسئلة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const openAdd = () => { setEditingId(null); setForm({ step: 1, field: "", question: "", type: "boolean", isRequired: false, order: questions.length + 1 }); setModalOpen(true); };
  const openEdit = (q: QuestionNode) => { setEditingId(q.id); setForm({ ...q }); setModalOpen(true); };

  const save = async () => {
    if (!form.field || !form.question) { toast.error("البيانات ناقصة"); return; }
    try {
      if (editingId) {
        const res = await fetch(`/api/inheritance/questions/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success("تم التحديث"); fetchQuestions(); }
      } else {
        const res = await fetch("/api/inheritance/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success("تم الإضافة"); fetchQuestions(); }
      }
      setModalOpen(false);
    } catch {
      toast.error("فشل الاتصال بالخادم");
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/inheritance/questions/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("تم الحذف"); fetchQuestions(); }
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const grouped = questions.reduce((acc, q) => { (acc[q.step] = acc[q.step] || []).push(q); return acc; }, {} as Record<number, QuestionNode[]>);

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
          <h1 className="text-2xl font-bold">شجرة الأسئلة</h1>
          <p className="text-sm text-muted-foreground">تحديد الأسئلة وشروط ظهورها في كل خطوة</p>
        </div>
        <Button onClick={openAdd}><Plus className="ml-2 size-4" /> إضافة سؤال</Button>
      </div>

      {Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([step, qs]) => (
        <Card key={step}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TreePine className="size-4" /> الخطوة {step}: {STEP_NAMES[Number(step)] || `خطوة ${step}`}
              <span className="text-xs text-muted-foreground">({qs.length} أسئلة)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {qs.sort((a, b) => a.order - b.order).map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <GripVertical className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{q.question}</p>
                      <p className="text-xs text-muted-foreground">
                        الحقل: <code className="rounded bg-muted px-1">{q.field}</code> | النوع: {q.type}
                        {q.isRequired && <span className="mr-2 text-red-500">إلزامي</span>}
                      </p>
                      {q.condition && (
                        <p className="text-xs text-blue-500">
                          يظهر عندما: {q.condition}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(q)} className="rounded p-1 hover:bg-muted"><Pencil className="size-4" /></button>
                    <button onClick={() => remove(q.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-background shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">{editingId ? "تعديل السؤال" : "إضافة سؤال"}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-muted"><X className="size-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الخطوة</label>
                  <select value={form.step || 1} onChange={(e) => setForm({ ...form, step: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                    {Object.entries(STEP_NAMES).map(([s, n]) => (<option key={s} value={s}>{s}: {n}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">النوع</label>
                  <select value={form.type || "boolean"} onChange={(e) => setForm({ ...form, type: e.target.value as QuestionNode["type"] })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                    <option value="boolean">نعم/لا</option>
                    <option value="select">اختيار</option>
                    <option value="number">رقم</option>
                    <option value="text">نص</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">اسم الحقل (بالإنجليزية)</label>
                <input value={form.field || ""} onChange={(e) => setForm({ ...form, field: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm font-mono" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">السؤال</label>
                <input value={form.question || ""} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isRequired || false} onChange={(e) => setForm({ ...form, isRequired: e.target.checked })} className="size-4" />
                سؤال إلزامي
              </label>
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
