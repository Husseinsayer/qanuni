// ===== Iraqi Legal Assistant - Bot Instructions Page =====
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getBotInstructions,
  setBotInstructions,
} from "@/lib/ai/settings-store";
import type { BotInstructions } from "@/lib/ai/types";
import { Save, Plus, Trash2, Info, AlertTriangle, Scale } from "lucide-react";
import { toast } from "@/lib/admin-toast";

const responseStyleOptions = [
  { value: "formal", label: "رسمي (قانوني محض)" },
  { value: "simplified", label: "مبسط (للمواطن العادي)" },
  { value: "balanced", label: "متوازن (الافتراضي)" },
] as const;

const languageOptions = [
  { value: "auto", label: "تلقائي (حسب لغة المستخدم)" },
  { value: "fusha", label: "الفصحى دائماً" },
  { value: "iraqi", label: "اللهجة العراقية دائماً" },
] as const;

const citationOptions = [
  { value: "always", label: "دائماً (ذكر المادة القانونية)" },
  { value: "when_needed", label: "عند الحاجة فقط" },
  { value: "never", label: "بدون ذكر المواد" },
] as const;

const lengthOptions = [
  { value: "concise", label: "مختصر (فقرة واحدة)" },
  { value: "detailed", label: "مفصل (مع شرح وتفصيل)" },
  { value: "comprehensive", label: "شامل (مع خطوات وحالات)" },
] as const;

const priorityOptions = [
  { value: "balanced", label: "متوازن (سرعة ودقة)" },
  { value: "speed", label: "سرعة الرد أولاً" },
  { value: "accuracy", label: "الدقة القصوى أولاً" },
] as const;

const legalSourceOptions = [
  { value: "laws_and_rulings", label: "القوانين + الأحكام القضائية" },
  { value: "laws_only", label: "القوانين النافذة فقط" },
  { value: "all", label: "القوانين + الأحكام + الآراء الفقهية" },
] as const;

const audienceOptions = [
  { value: "everyone", label: "الجميع (مواطنون ومحامون)" },
  { value: "lawyers_only", label: "المحامون فقط" },
  { value: "both", label: "استجابة مختلفة حسب المستخدم" },
] as const;

const defaultInstructions: BotInstructions = {
  generalBehavior: "",
  responseStyle: "balanced",
  languagePreference: "auto",
  citationRequirement: "always",
  showDisclaimer: true,
  maxResponseLength: "detailed",
  responsePriority: "balanced",
  disallowedActions: [""],
  restrictedTopics: [""],
  strictLawOnly: true,
  audienceMode: "everyone",
  requireVerification: false,
  allowPublicAccess: true,
  askClarifyingQuestions: true,
  maxClarifyingQuestions: 3,
  showPracticalSteps: true,
  showAlternativeInterpretations: false,
  showCourtProcedures: true,
  mentionUncertainty: true,
  referencePreviousConversations: false,
  legalSources: "laws_and_rulings",
  mentionProvinceDifferences: false,
  urgentCaseDetection: true,
  suggestHumanLawyer: true,
  escalationThreshold: 60,
};

