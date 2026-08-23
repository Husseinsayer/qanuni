"use client";

import type { Lawyer } from "./data";
import { lawyers as defaultLawyers, articles as defaultArticles, lawyerSlug } from "./data";
import { getUserSession } from "./user-auth";

/* ─── Extended Types ─── */

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: number;
  description?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: number;
  expiryYear?: number;
}

export interface LawyerService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: string;
  online?: boolean;
}

export interface DayHours {
  enabled: boolean;
  from: string;
  to: string;
}

export interface WorkingHours {
  saturday: DayHours;
  sunday: DayHours;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  year: number;
  outcome: string;
}

export interface Review {
  id: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  text: string;
  date: string;
  service?: string;
  reply?: string;
  replyDate?: string;
}

export interface Message {
  id: string;
  fromName: string;
  fromEmail: string;
  fromPhone?: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  archived: boolean;
  replied: boolean;
  replyBody?: string;
  replyDate?: string;
  blocked: boolean;
}

export interface LawyerStats {
  totalViews: number;
  totalMessages: number;
  totalCalls: number;
  profileCompleteness: number;
  weeklyViews: number[];
  weeklyMessages: number[];
}

/* ─── Constants ─── */

export const hueOptions = [
  { value: "from-blue-600 to-indigo-700", label: "أزرق داكن" },
  { value: "from-amber-500 to-orange-600", label: "ذهبي" },
  { value: "from-slate-700 to-slate-900", label: "رمادي داكن" },
  { value: "from-emerald-500 to-teal-600", label: "أخضر زمردي" },
  { value: "from-blue-500 to-cyan-600", label: "أزرق سماوي" },
  { value: "from-purple-500 to-fuchsia-600", label: "بنفسجي" },
  { value: "from-indigo-600 to-blue-700", label: "نيلي" },
  { value: "from-rose-500 to-pink-600", label: "وردي" },
  { value: "from-red-500 to-rose-600", label: "أحمر" },
  { value: "from-teal-500 to-emerald-600", label: "فيروزي" },
];

export const cities = [
  "بغداد", "البصرة", "أربيل", "الموصل", "كركوك",
  "السليمانية", "النجف", "كربلاء", "الناصرية", "الحلة",
  "الديوانية", "العمارة", "الكوت", "دهوك", "الرمادي",
  "سامراء", "بعقوبة", "تكريت", "الفلوجة", "زاخو",
];

export const specializations = [
  "القانون المدني", "القانون التجاري", "القانون العقاري",
  "القانون الجنائي", "الأحوال الشخصية", "القانون الإداري",
  "القانون الدستوري", "القانون الدولي", "قانون العمل",
  "القانون المالي", "القانون الصحي", "قانون الملكية الفكرية",
  "القانون البيئي", "قانون الهجرة", "قانون الشركات",
];

/* ─── Internal helpers ─── */

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const defaultHours: DayHours = { enabled: true, from: "09:00", to: "17:00" };
const disabledHours: DayHours = { enabled: false, from: "09:00", to: "17:00" };

function defaultWorkingHours(): WorkingHours {
  return {
    saturday: { ...defaultHours },
    sunday: { ...defaultHours },
    monday: { ...defaultHours },
    tuesday: { ...defaultHours },
    wednesday: { ...defaultHours },
    thursday: { enabled: true, from: "09:00", to: "14:00" },
    friday: { ...disabledHours },
  };
}

function emptyStats(): LawyerStats {
  return {
    totalViews: 0, totalMessages: 0, totalCalls: 0,
    profileCompleteness: 0, weeklyViews: [4, 7, 3, 9, 12, 8, 15],
    weeklyMessages: [2, 1, 5, 3, 7, 4, 6],
  };
}

/* ─── Storage keys ─── */

const PROFILES_KEY = "lawyer_profiles";
const EXT_KEY = "lawyer_extended_data";
const STATS_KEY = "lawyer_stats_history";

/* ─── Base profile CRUD ─── */

