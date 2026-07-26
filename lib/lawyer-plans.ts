"use client";

import { getUserSession } from "./user-auth";

/* ─── Plan Types ─── */

export interface PlanFeature {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface Plan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  isDefault: boolean;
  active: boolean;
  createdAt: string;
}

export interface LawyerPlanSubscription {
  id: string;
  lawyerId: string;
  lawyerName: string;
  lawyerEmail: string;
  planId: string;
  planName: string;
  billingCycle: "monthly" | "yearly";
  status: "pending" | "active" | "expired" | "cancelled";
  price: number;
  startDate: string;
  expiryDate: string;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

/* ─── Storage ─── */

const PLANS_KEY = "lawyer_plans";
const SUBS_KEY = "lawyer_plan_subscriptions";

function genId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ─── Default Plans ─── */

const defaultPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    nameAr: "مجاني",
    description: "الخطة الأساسية للمحامين الجدد",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { key: "verification", label: "توثيق المحامي", description: "عرض شارة التوثيق", enabled: false },
      { key: "articles", label: "نشر مقالات", description: "نشر مقالات قانونية", enabled: false },
      { key: "ai_assistant", label: "المساعد الذكي", description: "استخدام المساعد القانوني الذكي", enabled: false },
      { key: "templates", label: "النماذج القانونية", description: "استخدام النماذج القانونية الجاهزة", enabled: false },
      { key: "messages", label: "الرسائل مع المستخدمين", description: "استقبال وإرسال الرسائل", enabled: true },
    ],
    isDefault: true,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "basic",
    name: "Basic",
    nameAr: "أساسي",
    description: "للمحامين المستقلين",
    monthlyPrice: 50000,
    yearlyPrice: 500000,
    features: [
      { key: "verification", label: "توثيق المحامي", description: "عرض شارة التوثيق", enabled: true },
      { key: "articles", label: "نشر مقالات", description: "نشر حتى 5 مقالات شهرياً", enabled: true },
      { key: "ai_assistant", label: "المساعد الذكي", description: "استخدام المساعد القانوني الذكي", enabled: false },
      { key: "templates", label: "النماذج القانونية", description: "استخدام النماذج القانونية الجاهزة", enabled: false },
      { key: "messages", label: "الرسائل مع المستخدمين", description: "استقبال وإرسال الرسائل", enabled: true },
    ],
    isDefault: false,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "pro",
    name: "Professional",
    nameAr: "محترف",
    description: "للمحامين والشركات القانونية",
    monthlyPrice: 150000,
    yearlyPrice: 1500000,
    features: [
      { key: "verification", label: "توثيق المحامي", description: "عرض شارة التوثيق", enabled: true },
      { key: "articles", label: "نشر مقالات", description: "نشر مقالات غير محدودة", enabled: true },
      { key: "ai_assistant", label: "المساعد الذكي", description: "استخدام المساعد القانوني الذكي", enabled: true },
      { key: "templates", label: "النماذج القانونية", description: "استخدام النماذج القانونية الجاهزة", enabled: true },
      { key: "messages", label: "الرسائل مع المستخدمين", description: "استقبال وإرسال الرسائل", enabled: true },
    ],
    isDefault: false,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

/* ─── Plans CRUD ─── */

export function getAllPlans(): Plan[] {
  if (typeof window === "undefined") return defaultPlans;
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    if (!raw) {
      localStorage.setItem(PLANS_KEY, JSON.stringify(defaultPlans));
      return defaultPlans;
    }
    return JSON.parse(raw) as Plan[];
  } catch {
    return defaultPlans;
  }
}

export function saveAllPlans(plans: Plan[]): void {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function getDefaultPlan(): Plan {
  return getAllPlans().find((p) => p.isDefault) || defaultPlans[0];
}

export function getActivePlans(): Plan[] {
  return getAllPlans().filter((p) => p.active);
}

export function addPlan(plan: Omit<Plan, "id" | "createdAt">): Plan {
  const plans = getAllPlans();
  const newPlan: Plan = {
    ...plan,
    id: genId(),
    createdAt: new Date().toISOString(),
  };
  plans.push(newPlan);
  saveAllPlans(plans);
  return newPlan;
}

export function updatePlan(id: string, updates: Partial<Plan>): boolean {
  const plans = getAllPlans();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  plans[idx] = { ...plans[idx], ...updates };
  saveAllPlans(plans);
  return true;
}

export function deletePlan(id: string): boolean {
  const plans = getAllPlans();
  const filtered = plans.filter((p) => p.id !== id);
  if (filtered.length === plans.length) return false;
  saveAllPlans(filtered);
  return true;
}

/* ─── Subscriptions CRUD ─── */

function getAllSubs(): LawyerPlanSubscription[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUBS_KEY);
    return raw ? (JSON.parse(raw) as LawyerPlanSubscription[]) : [];
  } catch {
    return [];
  }
}

function saveAllSubs(subs: LawyerPlanSubscription[]): void {
  localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
}

