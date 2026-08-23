"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  User, Scale, Banknote, FileText, HeartHandshake, Users,
  AlertTriangle, CheckCircle, Calculator, ArrowLeft,
  ChevronLeft, Plus, Trash2, Info, Phone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { calculateInheritance } from "@/lib/inheritance/engine";
import type { WizardData, AssetEntry, DebtEntry, WillEntry, CalculationResult } from "@/lib/inheritance/types";
import { INITIAL_WIZARD_DATA, WIZARD_STEPS } from "@/lib/inheritance/types";
import { toArabicDigits } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User, Scale, Banknote, FileText, HeartHandshake, Users,
  AlertTriangle, CheckCircle, Calculator,
};

export function InheritanceWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({ ...INITIAL_WIZARD_DATA });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [expandedHeir, setExpandedHeir] = useState<number | null>(null);

  const update = (field: keyof WizardData, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canNext = useMemo(() => {
    switch (step) {
      case 1: return data.deceasedGender && data.deathDate;
      case 2: return data.legalSystem;
      case 3: return data.totalEstate > 0;
      default: return true;
    }
  }, [step, data]);

  const goNext = () => {
    if (step === 11) {
      const r = calculateInheritance(data);
      setResult(r);
    }
    if (step < 12) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addAsset = () => {
    const newAsset: AssetEntry = { id: `a${Date.now()}`, type: "عقار", description: "", value: 0, isDisputed: false };
    update("assets", [...data.assets, newAsset]);
  };

  const updateAsset = (id: string, field: keyof AssetEntry, value: unknown) => {
    update("assets", data.assets.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeAsset = (id: string) => {
    update("assets", data.assets.filter((a) => a.id !== id));
  };

  const addDebt = () => {
    const newDebt: DebtEntry = { id: `d${Date.now()}`, type: "دين", description: "", value: 0, isProven: false, isDisputed: false, hasDocuments: false };
    update("debts", [...data.debts, newDebt]);
  };

  const updateDebt = (id: string, field: keyof DebtEntry, value: unknown) => {
    update("debts", data.debts.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const removeDebt = (id: string) => {
    update("debts", data.debts.filter((d) => d.id !== id));
  };

  const addWill = () => {
    const newWill: WillEntry = { id: `w${Date.now()}`, beneficiary: "", value: 0, type: "رسمية", hasDocument: false, isDisputed: false };
    update("wills", [...data.wills, newWill]);
  };

  const updateWill = (id: string, field: keyof WillEntry, value: unknown) => {
    update("wills", data.wills.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  };

  const removeWill = (id: string) => {
    update("wills", data.wills.filter((w) => w.id !== id));
  };

  const currentStep = WIZARD_STEPS[step - 1];
  const StepIcon = iconMap[currentStep?.icon] || Calculator;

  return (
    <div className="container max-w-4xl pb-20">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white md:p-8">
          <h1 className="text-2xl font-extrabold md:text-3xl">حاسبة الميراث العراقية</h1>
          <p className="mt-2 text-sm text-white/80">احسب أنصبة الورثة وفق القواعد القانونية المرتبطة بالتشريعات العراقية</p>
          <div className="mt-3 rounded-lg bg-white/10 p-3 text-xs leading-relaxed">
            <Info className="mb-1 inline size-3.5" /> هذه الحاسبة أداة إرشادية ولا تغني عن مراجعة محامٍ أو جهة قضائية مختصة في الحالات المعقدة.
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>الخطوة {toArabicDigits(step)} من {toArabicDigits(12)}</span>
          <span>{currentStep?.title}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 12) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {WIZARD_STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => { if (s.id < step) setStep(s.id); }}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                s.id === step
                  ? "bg-blue-600 text-white"
                  : s.id < step
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <StepIcon className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{currentStep?.title}</h2>
                  <p className="text-xs text-muted-foreground">{currentStep?.description}</p>
                </div>
              </div>

              {/* Step 1: Deceased Data */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">جنس المتوفى *</label>
                      <select
                        value={data.deceasedGender}
                        onChange={(e) => update("deceasedGender", e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-3 text-sm"
                      >
                        <option value="">اختر...</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">تاريخ الوفاة *</label>
                      <input
                        type="date"
                        value={data.deathDate}
                        onChange={(e) => update("deathDate", e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-3 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">الحالة الزوجية</label>
                      <select
                        value={data.maritalStatus}
                        onChange={(e) => update("maritalStatus", e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-3 text-sm"
                      >
                        <option value="">اختر...</option>
                        <option value="married">متزوج</option>
                        <option value="divorced">مطلق</option>
                        <option value="widower">أرمل</option>
                        <option value="single">أعزب</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.hasCourtCase} onChange={(e) => update("hasCourtCase", e.target.checked)} className="size-4" />
                      هل توجد قضية مرتبطة بالتركة؟
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.hasJudgment} onChange={(e) => update("hasJudgment", e.target.checked)} className="size-4" />
                      هل يوجد حكم قضائي سابق؟
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.hasUncertainInfo} onChange={(e) => update("hasUncertainInfo", e.target.checked)} className="size-4" />
                      هل توجد معلومات غير مؤكدة؟
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Legal System */}
              {step === 2 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">النظام القانوني المطبق على التركة:</p>
                  {[
                    { value: "islamic", label: "الشريعة الإسلامية (المذهب الجعفري)", desc: "قانون الأحوال الشخصية العراقي رقم 188 لسنة 1959" },
                    { value: "civil", label: "القانون المدني", desc: "للتركات التي لا ينطبق عليها قانون الأحوال الشخصية" },
                    { value: "mixed", label: "مختلط", desc: "في حالات مزج التشريعات" },
                    { value: "unknown", label: "لا أعرف", desc: "سيتحدد لاحقاً" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        data.legalSystem === opt.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-border hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="legalSystem"
                        value={opt.value}
                        checked={data.legalSystem === opt.value}
                        onChange={(e) => update("legalSystem", e.target.value)}
                        className="mt-1 size-4"
                      />
                      <div>
                        <p className="text-sm font-bold">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Step 3: Estate */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">إجمالي قيمة التركة (دينار عراقي) *</label>
                    <input
                      type="number"
                      value={data.totalEstate || ""}
                      onChange={(e) => update("totalEstate", Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm"
                      placeholder="مثال: 100000000"
                    />
                  </div>
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold">الأصول</h3>
                      <button onClick={addAsset} className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100">
                        <Plus className="size-3" /> إضافة أصل
                      </button>
                    </div>
                    {data.assets.map((asset) => (
                      <div key={asset.id} className="mb-3 rounded-xl border border-border p-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <select value={asset.type} onChange={(e) => updateAsset(asset.id, "type", e.target.value)} className="rounded-lg border border-border bg-background p-2 text-sm">
                            <option>عقار</option>
                            <option>حساب بنكي</option>
                            <option>سيارة</option>
                            <option>استثمار</option>
                            <option>أخرى</option>
                          </select>
                          <input value={asset.description} onChange={(e) => updateAsset(asset.id, "description", e.target.value)} className="rounded-lg border border-border bg-background p-2 text-sm" placeholder="الوصف" />
                          <div className="flex gap-2">
                            <input type="number" value={asset.value || ""} onChange={(e) => updateAsset(asset.id, "value", Number(e.target.value))} className="flex-1 rounded-lg border border-border bg-background p-2 text-sm" placeholder="القيمة" />
                            <button onClick={() => removeAsset(asset.id)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                        <label className="mt-2 flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={asset.isDisputed} onChange={(e) => updateAsset(asset.id, "isDisputed", e.target.checked)} className="size-3" />
                          متنازع عليه
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Debts & Wills */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold">الديون</h3>
                      <button onClick={addDebt} className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-100">
                        <Plus className="size-3" /> إضافة دين
                      </button>
                    </div>
                    {data.debts.map((debt) => (
                      <div key={debt.id} className="mb-3 rounded-xl border border-border p-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <select value={debt.type} onChange={(e) => updateDebt(debt.id, "type", e.target.value)} className="rounded-lg border border-border bg-background p-2 text-sm">
                            <option>دين شخصي</option>
                            <option>قرض بنكي</option>
                            <option>دين عقاري</option>
                            <option>أخرى</option>
                          </select>
                          <input value={debt.description} onChange={(e) => updateDebt(debt.id, "description", e.target.value)} className="rounded-lg border border-border bg-background p-2 text-sm" placeholder="الوصف" />
                          <div className="flex gap-2">
                            <input type="number" value={debt.value || ""} onChange={(e) => updateDebt(debt.id, "value", Number(e.target.value))} className="flex-1 rounded-lg border border-border bg-background p-2 text-sm" placeholder="القيمة" />
                            <button onClick={() => removeDebt(debt.id)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-4 text-xs">
                          <label className="flex items-center gap-1"><input type="checkbox" checked={debt.isProven} onChange={(e) => updateDebt(debt.id, "isProven", e.target.checked)} className="size-3" /> مثبت</label>
                          <label className="flex items-center gap-1"><input type="checkbox" checked={debt.isDisputed} onChange={(e) => updateDebt(debt.id, "isDisputed", e.target.checked)} className="size-3" /> محل نزاع</label>
                          <label className="flex items-center gap-1"><input type="checkbox" checked={debt.hasDocuments} onChange={(e) => updateDebt(debt.id, "hasDocuments", e.target.checked)} className="size-3" /> توجد وثائق</label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold">الوصايا</h3>
                      <button onClick={addWill} className="flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-100">
                        <Plus className="size-3" /> إضافة وصية
                      </button>
                    </div>
                    {data.wills.map((will) => (
                      <div key={will.id} className="mb-3 rounded-xl border border-border p-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <input value={will.beneficiary} onChange={(e) => updateWill(will.id, "beneficiary", e.target.value)} className="rounded-lg border border-border bg-background p-2 text-sm" placeholder="المستفيد" />
                          <select value={will.type} onChange={(e) => updateWill(will.id, "type", e.target.value)} className="rounded-lg border border-border bg-background p-2 text-sm">
                            <option>رسمية</option>
                            <option>شفوية</option>
                            <option>كتابة يدوية</option>
                          </select>
                          <div className="flex gap-2">
                            <input type="number" value={will.value || ""} onChange={(e) => updateWill(will.id, "value", Number(e.target.value))} className="flex-1 rounded-lg border border-border bg-background p-2 text-sm" placeholder="القيمة" />
                            <button onClick={() => removeWill(will.id)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Spouse */}
              {step === 5 && (
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.hasSpouse} onChange={(e) => update("hasSpouse", e.target.checked)} className="size-4" />
                    هل يوجد زوج/زوجة؟
                  </label>
                  {data.hasSpouse && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">عدد الزوجات</label>
                      <select value={data.spouseCount} onChange={(e) => update("spouseCount", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                        <option value={1}>زوجة واحدة</option>
                        <option value={2}>زوجتان</option>
                        <option value={3}>ثلاث زوجات</option>
                        <option value={4}>أربع زوجات</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Children */}
              {step === 6 && (
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.hasChildren} onChange={(e) => update("hasChildren", e.target.checked)} className="size-4" />
                    هل يوجد أبناء أحياء؟
                  </label>
                  {data.hasChildren && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">عدد الأبناء الذكور الأحياء</label>
                        <input type="number" min={0} value={data.sonsCount || ""} onChange={(e) => update("sonsCount", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">عدد البنات الحيوات</label>
                        <input type="number" min={0} value={data.daughtersCount || ""} onChange={(e) => update("daughtersCount", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.deceasedSons > 0} onChange={(e) => update("deceasedSons", e.target.checked ? 1 : 0)} className="size-4" />
                      هل توفى أي ابن قبل المتوفى؟
                    </label>
                    {data.deceasedSons > 0 && (
                      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">عدد الأبناء الذكور المتوفين قبل المتوفى</label>
                          <input type="number" min={1} value={data.deceasedSons} onChange={(e) => update("deceasedSons", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">عدد أبناء الابن المتوفى (أحفاد)</label>
                          <input type="number" min={0} value={data.deceasedSonsChildrenCount || ""} onChange={(e) => { update("deceasedSonsChildrenCount", Number(e.target.value)); update("deceasedSonsChildren", Number(e.target.value) > 0); }} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="0" />
                          <p className="mt-1 text-xs text-muted-foreground">عدد الذكور من أبناء الابن المتوفى (يأخذون نصيب أبيه بال😢اس)</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t pt-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.deceasedDaughters > 0} onChange={(e) => update("deceasedDaughters", e.target.checked ? 1 : 0)} className="size-4" />
                      هل توفيت أي بنت قبل المتوفى؟
                    </label>
                    {data.deceasedDaughters > 0 && (
                      <div className="mt-3">
                        <label className="mb-1.5 block text-sm font-medium">عدد البنات المتوفيات قبل المتوفى</label>
                        <input type="number" min={1} value={data.deceasedDaughters} onChange={(e) => update("deceasedDaughters", Number(e.target.value))} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
                        <p className="mt-1 text-xs text-muted-foreground">البنت المتوفاة قبل المتوفى لا ترث في المذهب الجعفري (الحجب بالabolition)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 7: Parents */}
              {step === 7 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border p-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.fatherAlive} onChange={(e) => update("fatherAlive", e.target.checked)} className="size-4" />
                      هل الأب حي وقت الوفاة؟
                    </label>
                    {!data.fatherAlive && (
                      <div className="mt-3 rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground mb-2">ما 상태 الأب؟</p>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="fatherStatus" checked={data.fatherDeceasedBefore} onChange={() => { update("fatherDeceasedBefore", true); update("fatherAlive", false); }} className="size-4" />
                            توفي قبل المتوفى (لا يرث)
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="fatherStatus" checked={!data.fatherDeceasedBefore && !data.fatherAlive} onChange={() => { update("fatherDeceasedBefore", false); update("fatherAlive", false); }} className="size-4" />
                            غير معروف / غير محدد
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.motherAlive} onChange={(e) => update("motherAlive", e.target.checked)} className="size-4" />
                      هل الأم حية وقت الوفاة؟
                    </label>
                    {!data.motherAlive && (
                      <div className="mt-3 rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground mb-2">ما حالة الأم؟</p>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="motherStatus" checked={data.motherDeceasedBefore} onChange={() => { update("motherDeceasedBefore", true); update("motherAlive", false); }} className="size-4" />
                            توفيت قبل المتوفى (لا ترث)
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="motherStatus" checked={!data.motherDeceasedBefore && !data.motherAlive} onChange={() => { update("motherDeceasedBefore", false); update("motherAlive", false); }} className="size-4" />
                            غير معروفة / غير محددة
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 8: Siblings */}
              {step === 8 && (
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.hasSiblings} onChange={(e) => update("hasSiblings", e.target.checked)} className="size-4" />
                    هل يوجد إخوة/أخوات؟
                  </label>
                  {data.hasSiblings && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium">أشقاء (أب وأم)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground">ذكور</label>
                            <input type="number" min={0} value={data.fullBrothers || ""} onChange={(e) => update("fullBrothers", Number(e.target.value))} className="w-full rounded-lg border border-border bg-background p-2 text-sm" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">إناث</label>
                            <input type="number" min={0} value={data.fullSisters || ""} onChange={(e) => update("fullSisters", Number(e.target.value))} className="w-full rounded-lg border border-border bg-background p-2 text-sm" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium">لأب فقط</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground">ذكور</label>
                            <input type="number" min={0} value={data.paternalBrothers || ""} onChange={(e) => update("paternalBrothers", Number(e.target.value))} className="w-full rounded-lg border border-border bg-background p-2 text-sm" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">إناث</label>
                            <input type="number" min={0} value={data.paternalSisters || ""} onChange={(e) => update("paternalSisters", Number(e.target.value))} className="w-full rounded-lg border border-border bg-background p-2 text-sm" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium">لأم فقط</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground">ذكور</label>
                            <input type="number" min={0} value={data.maternalBrothers || ""} onChange={(e) => update("maternalBrothers", Number(e.target.value))} className="w-full rounded-lg border border-border bg-background p-2 text-sm" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">إناث</label>
                            <input type="number" min={0} value={data.maternalSisters || ""} onChange={(e) => update("maternalSisters", Number(e.target.value))} className="w-full rounded-lg border border-border bg-background p-2 text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 9: Extended Family */}
              {step === 9 && (
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.hasGrandparents} onChange={(e) => update("hasGrandparents", e.target.checked)} className="size-4" />
                    هل يوجد أجداد/جدات؟
                  </label>
                  {data.hasGrandparents && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.paternalGrandfather} onChange={(e) => update("paternalGrandfather", e.target.checked)} className="size-4" /> الجد لأب</label>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.paternalGrandmother} onChange={(e) => update("paternalGrandmother", e.target.checked)} className="size-4" /> الجدة لأب</label>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.maternalGrandfather} onChange={(e) => update("maternalGrandfather", e.target.checked)} className="size-4" /> الجد لأم</label>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.maternalGrandmother} onChange={(e) => update("maternalGrandmother", e.target.checked)} className="size-4" /> الجدة لأم</label>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.hasDescendants} onChange={(e) => update("hasDescendants", e.target.checked)} className="size-4" />
                      هل يوجد أحفاد من أبناء الابن؟
                    </label>
                    {data.hasDescendants && (
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div><label className="text-[10px] text-muted-foreground">أحفاد ذكور من الابن</label><input type="number" min={0} value={data.grandsonsFromSon || ""} onChange={(e) => update("grandsonsFromSon", Number(e.target.value))} className="w-full rounded-lg border border-border bg-background p-2 text-sm" /></div>
                        <div><label className="text-[10px] text-muted-foreground">أحفاد إناث من الابن</label><input type="number" min={0} value={data.granddaughtersFromSon || ""} onChange={(e) => update("granddaughtersFromSon", Number(e.target.value))} className="w-full rounded-lg border border-border bg-background p-2 text-sm" /></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 10: Special Cases */}
              {step === 10 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">هل توجد أي من الحالات التالية؟</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      { value: "pregnancy", label: "حمل" },
                      { value: "unknown_heir", label: "وارث مجهول المصير" },
                      { value: "deceased_before", label: "وارث توفي قبل المتوفى" },
                      { value: "deceased_after", label: "وارث توفي بعد المتوفى" },
                      { value: "disputed_paternity", label: "نزاع على النسب" },
                      { value: "disputed_property", label: "نزاع على الملكية" },
                      { value: "disputed_will", label: "وصية متنازع عليها" },
                      { value: "disputed_debt", label: "ديون متنازع عليها" },
                      { value: "prior_judgment", label: "حكم قضائي سابق" },
                      { value: "pending_litigation", label: "قضية منظورة" },
                      { value: "incomplete_info", label: "معلومات ناقصة" },
                      { value: "foreign_national", label: " nationals أجنبي" },
                    ].map((c) => (
                      <label key={c.value} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={data.specialCases.some((sc) => sc.type === c.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              update("specialCases", [...data.specialCases, { id: `sc${Date.now()}`, type: c.value, description: "" }]);
                            } else {
                              update("specialCases", data.specialCases.filter((sc) => sc.type !== c.value));
                            }
                          }}
                          className="size-4"
                        />
                        {c.label}
                      </label>
                    ))}
                  </div>
                  {data.specialCases.length > 0 && (
                    <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                      <AlertTriangle className="mb-1 inline size-3.5" /> بعض الحالات قد تتطلب مراجعة قانونية متخصصة
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">ملاحظات إضافية</label>
                    <textarea value={data.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" rows={3} placeholder="أي معلومات إضافية..." />
                  </div>
                </div>
              )}

              {/* Step 11: Review */}
              {step === 11 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">مراجعة البيانات قبل الحساب</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">المتوفى</p>
                      <p className="text-sm font-medium">{data.deceasedGender === "male" ? "ذكر" : "أنثى"} — {data.deathDate}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">النظام القانوني</p>
                      <p className="text-sm font-medium">{data.legalSystem === "islamic" ? "الشريعة الإسلامية" : data.legalSystem === "civil" ? "القانون المدني" : data.legalSystem === "mixed" ? "مختلط" : "غير محدد"}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">التركة</p>
                      <p className="text-sm font-medium">{toArabicDigits(data.totalEstate)} دينار</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">الديون</p>
                      <p className="text-sm font-medium">{toArabicDigits(data.debts.reduce((s, d) => s + d.value, 0))} دينار</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">الزوج/الزوجة</p>
                      <p className="text-sm font-medium">{data.hasSpouse ? `${data.spouseCount} (${data.deceasedGender === "male" ? "زوجات" : "زوج"})` : "لا يوجد"}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">الأبناء</p>
                      <p className="text-sm font-medium">
                        {data.hasChildren ? `${data.sonsCount} ذكور، ${data.daughtersCount} إناث` : "لا يوجد"}
                        {data.deceasedSons > 0 && ` — ${data.deceasedSons} متوفين`}
                        {data.deceasedSonsChildrenCount > 0 && ` (${data.deceasedSonsChildrenCount} أحفاد)`}
                        {data.deceasedDaughters > 0 && ` — ${data.deceasedDaughters} بنات متوفيات`}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">الأب</p>
                      <p className="text-sm font-medium">{data.fatherAlive ? "حي" : "متوفى"}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">الأم</p>
                      <p className="text-sm font-medium">{data.motherAlive ? "حي" : "متوفاة"}</p>
                    </div>
                  </div>
                  {data.specialCases.length > 0 && (
                    <div className="rounded-lg bg-amber-50 p-3 text-xs dark:bg-amber-900/20">
                      <p className="mb-1 font-bold text-amber-700 dark:text-amber-400">الحالات الخاصة:</p>
                      <ul className="list-disc pr-4 text-amber-600 dark:text-amber-400">
                        {data.specialCases.map((c) => (
                          <li key={c.id}>{c.type}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Step 12: Result */}
              {step === 12 && result && (
                <div className="space-y-6">
                  {result.status === "needs_lawyer" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="size-5" />
                        <p className="font-bold">تحتاج هذه الحالة إلى مراجعة قانونية</p>
                      </div>
                      <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{result.lawyerReason}</p>
                      <Link href="/lawyers" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700">
                        <Phone className="size-4" /> التواصل مع محامٍ متخصص
                      </Link>
                    </div>
                  )}

                  {result.status === "needs_review" && (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <p className="font-bold text-yellow-700 dark:text-yellow-400">تحتاج هذه الحالة إلى مراجعة</p>
                      {result.warnings.map((w, i) => (
                        <p key={i} className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">{w}</p>
                      ))}
                    </div>
                  )}

                  {/* Estate Summary */}
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <h3 className="mb-3 font-bold">ملخص التركة</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      <div><span className="text-muted-foreground">إجمالي التركة:</span> <span className="font-bold">{toArabicDigits(result.totalEstate)} دينار</span></div>
                      <div><span className="text-muted-foreground">الديون:</span> <span className="font-bold text-red-500">{toArabicDigits(result.debts)} دينار</span></div>
                      <div><span className="text-muted-foreground">الوصايا:</span> <span className="font-bold text-purple-500">{toArabicDigits(result.willDeduction)} دينار</span></div>
                      <div><span className="text-muted-foreground">صافي التركة:</span> <span className="font-bold text-green-600">{toArabicDigits(result.netEstate)} دينار</span></div>
                    </div>
                  </div>

                  {/* Heirs Table */}
                  {result.heirs.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-bold">الورثة المستحقون</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-right text-xs text-muted-foreground">
                              <th className="pb-2 pr-2">الوارث</th>
                              <th className="pb-2 pr-2">الحالة</th>
                              <th className="pb-2 pr-2">النص القانوني</th>
                              <th className="pb-2 pr-2">النسبة</th>
                              <th className="pb-2 pr-2">المبلغ</th>
                              <th className="pb-2 pr-2">السبب</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.heirs.map((heir, idx) => (
                              <React.Fragment key={idx}>
                                <tr className="border-b border-border/50">
                                  <td className="py-2 pr-2 font-medium">{heir.name}</td>
                                  <td className="py-2 pr-2"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">مستحق</span></td>
                                  <td className="max-w-[200px] truncate py-2 pr-2 text-xs text-muted-foreground">{heir.legalBasis}</td>
                                  <td className="py-2 pr-2 font-bold">{heir.percentage > 0 ? `${heir.percentage.toFixed(1)}%` : heir.fraction}</td>
                                  <td className="py-2 pr-2 font-bold text-green-600">{toArabicDigits(Math.round(heir.amount))} دينار</td>
                                  <td className="py-2 pr-2">
                                    <button
                                      onClick={() => setExpandedHeir(expandedHeir === idx ? null : idx)}
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      لماذا؟
                                    </button>
                                  </td>
                                </tr>
                                {expandedHeir === idx && (
                                  <tr>
                                    <td colSpan={6} className="bg-muted/30 p-3 text-xs">
                                      <p className="mb-1 font-bold">السبب:</p>
                                      <p>{heir.legalBasis}</p>
                                      <p className="mt-1 text-muted-foreground">القانون: {heir.lawName}</p>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Excluded Persons */}
                  {result.excludedPersons.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-bold text-red-600">المحجوبون</h3>
                      <div className="space-y-2">
                        {result.excludedPersons.map((heir, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-900/20">
                            <div>
                              <span className="font-medium">{heir.relationship}</span>
                              <span className="mr-2 text-xs text-red-500">— محجوب</span>
                            </div>
                            <div className="text-xs text-red-600">{heir.excludeReason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legal References */}
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <h3 className="mb-3 font-bold">الأساس القانوني</h3>
                    <p className="text-sm text-muted-foreground">جميع النسب مبنية على قانون الأحوال الشخصية العراقي رقم 188 لسنة 1959 وتعديلاته.</p>
                    <Link href="/laws/personal" className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                      عرض القانون <ArrowLeft className="size-3" />
                    </Link>
                  </div>

                  {/* Lawyer Recommendation */}
                  <div className="rounded-xl border border-border p-4">
                    <h3 className="mb-2 font-bold">هل تحتاج مساعدة؟</h3>
                    <p className="text-sm text-muted-foreground">تواصل مع محامٍ متخصص في الأحوال الشخصية</p>
                    <Link href="/lawyers" className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                      <Phone className="size-4" /> ابحث عن محامٍ
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {step < 12 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> السابق
          </button>
          <button
            onClick={goNext}
            disabled={!canNext}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-40"
          >
            {step === 11 ? "احسب الآن" : "التالي"} <ArrowLeft className="size-4" />
          </button>
        </div>
      )}

      {step === 12 && (
        <div className="mt-6 text-center">
          <button onClick={() => { setStep(1); setData({ ...INITIAL_WIZARD_DATA }); setResult(null); }} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
            حساب جديد
          </button>
        </div>
      )}
    </div>
  );
}
