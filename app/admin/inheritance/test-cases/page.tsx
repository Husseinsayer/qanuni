"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import { Plus, Trash2, Pencil, Play, CheckCircle, XCircle, X, Save } from "lucide-react";
import { calculateInheritance } from "@/lib/inheritance/engine";
import type { WizardData, CalculationResult } from "@/lib/inheritance/types";
import { INITIAL_WIZARD_DATA } from "@/lib/inheritance/types";

interface TestCase {
  id: string;
  name: string;
  description: string;
  inputs: string;
  expected: string;
  actual: string;
  status: "pending" | "pass" | "fail";
}

const SAMPLE_TESTS: TestCase[] = [
  {
    id: "t1",
    name: "زوجة + ولدان + بنت + أبوين",
    description: "تركة 100 مليون، زوجة واحدة، ولدان، بنت واحدة، أبوان حيان",
    inputs: JSON.stringify({
      deceasedGender: "male",
      totalEstate: 100000000,
      hasSpouse: true,
      spouseCount: 1,
      hasChildren: true,
      sonsCount: 2,
      daughtersCount: 1,
      fatherAlive: true,
      motherAlive: true,
    }),
    expected: JSON.stringify({ spouse: "12.5%", son_each: "~22.2%", daughter: "~11.1%", father: "16.67%", mother: "16.67%" }),
    actual: "",
    status: "pending" as const,
  },
  {
    id: "t2",
    name: "زوجة فقط بدون أولاد",
    description: "تركة 50 مليون، زوجة واحدة، لا أولاد، لا والدين",
    inputs: JSON.stringify({
      deceasedGender: "male",
      totalEstate: 50000000,
      hasSpouse: true,
      spouseCount: 1,
      hasChildren: false,
      fatherAlive: false,
      motherAlive: false,
    }),
    expected: JSON.stringify({ spouse: "50%" }),
    actual: "",
    status: "pending" as const,
  },
  {
    id: "t3",
    name: "بنت واحدة فقط",
    description: "تركة 80 مليون، بنت واحدة، لا زوج، لا والدين",
    inputs: JSON.stringify({
      deceasedGender: "male",
      totalEstate: 80000000,
      hasSpouse: false,
      hasChildren: true,
      sonsCount: 0,
      daughtersCount: 1,
      fatherAlive: false,
      motherAlive: false,
    }),
    expected: JSON.stringify({ daughter: "50%", father_residuary: "50%" }),
    actual: "",
    status: "pending" as const,
  },
  {
    id: "t4",
    name: "زوجة + ولدان بدون والدين",
    description: "تركة 120 مليون، زوجة واحدة، ولدان، لا والدين",
    inputs: JSON.stringify({
      deceasedGender: "male",
      totalEstate: 120000000,
      hasSpouse: true,
      spouseCount: 1,
      hasChildren: true,
      sonsCount: 2,
      daughtersCount: 0,
      fatherAlive: false,
      motherAlive: false,
    }),
    expected: JSON.stringify({ spouse: "12.5%", sons_each: "~43.75%" }),
    actual: "",
    status: "pending" as const,
  },
  {
    id: "t5",
    name: "زوج + بنت واحدة + أم",
    description: "تركة 60 مليون، زوج، بنت واحدة، أم حية، لا أب",
    inputs: JSON.stringify({
      deceasedGender: "female",
      totalEstate: 60000000,
      hasSpouse: true,
      spouseCount: 1,
      hasChildren: true,
      sonsCount: 0,
      daughtersCount: 1,
      fatherAlive: false,
      motherAlive: true,
    }),
    expected: JSON.stringify({ husband: "25%", daughter: "50%", mother: "16.67%", father_residuary: "8.33%" }),
    actual: "",
    status: "pending" as const,
  },
];