function getAllProfiles(): Lawyer[] {
  if (typeof window === "undefined") return defaultLawyers;
  try {
    // Check admin data first — this is the source of truth when admin panel is used
    const adminRaw = localStorage.getItem("admin_site_data");
    if (adminRaw) {
      const adminData = JSON.parse(adminRaw);
      if (adminData?.lawyers && Array.isArray(adminData.lawyers) && adminData.lawyers.length > 0) {
        // Sync admin lawyers to lawyer_profiles for consistency
        localStorage.setItem(PROFILES_KEY, JSON.stringify(adminData.lawyers));
        return adminData.lawyers as Lawyer[];
      }
    }
    // Fallback to lawyer_profiles
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(defaultLawyers));
      return defaultLawyers;
    }
    const stored = JSON.parse(raw) as Lawyer[];
    // Merge: ensure all static lawyers are present
    const storedIds = new Set(stored.map((l) => l.id));
    const missing = defaultLawyers.filter((l) => !storedIds.has(l.id));
    if (missing.length > 0) {
      const merged = [...missing, ...stored];
      localStorage.setItem(PROFILES_KEY, JSON.stringify(merged));
      return merged;
    }
    return stored;
  } catch { return defaultLawyers; }
}

function saveAllProfiles(p: Lawyer[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(p));
  // Also sync to admin_site_data if it's the source of truth
  try {
    const adminRaw = localStorage.getItem("admin_site_data");
    if (adminRaw) {
      const adminData = JSON.parse(adminRaw);
      if (adminData && typeof adminData === "object") {
        adminData.lawyers = p;
        localStorage.setItem("admin_site_data", JSON.stringify(adminData));
      }
    }
  } catch { /* noop */ }
}

function getLawyerId(): string | null {
  const session = getUserSession();
  if (!session || session.role !== "lawyer") return null;
  const profiles = getAllProfiles();
  const byId = profiles.find((l) => l.id === session.userId);
  if (byId) return byId.id;
  const byEmail = profiles.find((l) => l.email === session.email);
  if (byEmail) {
    byEmail.id = session.userId;
    saveAllProfiles(profiles);
    return session.userId;
  }
  const np: Lawyer = {
    id: session.userId, name: session.name, city: "بغداد",
    specialization: "القانون المدني", experience: 5, rating: 0, reviews: 0,
    verified: false, price: 30, online: true, gender: "male",
    languages: ["العربية"], bio: "", initials: session.name.slice(0, 2),
    hue: "from-blue-600 to-indigo-700", whatsapp: "", telegram: "",
    facebook: "", instagram: "", email: session.email,
  };
  profiles.push(np);
  saveAllProfiles(profiles);
  return np.id;
}

export function getMyLawyerProfile(): Lawyer | null {
  const id = getLawyerId(); if (!id) return null;
  return getAllProfiles().find((l) => l.id === id) ?? null;
}

export function getLawyerProfileById(id: string): Lawyer | null {
  return getAllProfiles().find((l) => l.id === id) ?? null;
}

/** Lookup a lawyer by ID or slug, searching static + registered profiles. */
export function resolveLawyer(slugOrId: string): Lawyer | null {
  // Search static array by slug
  const bySlug = defaultLawyers.find((l) => lawyerSlug(l) === slugOrId);
  if (bySlug) return bySlug;
  // Search registered profiles by ID
  return getAllProfiles().find((l) => l.id === slugOrId) ?? null;
}

function defaultExtForLawyer(lawyerId: string): ExtData {
  const lawyer = defaultLawyers.find((l) => l.id === lawyerId);
  if (!lawyer) return defaultExt();

  const spec = lawyer.specialization;
  return {
    education: [
      { id: "ed-default-1", degree: "بكالوريوس في القانون", institution: "جامعة بغداد", year: lawyer.experience > 15 ? 2005 : 2012, description: "حصل على تقدير امتياز" },
      { id: "ed-default-2", degree: "ماجستير في " + spec, institution: "الجامعة المستنصرية", year: lawyer.experience > 15 ? 2008 : 2015, description: "" },
    ],
    certifications: [
      { id: "cert-default-1", title: "شهادة الممارسة القانونية", issuer: "نقابة المحامين العراقيين", year: lawyer.experience > 15 ? 2006 : 2013 },
      { id: "cert-default-2", title: "شهادة التحكيم التجاري", issuer: "اتحاد المحامين العرب", year: lawyer.experience > 15 ? 2010 : 2018 },
    ],
    services: [
      { id: "svc-default-1", name: "استشارة قانونية", description: "استشارة في مجال " + spec, price: lawyer.price, duration: "30 دقيقة", online: true },
      { id: "svc-default-2", name: "تمثيل قانوني", description: "تمثيل أمام المحاكم في قضايا " + spec, price: Math.round(lawyer.price * 1.5), duration: "حسب القضية", online: false },
      { id: "svc-default-3", name: "صياغة عقود ومذكرات", description: "صياغة العقود والمذكرات القانونية", price: Math.round(lawyer.price * 0.8), duration: "حسب العقد", online: true },
    ],
    workingHours: defaultWorkingHours(),
    portfolio: [
      { id: "pf-default-1", title: "قضية " + spec, description: "تمثيل ناجح في إحدى قضايا " + spec, category: spec, year: 2024, outcome: "حكم لصالح العميل" },
      { id: "pf-default-2", title: "استشارة " + spec, description: "تقديم استشارة قانونية شاملة في " + spec, category: spec, year: 2025, outcome: "تسوية ودية" },
    ],
    reviews: [],
    memberships: ["نقابة المحامين العراقيين", "اتحاد المحامين العرب"],
    awards: lawyer.experience > 15 ? ["جائزة التميز القانوني", "درع النقابة التقديري"] : ["جائزة التميز القانوني"],
    messages: [],
    seoDescription: "",
    seoKeywords: [],
    notificationEmail: true,
    notificationPhone: true,
  };
}

