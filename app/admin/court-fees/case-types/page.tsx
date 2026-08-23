"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

interface CaseType {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  basePercent: number;
  minFee: number;
  maxFee: number;
  isActive: boolean;
}

const EMPTY: CaseType = { id: 0, name: "", nameAr: "", description: "", basePercent: 2.5, minFee: 5000, maxFee: 500000, isActive: true };

const DEFAULT_TYPES: CaseType[] = [
  { id: 1, name: "civil", nameAr: "مدني", description: "دعاوى مدنية عامة", basePercent: 2.5, minFee: 5000, maxFee: 500000, isActive: true },
  { id: 2, name: "commercial", nameAr: "تجاري", description: "دعاوى تجارية", basePercent: 2.5, minFee: 5000, maxFee: 500000, isActive: true },
  { id: 3, name: "family", nameAr: "أحوال شخصية", description: "طلاق، نفقة، حضانة", basePercent: 1.5, minFee: 3000, maxFee: 200000, isActive: true },
  { id: 4, name: "criminal", nameAr: "جنائي", description: "دعاوى جنائية", basePercent: 1.0, minFee: 5000, maxFee: 100000, isActive: true },
  { id: 5, name: "administrative", nameAr: "إداري", description: "دعاوى إدارية", basePercent: 2.0, minFee: 5000, maxFee: 300000, isActive: true },
];

export default function CourtFeeCaseTypesPage() {
  const [types, setTypes] = useState<CaseType[]>([]);
  const [editing, setEditing] = useState<CaseType | null>(null);

  useEffect(() => { setTypes(DEFAULT_TYPES); }, []);

  const saveType = async () => {
    if (!editing) return;
    setTypes((prev) => {
      const exists = prev.find((t) => t.id === editing.id);
      if (exists) return prev.map((t) => (t.id === editing.id ? editing : t));
      return [...prev, { ...editing, id: Date.now() }];
    });
    setEditing(null);
  };

  const deleteType = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا النوع؟")) return;
    setTypes((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">أنواع Cases القضائية</h1>
          <p className="text-sm text-muted-foreground">إدارة أنواع الدعاوى ونسب الرسوم</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY, id: Date.now() })} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
          <Plus className="size-4" /> نوع جديد
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-right">
                <th className="px-4 py-3 font-bold">النوع</th>
                <th className="px-4 py-3 font-bold">النسبة (%)</th>
                <th className="px-4 py-3 font-bold">الحد الأدنى</th>
                <th className="px-4 py-3 font-bold">الحد الأقصى</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {types.map((ct) => (
                <tr key={ct.id} className="border-b">
                  <td className="px-4 py-3">
                    <p className="font-bold">{ct.nameAr}</p>
                    <p className="text-xs text-muted-foreground">{ct.description}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">{ct.basePercent}%</td>
                  <td className="px-4 py-3">{ct.minFee.toLocaleString("ar-IQ")} د.ع</td>
                  <td className="px-4 py-3">{ct.maxFee.toLocaleString("ar-IQ")} د.ع</td>
                  <td className="px-4 py-3">
                    {ct.isActive ? (
                      <span className="rounded-lg bg-green-100 px-2 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">نشط</span>
                    ) : (
                      <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-500">غير نشط</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(ct)} className="rounded-lg p-2 hover:bg-accent"><Edit className="size-4" /></button>
                      <button onClick={() => deleteType(ct.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">تعديل نوع الدعوى</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-2 hover:bg-accent"><X className="size-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الاسم (عربي)</label>
                  <input value={editing.nameAr} onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الاسم (إنجليزي)</label>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">الوصف</label>
                <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">النسبة (%)</label>
                  <input type="number" step="0.1" value={editing.basePercent} onChange={(e) => setEditing({ ...editing, basePercent: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الحد الأدنى</label>
                  <input type="number" value={editing.minFee} onChange={(e) => setEditing({ ...editing, minFee: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الحد الأقصى</label>
                  <input type="number" value={editing.maxFee} onChange={(e) => setEditing({ ...editing, maxFee: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="size-4" />
                <span className="text-sm font-medium">نشط</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-bold hover:bg-accent">إلغاء</button>
              <button onClick={saveType} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"><Save className="size-4" /> حفظ</button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