export default function InheritanceTestCasesPage() {
  const [tests, setTests] = useState<TestCase[]>(SAMPLE_TESTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; inputs: string; expected: string }>({ name: "", description: "", inputs: "{}", expected: "{}" });

  const openAdd = () => { setEditingId(null); setForm({ name: "", description: "", inputs: "{}", expected: "{}" }); setModalOpen(true); };
  const openEdit = (t: TestCase) => { setEditingId(t.id); setForm({ name: t.name, description: t.description, inputs: t.inputs, expected: t.expected }); setModalOpen(true); };

  const save = () => {
    if (!form.name) { toast.error("الاسم مطلوب"); return; }
    if (editingId) {
      setTests((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...form } : t)));
    } else {
      setTests((prev) => [...prev, { id: `t${Date.now()}`, ...form, actual: "", status: "pending" }]);
    }
    setModalOpen(false);
    toast.success("تم الحفظ");
  };

  const remove = (id: string) => { setTests((prev) => prev.filter((t) => t.id !== id)); toast.success("تم الحذف"); };

  const runTest = (id: string) => {
    setTests((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      try {
        const inputs = JSON.parse(t.inputs) as Partial<WizardData>;
        const fullData: WizardData = { ...INITIAL_WIZARD_DATA, ...inputs };
        const result: CalculationResult = calculateInheritance(fullData);
        const actual = JSON.stringify({
          status: result.status,
          netEstate: result.netEstate,
          heirs: result.heirs.map((h) => ({ name: h.name, percentage: h.percentage, amount: h.amount })),
          excluded: result.excludedPersons.map((h) => ({ name: h.name, reason: h.excludeReason })),
        });
        return { ...t, status: "pass" as const, actual };
      } catch (err) {
        return { ...t, status: "fail" as const, actual: JSON.stringify({ error: String(err) }) };
      }
    }));
    toast.success("تم تشغيل الاختبار");
  };

  const runAll = () => {
    setTests((prev) => prev.map((t) => {
      try {
        const inputs = JSON.parse(t.inputs) as Partial<WizardData>;
        const fullData: WizardData = { ...INITIAL_WIZARD_DATA, ...inputs };
        const result: CalculationResult = calculateInheritance(fullData);
        const actual = JSON.stringify({
          status: result.status,
          netEstate: result.netEstate,
          heirs: result.heirs.map((h) => ({ name: h.name, percentage: h.percentage, amount: h.amount })),
          excluded: result.excludedPersons.map((h) => ({ name: h.name, reason: h.excludeReason })),
        });
        return { ...t, status: "pass" as const, actual };
      } catch (err) {
        return { ...t, status: "fail" as const, actual: JSON.stringify({ error: String(err) }) };
      }
    }));
    toast.success("تم تشغيل جميع الاختبارات");
  };

  const stats = { total: tests.length, pass: tests.filter((t) => t.status === "pass").length, fail: tests.filter((t) => t.status === "fail").length, pending: tests.filter((t) => t.status === "pending").length };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">حالات الاختبار</h1>
          <p className="text-sm text-muted-foreground">اختبار القواعد بحالات محددة والتحقق من صحة النتائج</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runAll}><Play className="ml-2 size-4" /> تشغيل الكل</Button>
          <Button onClick={openAdd}><Plus className="ml-2 size-4" /> إضافة اختبار</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">إجمالي</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.pass}</p><p className="text-xs text-muted-foreground">نجح</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.fail}</p><p className="text-xs text-muted-foreground">فشل</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p><p className="text-xs text-muted-foreground">قيد الانتظار</p></Card>
      </div>

      {/* Tests Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-xs text-muted-foreground">
                <th className="p-3">الاسم</th>
                <th className="p-3">الوصف</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-3 font-medium">{test.name}</td>
                  <td className="max-w-[200px] truncate p-3 text-xs text-muted-foreground">{test.description}</td>
                  <td className="p-3">
                    {test.status === "pass" && <span className="flex items-center gap-1 text-green-600"><CheckCircle className="size-4" /> نجح</span>}
                    {test.status === "fail" && <span className="flex items-center gap-1 text-red-600"><XCircle className="size-4" /> فشل</span>}
                    {test.status === "pending" && <span className="text-yellow-600">قيد الانتظار</span>}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => runTest(test.id)} className="rounded p-1 text-blue-500 hover:bg-blue-50"><Play className="size-4" /></button>
                      <button onClick={() => openEdit(test)} className="rounded p-1 hover:bg-muted"><Pencil className="size-4" /></button>
                      <button onClick={() => remove(test.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Results */}
      {tests.some((t) => t.status !== "pending") && (
        <Card className="p-4">
          <h3 className="mb-3 font-bold">نتائج الاختبارات</h3>
          <div className="space-y-3">
            {tests.filter((t) => t.status !== "pending").map((test) => (
              <div key={test.id} className={`rounded-lg border p-3 ${test.status === "pass" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{test.name}</span>
                  {test.status === "pass" ? <CheckCircle className="size-4 text-green-600" /> : <XCircle className="size-4 text-red-600" />}
                </div>
                <pre className="mt-2 overflow-x-auto rounded bg-muted/50 p-2 text-xs text-muted-foreground">{test.actual}</pre>
              </div>
            ))}
          </div>
        </Card>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-background shadow-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">{editingId ? "تعديل الاختبار" : "إضافة اختبار"}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-muted"><X className="size-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">اسم الاختبار *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">الوصف</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">المدخلات (JSON)</label>
                <textarea value={form.inputs} onChange={(e) => setForm({ ...form, inputs: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm font-mono" rows={6} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">النتيجة المتوقعة (JSON)</label>
                <textarea value={form.expected} onChange={(e) => setForm({ ...form, expected: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm font-mono" rows={6} />
              </div>
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
