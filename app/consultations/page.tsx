"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Info, User, FileText } from "lucide-react";

interface ConsultationForm {
  name: string;
  email: string;
  phone: string;
  type: string;
  title: string;
  description: string;
  urgency: "normal" | "urgent";
}

export default function ConsultationsPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<ConsultationForm>({
    name: "",
    email: "",
    phone: "",
    type: "",
    title: "",
    description: "",
    urgency: "normal",
  });

  const update = (field: keyof ConsultationForm, value: string) => setData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
        setStep(3);
      } else {
        alert("حدث خطأ. حاول مرة أخرى.");
      }
    } catch {
      alert("حدث خطأ في الاتصال. حاول مرة أخرى.");
    }
  };

  const consultationTypes = [
    { value: "civil", label: "قانون مدني", icon: "⚖️" },
    { value: "criminal", label: "قانون جنائي", icon: "🔒" },
    { value: "family", label: "أحوال شخصية", icon: "👨‍👩‍👧" },
    { value: "commercial", label: "قانون تجاري", icon: "💼" },
    { value: "labor", label: "قانون عمل", icon: "👷" },
    { value: "administrative", label: "قانون إداري", icon: "🏛️" },
    { value: "property", label: "قانون عقاري", icon: "🏠" },
    { value: "other", label: "أخرى", icon: "📋" },
  ];

  return (
    <div className="container max-w-4xl pb-20">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-violet-700 p-6 text-white md:p-8">
          <h1 className="text-2xl font-extrabold md:text-3xl">الاستشارات القانونية</h1>
          <p className="mt-2 text-sm text-white/80">احصل على استشارة قانونية متخصصة من محامين عراقيين موثوقين</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-2"><Clock className="size-3.5" /> رد سريع</div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-2"><CheckCircle className="size-3.5" /> محامون معتمدون</div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-2"><MessageSquare className="size-3.5" /> استشارة شاملة</div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-2"><FileText className="size-3.5" /> تقرير مفصل</div>
          </div>
        </div>
      </Card>

      {!submitted && step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mt-6">
          <Card className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <User className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">بياناتك الشخصية</h2>
                <p className="text-xs text-muted-foreground">التواصل معك لتقديم الاستشارة</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">الاسم الكامل *</label>
                  <input value={data.name} onChange={(e) => update("name", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="الاسم الكامل" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">رقم الهاتف *</label>
                  <input value={data.phone} onChange={(e) => update("phone", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="07XX XXX XXXX" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">البريد الإلكتروني</label>
                <input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="example@email.com" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setStep(2)} disabled={!data.name || !data.phone} className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-40">
                التالي <Send className="size-4 rotate-180" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {!submitted && step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mt-6">
          <Card className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <FileText className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">تفاصيل الاستشارة</h2>
                <p className="text-xs text-muted-foreground">اختر نوع الاستشارة واشرح وضعك</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">نوع الاستشارة *</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {consultationTypes.map((ct) => (
                    <label key={ct.value} className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition ${data.type === ct.value ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-border hover:border-purple-300"}`}>
                      <input type="radio" name="type" value={ct.value} checked={data.type === ct.value} onChange={(e) => update("type", e.target.value)} className="hidden" />
                      <span className="text-lg">{ct.icon}</span>
                      <span className="text-xs font-bold">{ct.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">موضوع الاستشارة *</label>
                <input value={data.title} onChange={(e) => update("title", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="مثال: نزاع عقاري، نفقة أطفال، قضية جنائية" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">وصف تفصيلي للمسألة القانونية *</label>
                <textarea value={data.description} onChange={(e) => update("description", e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" rows={5} placeholder="اشرح وضعك القانوني بالتفصيل كلما أمكن..." />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">مستوى الأولوية</label>
                <div className="flex gap-2">
                  <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border p-3 transition ${data.urgency === "normal" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-border"}`}>
                    <input type="radio" name="urgency" value="normal" checked={data.urgency === "normal"} onChange={(e) => update("urgency", e.target.value)} className="hidden" />
                    <Clock className="size-4 text-purple-600" />
                    <span className="text-sm font-bold">عادية</span>
                  </label>
                  <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border p-3 transition ${data.urgency === "urgent" ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-border"}`}>
                    <input type="radio" name="urgency" value="urgent" checked={data.urgency === "urgent"} onChange={(e) => update("urgency", e.target.value)} className="hidden" />
                    <AlertCircle className="size-4 text-red-600" />
                    <span className="text-sm font-bold">عاجلة</span>
                  </label>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <Info className="mb-1 inline size-3.5" /> سيتم مراجعة استشارتك من قبل محامٍ متخصص في غضون 24 ساعة. لن يتم مشاركة بياناتك مع أي طرف ثالث.
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="rounded-xl border border-border px-6 py-2.5 text-sm font-bold transition hover:bg-accent">السابق</button>
              <button onClick={handleSubmit} disabled={!data.type || !data.title || !data.description} className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-40">
                <Send className="size-4" /> إرسال الاستشارة
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {submitted && step === 3 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6">
          <Card className="p-8 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold">تم إرسال استشارتك بنجاح!</h2>
            <p className="mt-2 text-muted-foreground">سيتم التواصل معك من قبل محامٍ متخصص في أقرب وقت ممكن.</p>
            <p className="mt-1 text-sm text-muted-foreground">رقم الاستشارة: <span className="font-mono font-bold">#{Date.now().toString(36).toUpperCase()}</span></p>
            <div className="mt-6">
              <button onClick={() => { setSubmitted(false); setStep(1); setData({ name: "", email: "", phone: "", type: "", title: "", description: "", urgency: "normal" }); }} className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white hover:bg-purple-700">استشارة جديدة</button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
