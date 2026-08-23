"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Baby, DollarSign, Home, GraduationCap, Stethoscope, Calculator, Info } from "lucide-react";

export default function AlimonyPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    recipientType: "wife",
    payerIncome: 0,
    incomeSource: "salary",
    hasHousing: false,
    housingCost: 0,
    hasEducation: false,
    educationCost: 0,
    hasHealthcare: false,
    healthcareCost: 0,
    childCount: 0,
    childAges: "",
    specialCircumstances: "",
  });
  const [result, setResult] = useState<{ total: number; breakdown: { label: string; amount: number; percent: number }[] } | null>(null);

  const update = (field: string, value: unknown) => setData((p) => ({ ...p, [field]: value }));

  const calculate = () => {
    const income = data.payerIncome;
    let basePercent = 25;
    if (data.recipientType === "child") basePercent = 20;
    if (data.recipientType === "parent") basePercent = 15;

    let baseAmount = income * (basePercent / 100);
    const breakdown: { label: string; amount: number; percent: number }[] = [];

    breakdown.push({ label: `النفقة الأساسية (${basePercent}%)`, amount: baseAmount, percent: basePercent });

    if (data.hasHousing && data.housingCost > 0) {
      breakdown.push({ label: "بدل السكن", amount: data.housingCost, percent: (data.housingCost / income) * 100 });
      baseAmount += data.housingCost;
    }
    if (data.hasEducation && data.educationCost > 0) {
      breakdown.push({ label: "بدل التعليم", amount: data.educationCost, percent: (data.educationCost / income) * 100 });
      baseAmount += data.educationCost;
    }
    if (data.hasHealthcare && data.healthcareCost > 0) {
      breakdown.push({ label: "بدل الرعاية الصحية", amount: data.healthcareCost, percent: (data.healthcareCost / income) * 100 });
      baseAmount += data.healthcareCost;
    }

    if (data.childCount > 0 && data.recipientType === "child") {
      const perChild = baseAmount / data.childCount;
      breakdown.push({ label: `نصيب كل طفل`, amount: perChild, percent: (perChild / income) * 100 });
    }

    setResult({ total: baseAmount, breakdown });
    setStep(2);
  };

  return (
    <div className="container max-w-4xl pb-20">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white md:p-8">
          <h1 className="text-2xl font-extrabold md:text-3xl">حاسبة النفقة</h1>
          <p className="mt-2 text-sm text-white/80">احسب مبلغ النفقة الواجبة وفقاً لقانون الأحوال الشخصية العراقي</p>
          <div className="mt-3 rounded-lg bg-white/10 p-3 text-xs leading-relaxed">
            <Info className="mb-1 inline size-3.5" /> هذه الحاسبة أداة إرشادية仅供参考. يُنصح بمراجعة محامٍ متخصص لتحديد المبلغ الدقيق.
          </div>
        </div>
      </Card>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mt-6">
          <Card className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Baby className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">بيانات النفقة</h2>
                <p className="text-xs text-muted-foreground">أدخل البيانات المطلوبة لحساب مبلغ النفقة</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">نوع المستفيد *</label>
                <select value={data.recipientType} onChange={(e) => update("recipientType", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                  <option value="wife">زوجة</option>
                  <option value="child">ابن/ابنة</option>
                  <option value="parent">أب/أم</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">دخل الموظف الشهري (دينار عراقي) *</label>
                <input type="number" value={data.payerIncome || ""} onChange={(e) => update("payerIncome", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="مثال: 1500000" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">مصدر الدخل</label>
                <select value={data.incomeSource} onChange={(e) => update("incomeSource", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                  <option value="salary">راتب شهري</option>
                  <option value="business">أرباح تجارية</option>
                  <option value="investment">استثمارات</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              {data.recipientType === "child" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">عدد الأبناء</label>
                    <input type="number" min={1} value={data.childCount || ""} onChange={(e) => update("childCount", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">أعمار الأبناء</label>
                    <input value={data.childAges} onChange={(e) => update("childAges", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="مثال: 5, 8, 12" />
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="mb-3 text-sm font-bold">البدلات الإضافية</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <input type="checkbox" checked={data.hasHousing} onChange={(e) => update("hasHousing", e.target.checked)} className="size-4" />
                    <Home className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">بدل السكن</p>
                      {data.hasHousing && <input type="number" value={data.housingCost || ""} onChange={(e) => update("housingCost", Number(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background p-2 text-sm" placeholder="مبلغ السكن الشهري" />}
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <input type="checkbox" checked={data.hasEducation} onChange={(e) => update("hasEducation", e.target.checked)} className="size-4" />
                    <GraduationCap className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">بدل التعليم</p>
                      {data.hasEducation && <input type="number" value={data.educationCost || ""} onChange={(e) => update("educationCost", Number(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background p-2 text-sm" placeholder="مبلغ التعليم الشهري" />}
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <input type="checkbox" checked={data.hasHealthcare} onChange={(e) => update("hasHealthcare", e.target.checked)} className="size-4" />
                    <Stethoscope className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">بدل الرعاية الصحية</p>
                      {data.hasHealthcare && <input type="number" value={data.healthcareCost || ""} onChange={(e) => update("healthcareCost", Number(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background p-2 text-sm" placeholder="مبلغ الرعاية الصحية" />}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">ظروف خاصة</label>
                <textarea value={data.specialCircumstances} onChange={(e) => update("specialCircumstances", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" rows={2} placeholder="أي ظروف خاصة تؤثر على مبلغ النفقة..." />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={calculate} disabled={!data.payerIncome} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-40">
                <Calculator className="size-4" /> احسب النفقة
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 2 && result && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mt-6 space-y-6">
          <Card className="border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-900/20">
            <div className="text-center">
              <DollarSign className="mx-auto size-12 text-emerald-600" />
              <h2 className="mt-3 text-xl font-bold">مبلغ النفقة الشهري</h2>
              <p className="mt-2 text-3xl font-extrabold text-emerald-600">{result.total.toLocaleString("ar-IQ")} دينار</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-bold">تفصيل الحساب</h3>
            <div className="space-y-3">
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.percent.toFixed(1)}% من الدخل</p>
                  </div>
                  <p className="font-bold text-emerald-600">{item.amount.toLocaleString("ar-IQ")} دينار</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <Info className="mb-1 inline size-3.5" /> المبلغ الفعلي يُحدد من قبل القاضي بناءً على الدخل الفعلي والظروف المحيطة. هذا المبلغ هو التقدير الأدنى الإرشادي.
            </div>
          </Card>

          <div className="text-center">
            <button onClick={() => { setStep(1); setResult(null); }} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">حساب جديد</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
