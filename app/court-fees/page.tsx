"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Scale, DollarSign, Shield, Calculator, Info } from "lucide-react";

export default function CourtFeesPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    caseType: "civil",
    claimAmount: 0,
    courtLevel: "first",
    hasExemption: false,
    exemptionType: "",
    reductionApplied: false,
  });
  const [result, setResult] = useState<{ totalFee: number; breakdown: { label: string; amount: number }[] } | null>(null);

  const update = (field: string, value: unknown) => setData((p) => ({ ...p, [field]: value }));

  const calculate = () => {
    const amount = data.claimAmount;
    let fee = 0;
    const breakdown: { label: string; amount: number }[] = [];

    const percentages: Record<string, number> = {
      civil: 0.025,
      commercial: 0.025,
      family: 0.015,
      criminal: 0.01,
      administrative: 0.02,
    };

    const courtMultipliers: Record<string, number> = {
      first: 1,
      appeal: 1.5,
      cassation: 2,
    };

    const basePercent = percentages[data.caseType] || 0.025;
    fee = amount * basePercent;
    const minFee = 5000;
    const maxFee = 500000;
    fee = Math.max(minFee, Math.min(maxFee, fee));

    breakdown.push({ label: `رسوم أساسية (${(basePercent * 100).toFixed(1)}%)`, amount: fee });

    const courtMultiplier = courtMultipliers[data.courtLevel] || 1;
    if (courtMultiplier > 1) {
      const courtFee = fee * (courtMultiplier - 1);
      breakdown.push({ label: "رسوم الاستئناف/التمييز", amount: courtFee });
      fee += courtFee;
    }

    if (data.hasExemption) {
      const exemptPercent = data.exemptionType === "social" ? 100 : data.exemptionType === "government" ? 100 : 50;
      const exemptAmount = fee * (exemptPercent / 100);
      breakdown.push({ label: `إعفاء (${exemptPercent}%)`, amount: -exemptAmount });
      fee -= exemptAmount;
    }

    if (data.reductionApplied) {
      const reduceAmount = fee * 0.5;
      breakdown.push({ label: "خصم خاص (50%)", amount: -reduceAmount });
      fee -= reduceAmount;
    }

    setResult({ totalFee: Math.max(0, fee), breakdown });
    setStep(2);
  };

  const caseTypes = [
    { value: "civil", label: "مدني", desc: "دعاوى مدنية عامة" },
    { value: "commercial", label: "تجاري", desc: "دعاوى تجارية" },
    { value: "family", label: "أحوال شخصية", desc: "طلاق، نفقة، حضانة" },
    { value: "criminal", label: "جنائي", desc: "دعاوى جنائية" },
    { value: "administrative", label: "إداري", desc: "دعاوى إدارية" },
  ];

  return (
    <div className="container max-w-4xl pb-20">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white md:p-8">
          <h1 className="text-2xl font-extrabold md:text-3xl">حاسبة الرسوم القضائية</h1>
          <p className="mt-2 text-sm text-white/80">احسب الرسوم المطلوبة لرفع الدعاوى أمام المحاكم العراقية</p>
          <div className="mt-3 rounded-lg bg-white/10 p-3 text-xs leading-relaxed">
            <Info className="mb-1 inline size-3.5" /> الرسوم الفعلية قد تختلف حسب المحكمة والقرار القضائي.
          </div>
        </div>
      </Card>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mt-6">
          <Card className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Scale className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">بيانات الدعوى</h2>
                <p className="text-xs text-muted-foreground">أدخل بيانات الدعوى لحساب الرسوم المطلوبة</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">نوع الدعوى *</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {caseTypes.map((ct) => (
                    <label key={ct.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${data.caseType === ct.value ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-border hover:border-indigo-300"}`}>
                      <input type="radio" name="caseType" value={ct.value} checked={data.caseType === ct.value} onChange={(e) => update("caseType", e.target.value)} className="mt-1 size-4" />
                      <div>
                        <p className="text-sm font-bold">{ct.label}</p>
                        <p className="text-xs text-muted-foreground">{ct.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">مبلغ الدعوى (دينار عراقي) *</label>
                <input type="number" value={data.claimAmount || ""} onChange={(e) => update("claimAmount", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="مثال: 50000000" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">درجة المحكمة</label>
                <select value={data.courtLevel} onChange={(e) => update("courtLevel", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                  <option value="first">الدرجة الأولى</option>
                  <option value="appeal">الاستئناف</option>
                  <option value="cassation">التمييز</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={data.hasExemption} onChange={(e) => update("hasExemption", e.target.checked)} className="size-4" />
                  <Shield className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">هل توجد إعفاء؟</p>
                    {data.hasExemption && (
                      <select value={data.exemptionType} onChange={(e) => update("exemptionType", e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background p-2.5 text-sm">
                        <option value="">اختر نوع الإعفاء...</option>
                        <option value="social">ضمان اجتماعي</option>
                        <option value="government">جهة حكومية</option>
                        <option value="other">إعفاء خاص</option>
                      </select>
                    )}
                  </div>
                </label>
              </div>

              <label className="flex items-center gap-3">
                <input type="checkbox" checked={data.reductionApplied} onChange={(e) => update("reductionApplied", e.target.checked)} className="size-4" />
                <div>
                  <p className="text-sm font-medium">خصم خاص (50%)</p>
                  <p className="text-xs text-muted-foreground">في حالات معينة يُ granting خصم على الرسوم</p>
                </div>
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={calculate} disabled={!data.claimAmount} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40">
                <Calculator className="size-4" /> احسب الرسوم
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 2 && result && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mt-6 space-y-6">
          <Card className="border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-900/20">
            <div className="text-center">
              <DollarSign className="mx-auto size-12 text-indigo-600" />
              <h2 className="mt-3 text-xl font-bold">إجمالي الرسوم المطلوبة</h2>
              <p className="mt-2 text-3xl font-extrabold text-indigo-600">{result.totalFee.toLocaleString("ar-IQ")} دينار</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-bold">تفصيل الرسوم</h3>
            <div className="space-y-3">
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className={`font-bold ${item.amount < 0 ? "text-green-600" : "text-indigo-600"}`}>{item.amount < 0 ? "-" : ""}{Math.abs(item.amount).toLocaleString("ar-IQ")} دينار</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="text-center">
            <button onClick={() => { setStep(1); setResult(null); }} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700">حساب جديد</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
