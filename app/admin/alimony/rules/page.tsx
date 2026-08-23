"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Save, X, Baby } from "lucide-react";

interface Rule {
  id: number;
  name: string;
  description: string;
  recipientType: string;
  basePercent: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EMPTY: Rule = { id: 0, name: "", description: "", recipientType: "wife", basePercent: 25, minAmount: 0, maxAmount: 0, isActive: true, createdAt: "", updatedAt: "" };

export default function AlimonyRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [editing, setEditing] = useState<Rule | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/alimony/settings");
      const d = await r.json();
      setRules(d.data?.rules || []);
    } catch { setRules([]); }
  };

  useEffect(() => { load(); }, []);

  const saveRule = async () => {
    if (!editing) return;
    // Client-side rules stored as a concept; actual persistence would need a dedicated rules API
    setEditing(null);
  };

  const recipientTypes = [
    { value: "wife", label: "زوجة" },
    { value: "child", label: "ابن/ابنة" },
    { value: "parent", label: "أب/أم" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">قواعد حساب النفقة</h1>
          <p className="text-sm text-muted-foreground">إدارة قواعد ونسب حساب النفقة</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY, id: Date.now() })} className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700">
          <Plus className="size-4" /> قاعدة جديدة
        </button>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <Baby className="size-5" />
          </div>
          <div>
            <h2 className="font-bold">القواعد الافتراضية</h2>
            <p className="text-xs text-muted-foreground">قواعد حساب النفقة وفقاً لقانون الأحوال الشخصية العراقي</p>
          </div>
        </div>

        <div className="space-y-3">
          {recipientTypes.map((rt) => {
            const rule = rules.find((r) => r.recipientType === rt.value);
            return (
              <div key={rt.value} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <Baby className="size-5" />
                  </div>
                  <div>
                    <p className="font-bold">{rt.label}</p>
                    <p className="text-xs text-muted-foreground">النسبة الأساسية: {rule?.basePercent || 25}%</p>
                    <p className="text-xs text-muted-foreground">الحد الأدنى: {(rule?.minAmount || 0).toLocaleString("ar-IQ")} | الحد الأقصى: {(rule?.maxAmount || 0).toLocaleString("ar-IQ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {rule?.isActive ? (
                    <span className="rounded-lg bg-green-100 px-2 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">نشط</span>
                  ) : (
                    <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-500">غير نشط</span>
                  )}
                  <button onClick={() => setEditing(rule || { ...EMPTY, recipientType: rt.value })} className="rounded-lg p-2 hover:bg-accent"><Edit className="size-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {editing && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">تعديل القاعدة</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-2 hover:bg-accent"><X className="size-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">الاسم</label>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">الوصف</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">النسبة الأساسية (%)</label>
                  <input type="number" value={editing.basePercent} onChange={(e) => setEditing({ ...editing, basePercent: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">النوع</label>
                  <select value={editing.recipientType} onChange={(e) => setEditing({ ...editing, recipientType: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                    {recipientTypes.map((rt) => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الحد الأدنى</label>
                  <input type="number" value={editing.minAmount} onChange={(e) => setEditing({ ...editing, minAmount: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الحد الأقصى</label>
                  <input type="number" value={editing.maxAmount} onChange={(e) => setEditing({ ...editing, maxAmount: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="size-4" />
                <span className="text-sm font-medium">نشط</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-bold hover:bg-accent">إلغاء</button>
              <button onClick={saveRule} className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"><Save className="size-4" /> حفظ</button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