export function getExtByLawyerId(lawyerId: string): ExtData | null {
  if (typeof window === "undefined") return defaultExtForLawyer(lawyerId);
  try {
    const raw = localStorage.getItem(EXT_KEY);
    const all: Record<string, ExtData> = raw ? JSON.parse(raw) : {};
    return all[lawyerId] ?? defaultExtForLawyer(lawyerId);
  } catch { return defaultExtForLawyer(lawyerId); }
}

export function updateMyProfile(u: Partial<Omit<Lawyer, "id">>): Lawyer | null {
  const id = getLawyerId(); if (!id) return null;
  const profiles = getAllProfiles();
  const idx = profiles.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  profiles[idx] = { ...profiles[idx], ...u };
  saveAllProfiles(profiles);
  return profiles[idx];
}

/* ─── Promotion system ─── */

/** Request promotion for the current lawyer */
export function requestPromotion(city: string, planType: "monthly" | "yearly"): boolean {
  const id = getLawyerId(); if (!id) return false;
  const profiles = getAllProfiles();
  const idx = profiles.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  
  profiles[idx] = {
    ...profiles[idx],
    promotionStatus: "pending",
    promotionPlan: {
      city,
      type: planType,
      startDate: new Date().toISOString(),
    },
  };
  saveAllProfiles(profiles);
  return true;
}

/** Get the current lawyer's promotion status */
export function getMyPromotionStatus(): { status: string; plan: Lawyer["promotionPlan"] } {
  const id = getLawyerId();
  if (!id) return { status: "none", plan: undefined };
  const profiles = getAllProfiles();
  const lawyer = profiles.find((l) => l.id === id);
  return {
    status: lawyer?.promotionStatus || "none",
    plan: lawyer?.promotionPlan,
  };
}

/** Cancel promotion request */
export function cancelPromotionRequest(): boolean {
  const id = getLawyerId(); if (!id) return false;
  const profiles = getAllProfiles();
  const idx = profiles.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  
  profiles[idx] = {
    ...profiles[idx],
    promotionStatus: "none",
    promotionPlan: undefined,
  };
  saveAllProfiles(profiles);
  return true;
}

