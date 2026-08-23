"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard, CheckCircle2, XCircle, Trash2, Plus, Save,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import {
  getAllPlans, saveAllPlans, addPlan, updatePlan, deletePlan,
  getPendingPlanRequests, approvePlanRequest, rejectPlanRequest,
  getAllSubscriptions, type Plan, type LawyerPlanSubscription,
} from "@/lib/lawyer-plans";
import { toast } from "@/lib/admin-toast";
import { cn } from "@/lib/utils";

/* ─── Plan management ─── */

function PlansTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newPlan, setNewPlan] = useState({
    nameAr: "", description: "", monthlyPrice: 0, yearlyPrice: 0, isDefault: false, active: true,
    features: [
      { key: "verification", label: "توثيق المحامي", description: "عرض شارة التوثيق", enabled: false },
      { key: "articles", label: "نشر مقالات", description: "نشر مقالات قانونية", enabled: false },
      { key: "ai_assistant", label: "المساعد الذكي", description: "استخدام المساعد القانوني الذكي", enabled: false },
      { key: "templates", label: "النماذج القانونية", description: "استخدام النماذج القانونية الجاهزة", enabled: false },
      { key: "messages", label: "الرسائل مع المستخدمين", description: "استقبال وإرسال الرسائل", enabled: true },
    ],
  });

  useEffect(() => { setPlans(getAllPlans()); }, []);

  const handleSave = () => {
    if (!newPlan.nameAr.trim()) { toast.error("خطأ", "اسم الخطة مطلوب"); return; }
    if (showNew) {
      addPlan({ ...newPlan, name: newPlan.nameAr });
      toast.success("تم", "تمت إضافة الخطة");
      setShowNew(false);
    }
    setPlans(getAllPlans());
    setNewPlan({ nameAr: "", description: "", monthlyPrice: 0, yearlyPrice: 0, isDefault: false, active: true,
      features: [
        { key: "verification", label: "توثيق المحامي", description: "عرض شارة التوثيق", enabled: false },
        { key: "articles", label: "نشر مقالات", description: "نشر مقالات قانونية", enabled: false },
        { key: "ai_assistant", label: "المساعد الذكي", description: "استخدام المساعد القانوني الذكي", enabled: false },
        { key: "templates", label: "النماذج القانونية", description: "استخدام النماذج القانونية الجاهزة", enabled: false },
        { key: "messages", label: "الرسائل مع المستخدمين", description: "استقبال وإرسال الرسائل", enabled: true },
      ],
    });
  };

  const toggleFeature = (planId: string, featureKey: string) => {
    const updated = plans.map((p) => {
      if (p.id !== planId) return p;
      return {
        ...p,
        features: p.features.map((f) => f.key === featureKey ? { ...f, enabled: !f.enabled } : f),
      };
    });
    saveAllPlans(updated);
    setPlans(updated);
  };

  const formatPrice = (price: number) =>
    price === 0 ? "مجاني" : `${price.toLocaleString("en-US")} د.ع`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">الخطط</h3>
        <Button size="sm" onClick={() => setShowNew(true)}><Plus className="ml-1 size-4" /> خطة جديدة</Button>
      </div>

      {showNew && (
        <Card className="border-accent">
          <CardHeader><CardTitle>إضافة خطة جديدة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">اسم الخطة</label>
                <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={newPlan.nameAr}
                  onChange={(e) => setNewPlan({ ...newPlan, nameAr: e.target.value })} placeholder="مثال: أساسي" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الوصف</label>
                <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">السعر الشهري (د.ع)</label>
                <input type="number" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={newPlan.monthlyPrice}
                  onChange={(e) => setNewPlan({ ...newPlan, monthlyPrice: +e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">السعر السنوي (د.ع)</label>
                <input type="number" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={newPlan.yearlyPrice}
                  onChange={(e) => setNewPlan({ ...newPlan, yearlyPrice: +e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">المميزات</label>
              <div className="space-y-2">
                {newPlan.features.map((f) => (
                  <label key={f.key} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                    <input type="checkbox" checked={f.enabled} onChange={() => {
                      const features = newPlan.features.map((x) => x.key === f.key ? { ...x, enabled: !x.enabled } : x);
                      setNewPlan({ ...newPlan, features });
                    }} className="size-4 rounded" />
                    <div>
                      <span className="font-medium text-sm">{f.label}</span>
                      <span className="mr-2 text-xs text-muted-foreground">{f.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}><Save className="ml-1 size-4" /> حفظ</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNew(false)}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={cn("relative", !plan.active && "opacity-60")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{plan.nameAr}</CardTitle>
                {plan.isDefault && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">افتراضي</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatPrice(plan.monthlyPrice)}</span>
                <span className="text-xs text-muted-foreground">/ شهرياً</span>
              </div>
              <div className="text-sm text-muted-foreground">
                سنوياً: {formatPrice(plan.yearlyPrice)}
              </div>
              <div className="space-y-1.5">
                {plan.features.map((f) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <button type="button" onClick={() => toggleFeature(plan.id, f.key)}
                      className={cn("rounded-full p-0.5", f.enabled ? "text-green-500" : "text-gray-400")}>
                      {f.enabled ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                    </button>
                    <span className={cn(!f.enabled && "text-muted-foreground")}>{f.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => updatePlan(plan.id, { active: !plan.active })}>
                  {plan.active ? <ToggleRight className="ml-1 size-4" /> : <ToggleLeft className="ml-1 size-4" />}
                  {plan.active ? "تعطيل" : "تفعيل"}
                </Button>
                {!plan.isDefault && (
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive"
                    onClick={() => { deletePlan(plan.id); setPlans(getAllPlans()); }}>
                    <Trash2 className="ml-1 size-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Subscription requests ─── */

function RequestsTab() {
  const [requests, setRequests] = useState<LawyerPlanSubscription[]>([]);
  const [reason, setReason] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);

  useEffect(() => { setRequests(getPendingPlanRequests()); }, []);

  const handleApprove = (id: string) => {
    const result = approvePlanRequest(id);
    if (result.success) {
      toast.success("تمت الموافقة", "تم تفعيل الخطة للمحامي");
      setRequests(getPendingPlanRequests());
    } else {
      toast.error("خطأ", result.error ?? "");
    }
  };

  const handleReject = () => {
    if (!rejectId) return;
    const result = rejectPlanRequest(rejectId, reason);
    if (result.success) {
      toast.success("تم الرفض", "تم رفض طلب الخطة");
      setRequests(getPendingPlanRequests());
      setRejectId(null);
      setReason("");
    }
  };

  const formatPrice = (price: number) =>
    price === 0 ? "مجاني" : `${price.toLocaleString("en-US")} د.ع`;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">طلبات الخطط المعلقة</h3>
      {requests.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد طلبات معلقة</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-bold">{req.lawyerName}</p>
                  <p className="text-sm text-muted-foreground">{req.lawyerEmail}</p>
                  <p className="text-sm">
                    الخطة: <span className="font-medium">{req.planName}</span> —
                    {req.billingCycle === "yearly" ? " سنوي" : " شهري"} —
                    <span className="font-medium"> {formatPrice(req.price)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    طلب في: {new Date(req.requestedAt).toLocaleDateString("en-US")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(req.id)}>
                    <CheckCircle2 className="ml-1 size-4" /> قبول
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setRejectId(req.id)}>
                    <XCircle className="ml-1 size-4" /> رفض
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {rejectId && (
        <Card className="border-destructive">
          <CardHeader><CardTitle>رفض الطلب</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">سبب الرفض</label>
              <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={reason}
                onChange={(e) => setReason(e.target.value)} placeholder="سبب الرفض..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleReject}>تأكيد الرفض</Button>
              <Button size="sm" variant="outline" onClick={() => { setRejectId(null); setReason(""); }}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── All subscriptions ─── */

function SubscriptionsTab() {
  const [subs, setSubs] = useState<LawyerPlanSubscription[]>([]);
  useEffect(() => { setSubs(getAllSubscriptions()); }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      pending: { label: "قيد المراجعة", cls: "bg-yellow-100 text-yellow-800" },
      active: { label: "نشط", cls: "bg-green-100 text-green-800" },
      expired: { label: "منتهي", cls: "bg-gray-100 text-gray-800" },
      cancelled: { label: "ملغي", cls: "bg-red-100 text-red-800" },
    };
    const b = map[s] ?? { label: s, cls: "bg-gray-100" };
    return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", b.cls)}>{b.label}</span>;
  };

  const formatPrice = (price: number) =>
    price === 0 ? "مجاني" : `${price.toLocaleString("en-US")} د.ع`;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">جميع الاشتراكات ({subs.length})</h3>
      {subs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد اشتراكات</CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-right text-muted-foreground">
                <th className="p-3">المحامي</th>
                <th className="p-3">الخطة</th>
                <th className="p-3">الدورة</th>
                <th className="p-3">السعر</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">
                    <p className="font-medium">{s.lawyerName}</p>
                    <p className="text-xs text-muted-foreground">{s.lawyerEmail}</p>
                  </td>
                  <td className="p-3">{s.planName}</td>
                  <td className="p-3">{s.billingCycle === "yearly" ? "سنوي" : "شهري"}</td>
                  <td className="p-3">{formatPrice(s.price)}</td>
                  <td className="p-3">{statusBadge(s.status)}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(s.requestedAt).toLocaleDateString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─── */

type SubTab = "plans" | "requests" | "subscriptions";

export default function AdminPlansPage() {
  const [tab, setTab] = useState<SubTab>("plans");

  const tabs: { key: SubTab; label: string; count?: number }[] = [
    { key: "plans", label: "الخطط" },
    { key: "requests", label: "طلبات معلقة", count: getPendingPlanRequests().length },
    { key: "subscriptions", label: "الاشتراكات" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="size-6 text-accent" />
        <h1 className="text-2xl font-extrabold">إدارة الخطط والاشتراكات</h1>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "bg-accent text-white" : "text-muted-foreground hover:bg-muted")}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="mr-1 inline-flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "plans" && <PlansTab />}
      {tab === "requests" && <RequestsTab />}
      {tab === "subscriptions" && <SubscriptionsTab />}
    </div>
  );
}