/** Lawyer requests a plan upgrade */
export function requestPlan(
  planId: string,
  billingCycle: "monthly" | "yearly"
): { success: boolean; error?: string } {
  const session = getUserSession();
  if (!session || session.role !== "lawyer") {
    return { success: false, error: "يجب تسجيل الدخول كمحامٍ" };
  }

  const plans = getAllPlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return { success: false, error: "الخطة غير موجودة" };

  const subs = getAllSubs();
  const existing = subs.find(
    (s) => s.lawyerId === session.userId && (s.status === "pending" || s.status === "active")
  );
  if (existing) {
    return {
      success: false,
      error: existing.status === "pending"
        ? "لديك طلب خطة قيد المراجعة بالفعل"
        : "أنت مشترك في خطة نشطة بالفعل",
    };
  }

  const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  const sub: LawyerPlanSubscription = {
    id: genId(),
    lawyerId: session.userId,
    lawyerName: session.name,
    lawyerEmail: session.email,
    planId: plan.id,
    planName: plan.nameAr,
    billingCycle,
    status: "pending",
    price,
    startDate: new Date().toISOString(),
    expiryDate: "",
    requestedAt: new Date().toISOString(),
  };

  subs.push(sub);
  saveAllSubs(subs);
  return { success: true };
}

/** Get current lawyer's subscription */
export function getMySubscription(): LawyerPlanSubscription | null {
  const session = getUserSession();
  if (!session) return null;
  const subs = getAllSubs();
  return (
    subs.find(
      (s) =>
        s.lawyerId === session.userId &&
        (s.status === "pending" || s.status === "active")
    ) ?? null
  );
}

/** Get current lawyer's active plan features */
export function getMyPlanFeatures(): PlanFeature[] {
  const sub = getMySubscription();
  if (!sub || sub.status !== "active") {
    return getDefaultPlan().features;
  }
  const plans = getAllPlans();
  const plan = plans.find((p) => p.id === sub.planId);
  return plan?.features ?? getDefaultPlan().features;
}

/** Check if current lawyer has a specific feature */
export function hasFeature(featureKey: string): boolean {
  const features = getMyPlanFeatures();
  return features.find((f) => f.key === featureKey)?.enabled ?? false;
}

/** Admin: Get all pending plan requests */
export function getPendingPlanRequests(): LawyerPlanSubscription[] {
  return getAllSubs().filter((s) => s.status === "pending");
}

/** Admin: Get all plan subscriptions */
export function getAllSubscriptions(): LawyerPlanSubscription[] {
  return getAllSubs();
}

/** Admin: Approve a plan request */
export function approvePlanRequest(
  subscriptionId: string
): { success: boolean; error?: string } {
  const subs = getAllSubs();
  const idx = subs.findIndex((s) => s.id === subscriptionId);
  if (idx === -1) return { success: false, error: "الطلب غير موجود" };
  if (subs[idx].status !== "pending")
    return { success: false, error: "الطلب ليس قيد المراجعة" };

  const now = new Date();
  const expiry = new Date(now);
  if (subs[idx].billingCycle === "yearly") {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else {
    expiry.setMonth(expiry.getMonth() + 1);
  }

  subs[idx] = {
    ...subs[idx],
    status: "active",
    startDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    approvedAt: now.toISOString(),
  };

  saveAllSubs(subs);

  // Also update the lawyer's profile with verified status
  try {
    const profilesRaw = localStorage.getItem("lawyer_profiles");
    if (profilesRaw) {
      const profiles = JSON.parse(profilesRaw);
      const plan = getAllPlans().find((p) => p.id === subs[idx].planId);
      const hasVerification = plan?.features.find(
        (f: any) => f.key === "verification"
      )?.enabled;

      const pIdx = profiles.findIndex(
        (l: any) => l.id === subs[idx].lawyerId
      );
      if (pIdx !== -1) {
        profiles[pIdx] = {
          ...profiles[pIdx],
          verified: hasVerification || false,
          planId: subs[idx].planId,
          planName: subs[idx].planName,
          planExpiry: expiry.toISOString(),
        };
        localStorage.setItem("lawyer_profiles", JSON.stringify(profiles));
      }
    }
  } catch {
    /* silent */
  }

  return { success: true };
}

/** Admin: Reject a plan request */
export function rejectPlanRequest(
  subscriptionId: string,
  reason: string
): { success: boolean; error?: string } {
  const subs = getAllSubs();
  const idx = subs.findIndex((s) => s.id === subscriptionId);
  if (idx === -1) return { success: false, error: "الطلب غير موجود" };

  subs[idx] = {
    ...subs[idx],
    status: "cancelled",
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
  };
  saveAllSubs(subs);
  return { success: true };
}

/** Cancel a plan subscription */
export function cancelSubscription(): boolean {
  const session = getUserSession();
  if (!session) return false;
  const subs = getAllSubs();
  const idx = subs.findIndex(
    (s) => s.lawyerId === session.userId && s.status === "active"
  );
  if (idx === -1) return false;

  subs[idx] = { ...subs[idx], status: "cancelled" };
  saveAllSubs(subs);
  return true;
}