/** Admin: Approve a promotion request */
export function approvePromotion(lawyerId: string): boolean {
  const profiles = getAllProfiles();
  const idx = profiles.findIndex((l) => l.id === lawyerId);
  if (idx === -1) return false;
  
  const lawyer = profiles[idx];
  if (lawyer.promotionStatus !== "pending") return false;
  
  const now = new Date();
  const expiry = new Date(now);
  if (lawyer.promotionPlan?.type === "yearly") {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else {
    expiry.setMonth(expiry.getMonth() + 1);
  }
  
  profiles[idx] = {
    ...lawyer,
    promoted: true,
    promotionStatus: "approved",
    promotionPlan: {
      ...lawyer.promotionPlan!,
      startDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
    },
  };
  saveAllProfiles(profiles);
  return true;
}

/** Admin: Reject a promotion request */
export function rejectPromotion(lawyerId: string): boolean {
  const profiles = getAllProfiles();
  const idx = profiles.findIndex((l) => l.id === lawyerId);
  if (idx === -1) return false;
  
  profiles[idx] = {
    ...profiles[idx],
    promotionStatus: "rejected",
    promotionPlan: undefined,
  };
  saveAllProfiles(profiles);
  return true;
}

/** Admin: Remove promotion from a lawyer */
export function removePromotion(lawyerId: string): boolean {
  const profiles = getAllProfiles();
  const idx = profiles.findIndex((l) => l.id === lawyerId);
  if (idx === -1) return false;
  
  profiles[idx] = {
    ...profiles[idx],
    promoted: false,
    promotionStatus: "none",
    promotionPlan: undefined,
  };
  saveAllProfiles(profiles);
  return true;
}

/** Get all lawyers with pending promotion requests */
export function getPendingPromotions(): Lawyer[] {
  const profiles = getAllProfiles();
  return profiles.filter((l) => l.promotionStatus === "pending");
}

/** Get all promoted lawyers */
export function getPromotedLawyers(): Lawyer[] {
  const profiles = getAllProfiles();
  return profiles.filter((l) => l.promoted === true);
}

/* ─── Extended data ─── */

type ExtData = {
  education: Education[];
  certifications: Certification[];
  services: LawyerService[];
  workingHours: WorkingHours;
  portfolio: PortfolioItem[];
  reviews: Review[];
  memberships: string[];
  awards: string[];
  messages: Message[];
  seoDescription: string;
  seoKeywords: string[];
  notificationEmail: boolean;
  notificationPhone: boolean;
};

function defaultExt(): ExtData {
  return {
    education: [], certifications: [], services: [], workingHours: defaultWorkingHours(),
    portfolio: [], reviews: [], memberships: [], awards: [], messages: [],
    seoDescription: "", seoKeywords: [],
    notificationEmail: true, notificationPhone: true,
  };
}

function getOrCreateExt(): ExtData | null {
  const id = getLawyerId(); if (!id) return null;
  if (typeof window === "undefined") return defaultExt();
  try {
    const raw = localStorage.getItem(EXT_KEY);
    const all: Record<string, ExtData> = raw ? JSON.parse(raw) : {};
    if (!all[id]) all[id] = defaultExt();
    localStorage.setItem(EXT_KEY, JSON.stringify(all));
    return all[id];
  } catch { return defaultExt(); }
}

function saveExtField<T extends keyof ExtData>(field: T, value: ExtData[T]): void {
  const id = getLawyerId(); if (!id) return;
  try {
    const raw = localStorage.getItem(EXT_KEY);
    const all: Record<string, ExtData> = raw ? JSON.parse(raw) : {};
    if (!all[id]) all[id] = defaultExt();
    all[id][field] = value;
    localStorage.setItem(EXT_KEY, JSON.stringify(all));
  } catch { /* noop */ }
}

/* ─── Public extended data accessors ─── */

export function getMyEducation(): Education[] { return getOrCreateExt()?.education ?? []; }
export function addEducation(item: Omit<Education, "id">): Education {
  const list = getMyEducation();
  const n = { ...item, id: newId() };
  saveExtField("education", [...list, n]);
  return n;
}
export function removeEducation(id: string): void {
  saveExtField("education", getMyEducation().filter((x) => x.id !== id));
}

export function getMyCertifications(): Certification[] { return getOrCreateExt()?.certifications ?? []; }
export function addCertification(item: Omit<Certification, "id">): Certification {
  const list = getMyCertifications();
  const n = { ...item, id: newId() };
  saveExtField("certifications", [...list, n]);
  return n;
}
export function removeCertification(id: string): void {
  saveExtField("certifications", getMyCertifications().filter((x) => x.id !== id));
}

export function getMyServices(): LawyerService[] { return getOrCreateExt()?.services ?? []; }
export function addService(item: Omit<LawyerService, "id">): LawyerService {
  const list = getMyServices();
  const n = { ...item, id: newId() };
  saveExtField("services", [...list, n]);
  return n;
}
export function removeService(id: string): void {
  saveExtField("services", getMyServices().filter((x) => x.id !== id));
}
export function updateService(id: string, data: Partial<LawyerService>): void {
  saveExtField("services", getMyServices().map((s) => s.id === id ? { ...s, ...data } : s));
}

export function getMyWorkingHours(): WorkingHours { return getOrCreateExt()?.workingHours ?? defaultWorkingHours(); }
export function updateWorkingHours(h: WorkingHours): void { saveExtField("workingHours", h); }

export function getMyPortfolio(): PortfolioItem[] { return getOrCreateExt()?.portfolio ?? []; }
export function addPortfolioItem(item: Omit<PortfolioItem, "id">): PortfolioItem {
  const list = getMyPortfolio();
  const n = { ...item, id: newId() };
  saveExtField("portfolio", [...list, n]);
  return n;
}
export function removePortfolioItem(id: string): void {
  saveExtField("portfolio", getMyPortfolio().filter((x) => x.id !== id));
}

export function getMyReviews(): Review[] { return getOrCreateExt()?.reviews ?? []; }
export function addReview(item: Omit<Review, "id">): Review {
  const list = getMyReviews();
  const n = { ...item, id: newId() };
  saveExtField("reviews", [...list, n]);
  return n;
}
export function removeReview(id: string): void {
  saveExtField("reviews", getMyReviews().filter((x) => x.id !== id));
}
export function addReply(id: string, reply: string): void {
  saveExtField("reviews", getMyReviews().map((r) =>
    r.id === id ? { ...r, reply, replyDate: new Date().toISOString().slice(0, 10) } : r
  ));
}
export function getMyMemberships(): string[] { return getOrCreateExt()?.memberships ?? []; }
export function updateMemberships(m: string[]): void { saveExtField("memberships", m); }
export function getMyAwards(): string[] { return getOrCreateExt()?.awards ?? []; }
export function updateAwards(a: string[]): void { saveExtField("awards", a); }
export function updateSeo(desc: string, kw: string[]): void { saveExtField("seoDescription", desc); saveExtField("seoKeywords", kw); }
export function getMySeoDescription(): string { return getOrCreateExt()?.seoDescription ?? ""; }
export function getMySeoKeywords(): string[] { return getOrCreateExt()?.seoKeywords ?? []; }
/* ─── Messages ─── */

export function getMyMessages(): Message[] { return getOrCreateExt()?.messages ?? []; }

export function sendReply(messageId: string, replyBody: string): void {
  const msgs = getMyMessages();
  saveExtField("messages", msgs.map((m) =>
    m.id === messageId ? { ...m, replied: true, replyBody, replyDate: new Date().toISOString() } : m
  ));
}

export function archiveMessage(messageId: string): void {
  const msgs = getMyMessages();
  saveExtField("messages", msgs.map((m) =>
    m.id === messageId ? { ...m, archived: !m.archived } : m
  ));
}

export function markMessageRead(messageId: string): void {
  const msgs = getMyMessages();
  saveExtField("messages", msgs.map((m) =>
    m.id === messageId ? { ...m, read: true } : m
  ));
}

export function blockUser(messageId: string): void {
  const msgs = getMyMessages();
  const msg = msgs.find((m) => m.id === messageId);
  if (!msg) return;
  saveExtField("messages", msgs.map((m) =>
    m.fromEmail === msg.fromEmail ? { ...m, blocked: !m.blocked } : m
  ));
}

export function seedDemoMessages(): void {
  const ext = getOrCreateExt();
  if (!ext || !ext.messages || ext.messages.length > 0) return;
  const now = new Date();
  const demoMsgs: Message[] = [
    {
      id: newId(), fromName: "أحمد حسن", fromEmail: "ahmed@example.com", fromPhone: "+964770123456",
      subject: "استفسار عن قضية ميراث", body: "السلام عليكم، أريد استشارة بخصوص قضية ميراث. هل يمكنكم مساعدتي؟",
      date: new Date(now.getTime() - 86400000).toISOString(), read: false, archived: false, replied: false, blocked: false,
    },
    {
      id: newId(), fromName: "سارة محمود", fromEmail: "sara@example.com",
      subject: "طلب صياغة عقد", body: "مرحباً، أحتاج إلى صياغة عقد إيجار لمحل تجاري. كم تكلفة الصياغة؟",
      date: new Date(now.getTime() - 172800000).toISOString(), read: true, archived: false, replied: true,
      replyBody: "وعليكم السلام، تكلفة صياغة عقد الإيجار 150$. يمكننا البدء فوراً.",
      replyDate: new Date(now.getTime() - 86400000).toISOString(), blocked: false,
    },
    {
      id: newId(), fromName: "علي كريم", fromEmail: "ali@example.com",
      subject: "موعد جلسة", body: "السلام عليكم، متى يمكنني حجز جلسة استشارة وجهاً لوجه؟",
      date: new Date(now.getTime() - 259200000).toISOString(), read: true, archived: true, replied: false, blocked: false,
    },
    {
      id: newId(), fromName: "نور الزهراء", fromEmail: "noor@example.com",
      subject: "استشارة عاجلة", body: "لدي مشكلة عاجلة تتعلق بقضية أحوال شخصية. أرجو الرد في أقرب وقت.",
      date: new Date(now.getTime() - 3600000).toISOString(), read: false, archived: false, replied: false, blocked: false,
    },
  ];
  saveExtField("messages", [...ext.messages, ...demoMsgs]);
}

/* ─── Notifications ─── */

export function getMyNotifications(): { email: boolean; phone: boolean } {
  const e = getOrCreateExt();
  return { email: e?.notificationEmail ?? true, phone: e?.notificationPhone ?? true };
}
export function updateNotifications(email: boolean, phone: boolean): void {
  saveExtField("notificationEmail", email); saveExtField("notificationPhone", phone);
}

/* ─── Stats ─── */

export function getMyStats(): LawyerStats {
  if (typeof window === "undefined") return emptyStats();
  const id = getLawyerId(); if (!id) return emptyStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[id] ?? emptyStats();
  } catch { return emptyStats(); }
}