export default function BotInstructionsPage() {
  const [instructions, setInstructions] = useState<BotInstructions>(defaultInstructions);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setInstructions(getBotInstructions());
    setLoaded(true);
  }, []);

  const handleSave = () => {
    setBotInstructions(instructions);
    toast.success("تم الحفظ", "تم حفظ تعليمات البوت بنجاح");
  };

  const addItem = (field: "disallowedActions" | "restrictedTopics") => {
    setInstructions({ ...instructions, [field]: [...instructions[field], ""] });
  };

  const updateItem = (field: "disallowedActions" | "restrictedTopics", idx: number, value: string) => {
    const arr = [...instructions[field]];
    arr[idx] = value;
    setInstructions({ ...instructions, [field]: arr });
  };

  const removeItem = (field: "disallowedActions" | "restrictedTopics", idx: number) => {
    setInstructions({ ...instructions, [field]: instructions[field].filter((_, i) => i !== idx) });
  };

  if (!loaded) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">جاري التحميل...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تعليمات البوت</h1>
          <p className="text-sm text-muted-foreground">تحكم في سلوك المساعد القانوني الذكي وكيفية إجابته ومن يستهدف</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 ml-2" />
          حفظ التغييرات
        </Button>
      </div>

      {/* ===== سلوك البوت ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-accent" />
            سلوك البوت وكيفية الإجابة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">التعليمات العامة للبوت</label>
            <p className="mb-2 text-xs text-muted-foreground">هذه التعليمات ستُرسل مع كل استفسار للبوت لتوجيه سلوكه</p>
            <textarea
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent min-h-[140px] font-mono leading-relaxed"
              value={instructions.generalBehavior}
              onChange={(e) => setInstructions({ ...instructions, generalBehavior: e.target.value })}
              dir="rtl"
              placeholder="اكتب التعليمات العامة للبوت هنا..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">أسلوب الرد</label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
                value={instructions.responseStyle}
                onChange={(e) => setInstructions({ ...instructions, responseStyle: e.target.value as BotInstructions["responseStyle"] })}
              >
                {responseStyleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">اللغة المفضلة</label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
                value={instructions.languagePreference}
                onChange={(e) => setInstructions({ ...instructions, languagePreference: e.target.value as BotInstructions["languagePreference"] })}
              >
                {languageOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">ذكر المواد القانونية</label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
                value={instructions.citationRequirement}
                onChange={(e) => setInstructions({ ...instructions, citationRequirement: e.target.value as BotInstructions["citationRequirement"] })}
              >
                {citationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">طول الرد</label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
                value={instructions.maxResponseLength}
                onChange={(e) => setInstructions({ ...instructions, maxResponseLength: e.target.value as BotInstructions["maxResponseLength"] })}
              >
                {lengthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">أولوية الرد</label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
                value={instructions.responsePriority}
                onChange={(e) => setInstructions({ ...instructions, responsePriority: e.target.value as BotInstructions["responsePriority"] })}
              >
                {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showDisclaimer"
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              checked={instructions.showDisclaimer}
              onChange={(e) => setInstructions({ ...instructions, showDisclaimer: e.target.checked })}
            />
            <label htmlFor="showDisclaimer" className="text-sm cursor-pointer">
              إظهار إخلاء مسؤولية قانوني (هذه المعلومات للاسترشاد فقط...)
            </label>
          </div>

          {instructions.showDisclaimer && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              سيتم عرض النص: "هذه المعلومات لأغراض إرشادية فقط ولا تعتبر استشارة قانونية ملزمة. يرجى استشارة محامٍ مؤهل."
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== الممنوعات والقيود ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            الممنوعات والقيود
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="strictLawOnly"
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              checked={instructions.strictLawOnly}
              onChange={(e) => setInstructions({ ...instructions, strictLawOnly: e.target.checked })}
            />
            <label htmlFor="strictLawOnly" className="text-sm cursor-pointer">
              التقيد الصارم بالقوانين العراقية فقط (لا إجابات عامة أو معلومات من خارج قاعدة البيانات)
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">الإجراءات الممنوعة على البوت</label>
              <Button variant="outline" size="sm" onClick={() => addItem("disallowedActions")}>
                <Plus className="h-3.5 w-3.5 ml-1" />
                إضافة
              </Button>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">أشياء يجب على البوت عدم فعلها أو قولها</p>
            <div className="space-y-2">
              {instructions.disallowedActions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    placeholder="مثال: تقديم استشارة قانونية ملزمة"
                    value={action}
                    onChange={(e) => updateItem("disallowedActions", idx, e.target.value)}
                  />
                  <button onClick={() => removeItem("disallowedActions", idx)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">المواضيع الممنوعة</label>
              <Button variant="outline" size="sm" onClick={() => addItem("restrictedTopics")}>
                <Plus className="h-3.5 w-3.5 ml-1" />
                إضافة
              </Button>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">مواضيع يجب على البوت تجنب الحديث عنها نهائياً</p>
            <div className="space-y-2">
              {instructions.restrictedTopics.map((topic, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    placeholder="مثال: الفتاوى الدينية"
                    value={topic}
                    onChange={(e) => updateItem("restrictedTopics", idx, e.target.value)}
                  />
                  <button onClick={() => removeItem("restrictedTopics", idx)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== الجمهور المستهدف ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            الجمهور المستهدف والصلاحيات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">من يمكنه استخدام البوت؟</label>
            <select
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
              value={instructions.audienceMode}
              onChange={(e) => setInstructions({ ...instructions, audienceMode: e.target.value as BotInstructions["audienceMode"] })}
            >
              {audienceOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowPublicAccess"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                checked={instructions.allowPublicAccess}
                onChange={(e) => setInstructions({ ...instructions, allowPublicAccess: e.target.checked })}
              />
              <label htmlFor="allowPublicAccess" className="text-sm cursor-pointer">
                السماح للعامة بالوصول (بدون تسجيل)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requireVerification"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                checked={instructions.requireVerification}
                onChange={(e) => setInstructions({ ...instructions, requireVerification: e.target.checked })}
              />
              <label htmlFor="requireVerification" className="text-sm cursor-pointer">
                طلب توثيق المحامي قبل استخدام البوت
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== ميزات الرد ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-500" />
            ميزات الرد الإضافية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="askClarifyingQuestions"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                checked={instructions.askClarifyingQuestions}
                onChange={(e) => setInstructions({ ...instructions, askClarifyingQuestions: e.target.checked })}
              />
              <label htmlFor="askClarifyingQuestions" className="text-sm cursor-pointer">
                طرح أسئلة توضيحية قبل الإجابة
              </label>
            </div>
            {instructions.askClarifyingQuestions && (
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium">الحد الأقصى للأسئلة التوضيحية</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="maxClarifyingQuestions"
                    min="1"
                    max="10"
                    className="flex-1 accent-accent"
                    value={instructions.maxClarifyingQuestions}
                    onChange={(e) => setInstructions({ ...instructions, maxClarifyingQuestions: Number(e.target.value) })}
                  />
                  <span className="min-w-[2rem] text-center text-sm font-medium">{instructions.maxClarifyingQuestions}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPracticalSteps"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                checked={instructions.showPracticalSteps}
                onChange={(e) => setInstructions({ ...instructions, showPracticalSteps: e.target.checked })}
              />
              <label htmlFor="showPracticalSteps" className="text-sm cursor-pointer">
                عرض الخطوات العملية
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showAlternativeInterpretations"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                checked={instructions.showAlternativeInterpretations}
                onChange={(e) => setInstructions({ ...instructions, showAlternativeInterpretations: e.target.checked })}
              />
              <label htmlFor="showAlternativeInterpretations" className="text-sm cursor-pointer">
                عرض تفسيرات بديلة (عند اختلاف الفقهاء)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showCourtProcedures"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                checked={instructions.showCourtProcedures}
                onChange={(e) => setInstructions({ ...instructions, showCourtProcedures: e.target.checked })}
              />
              <label htmlFor="showCourtProcedures" className="text-sm cursor-pointer">
                عرض الإجراءات القضائية والمحاكم المختصة
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mentionUncertainty"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                checked={instructions.mentionUncertainty}
                onChange={(e) => setInstructions({ ...instructions, mentionUncertainty: e.target.checked })}
              />
              <label htmlFor="mentionUncertainty" className="text-sm cursor-pointer">
                الإشارة عند عدم التأكد (نسبة الثقة)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="referencePreviousConversations"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                checked={instructions.referencePreviousConversations}
                onChange={(e) => setInstructions({ ...instructions, referencePreviousConversations: e.target.checked })}
              />
              <label htmlFor="referencePreviousConversations" className="text-sm cursor-pointer">
                الرجوع للمحادثات السابقة للمستخدم
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== مصادر وميزات متقدمة ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-500" />
            مصادر القوانين والميزات المتقدمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">مصادر الإجابة القانونية</label>
            <p className="mb-2 text-xs text-muted-foreground">تحديد المصادر التي يعتمد عليها البوت في الإجابة</p>
            <select
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
              value={instructions.legalSources}
              onChange={(e) => setInstructions({ ...instructions, legalSources: e.target.value as BotInstructions["legalSources"] })}
            >
              {legalSourceOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="urgentCaseDetection"
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              checked={instructions.urgentCaseDetection}
              onChange={(e) => setInstructions({ ...instructions, urgentCaseDetection: e.target.checked })}
            />
            <label htmlFor="urgentCaseDetection" className="text-sm cursor-pointer">
              كشف الحالات العاجلة (توقيف، اعتقال، حبس) وتوجيه المستخدم لاستشارة محامٍ فوراً
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mentionProvinceDifferences"
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              checked={instructions.mentionProvinceDifferences}
              onChange={(e) => setInstructions({ ...instructions, mentionProvinceDifferences: e.target.checked })}
            />
            <label htmlFor="mentionProvinceDifferences" className="text-sm cursor-pointer">
              ذكر الاختلافات حسب المحافظة (ممارسات المحاكم في بغداد vs البصرة vs أربيل)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="suggestHumanLawyer"
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              checked={instructions.suggestHumanLawyer}
              onChange={(e) => setInstructions({ ...instructions, suggestHumanLawyer: e.target.checked })}
            />
            <label htmlFor="suggestHumanLawyer" className="text-sm cursor-pointer">
              اقتراح استشارة محامٍ بشري عند الحاجة
            </label>
          </div>

          {instructions.suggestHumanLawyer && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">حد الثقة للإحالة إلى محامٍ بشري</label>
              <p className="mb-2 text-xs text-muted-foreground">عندما تقل نسبة ثقة البوت في الإجابة عن هذه النسبة، يقترح استشارة محامٍ</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  id="escalationThreshold"
                  min="0"
                  max="100"
                  step="5"
                  className="flex-1 accent-accent"
                  value={instructions.escalationThreshold}
                  onChange={(e) => setInstructions({ ...instructions, escalationThreshold: Number(e.target.value) })}
                />
                <span className="min-w-[3rem] text-center text-sm font-medium">{instructions.escalationThreshold}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