/* ─── Articles ─── */

export function getMyArticles() {
  const profile = getMyLawyerProfile();
  if (!profile) return [];
  return defaultArticles.filter((a) => a.lawyerId === profile.id || a.author.includes(profile.name));
}

/* ─── Seed demo data ─── */

export function seedLawyerDemoData(): void {
  const id = getLawyerId();
  if (!id) return;
  const ext = getOrCreateExt();
  if (!ext) return;

  ext.services ??= [];
  ext.education ??= [];
  ext.certifications ??= [];
  ext.reviews ??= [];
  ext.memberships ??= [];
  ext.awards ??= [];
  ext.messages ??= [];

  if (ext.services.length === 0) {
    ext.services = [
      { id: newId(), name: "استشارة قانونية", description: "استشارة هاتفية أو عبر الفيديو في مختلف القضايا", price: 50, duration: "30 دقيقة", online: true },
      { id: newId(), name: "صياغة عقود", description: "صياغة ومراجعة العقود التجارية والمدنية", price: 150, duration: "حسب العقد", online: false },
      { id: newId(), name: "تمثيل قانوني", description: "تمثيل أمام المحاكم في القضايا المدنية والتجارية", price: 300, duration: "جلسة", online: false },
      { id: newId(), name: "استشارة أونلاين", description: "استشارة عبر الواتساب أو البريد الإلكتروني", price: 30, duration: "رد خلال 24 ساعة", online: true },
    ];
  }
  if (ext.education.length === 0) {
    ext.education = [
      { id: newId(), degree: "دكتوراه في القانون", institution: "جامعة بغداد", year: 2015, description: "تخصص القانون المدني" },
      { id: newId(), degree: "ماجستير في القانون", institution: "جامعة النهرين", year: 2010, description: "تخصص القانون التجاري" },
    ];
  }
  if (ext.certifications.length === 0) {
    ext.certifications = [
      { id: newId(), title: "شهادة المحاماة", issuer: "نقابة المحامين العراقيين", year: 2012 },
      { id: newId(), title: "وساطة وتسوية منازعات", issuer: "المعهد القضائي العراقي", year: 2016 },
    ];
  }
  if (ext.reviews.length === 0) {
    ext.reviews = [
      { id: newId(), clientName: "أحمد حسن", rating: 5, text: "محامي ممتاز ومخلص في عمله، ساعدني في قضيتي وحصلت على حقي كاملاً.", date: "2025-12-15", service: "تمثيل قانوني" },
      { id: newId(), clientName: "سارة محمود", rating: 4, text: "استشارة مفيدة جداً، نصحني بشكل احترافي.", date: "2025-11-20", service: "استشارة قانونية" },
      { id: newId(), clientName: "علي كريم", rating: 5, text: "صياغة العقد كانت دقيقة ومهنية، أشكرك على المجهود.", date: "2025-10-05", service: "صياغة عقود" },
    ];
  }
  ext.memberships = ["نقابة المحامين العراقيين", "اتحاد المحامين العرب", "منظمة العدالة الدولية"];
  ext.awards = ["جائزة أفضل محامي لعام 2023", "شهادة تقدير من نقابة المحامين"];
  seedDemoMessages();
  saveExtField("services", ext.services);
  saveExtField("education", ext.education);
  saveExtField("certifications", ext.certifications);
  saveExtField("reviews", ext.reviews);
  saveExtField("memberships", ext.memberships);
  saveExtField("awards", ext.awards);
  saveExtField("workingHours", ext.workingHours);
}
