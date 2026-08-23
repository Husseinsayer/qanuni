"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Save, User, Phone,
  Camera, Check, X, Plus, GraduationCap, Award, Shield,
  Search, Bell, CheckCircle,
  Megaphone, Clock, Calendar, AlertTriangle, CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMyLawyerProfile, updateMyProfile, cities, specializations,
  getMyEducation, addEducation, removeEducation,
  getMyCertifications, addCertification, removeCertification,
  updateMemberships, getMyMemberships,
  updateAwards, getMyAwards,
  updateSeo, getMySeoDescription, getMySeoKeywords,
  updateNotifications, getMyNotifications,
  seedLawyerDemoData, type Education, type Certification,
  requestPromotion, getMyPromotionStatus, cancelPromotionRequest,
} from "@/lib/lawyer-profiles";
import { requestPlan, getMySubscription, cancelSubscription, getActivePlans } from "@/lib/lawyer-plans";
import { getUserSession } from "@/lib/user-auth";
import type { Lawyer } from "@/lib/data";

type Tab = "basic" | "qualifications" | "memberships" | "seo" | "notifications" | "promotion" | "subscription";

const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "basic", label: "الأساسية", icon: User },
  { key: "qualifications", label: "المؤهلات", icon: GraduationCap },
  { key: "memberships", label: "العضويات", icon: Shield },
  { key: "seo", label: "تحسين محركات البحث", icon: Search },
  { key: "notifications", label: "الإشعارات", icon: Bell },
  { key: "promotion", label: "الترويج", icon: Megaphone },
  { key: "subscription", label: "الاشتراك", icon: CreditCard },
];

export default function LawyerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Lawyer | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("basic");

  // Education state
  const [education, setEducation] = useState<Education[]>([]);
  const [newEdu, setNewEdu] = useState({ degree: "", institution: "", year: new Date().getFullYear(), description: "" });

  // Certifications state
  const [certs, setCerts] = useState<Certification[]>([]);
  const [newCert, setNewCert] = useState<{ title: string; issuer: string; year: number; expiryYear?: number }>({ title: "", issuer: "", year: new Date().getFullYear() });

  // Memberships state
  const [memberships, setMemberships] = useState<string[]>([]);
  const [newMembership, setNewMembership] = useState("");

  // Awards state
  const [awards, setAwards] = useState<string[]>([]);

  // SEO
  const [seoDesc, setSeoDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPhone, setNotifPhone] = useState(true);

  // Promotion
  const [promotionStatus, setPromotionStatus] = useState<string>("none");
  const [promotionPlan, setPromotionPlan] = useState<Lawyer["promotionPlan"]>(undefined);
  const [promoCity, setPromoCity] = useState("بغداد");
  const [promoType, setPromoType] = useState<"monthly" | "yearly">("monthly");

  // Subscription
  const [subscription, setSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Photo
  const [, setPhotoUrl] = useState("");

  // Languages
  const [langs, setLangs] = useState<string[]>(["العربية"]);
  const [newLang, setNewLang] = useState("");

  useEffect(() => {
    seedLawyerDemoData();
    const p = getMyLawyerProfile();
    if (!p) { const s = getUserSession(); if (s) { updateMyProfile({ name: s.name, initials: s.name.slice(0, 2) }); setProfile(getMyLawyerProfile()); } }
    else setProfile({ ...p });
    setLangs(p?.languages ?? ["العربية"]);
    setEducation(getMyEducation());
    setCerts(getMyCertifications());
    setMemberships(getMyMemberships());
    setAwards(getMyAwards());
    setSeoDesc(getMySeoDescription());
    setSeoKeywords(getMySeoKeywords());
    const n = getMyNotifications();
    setNotifEmail(n.email); setNotifPhone(n.phone);
    
    // Load promotion status
    const promo = getMyPromotionStatus();
    setPromotionStatus(promo.status);
    setPromotionPlan(promo.plan);
    
    // Load subscription & plans
    setSubscription(getMySubscription());
    setAvailablePlans(getActivePlans());
    setPhotoUrl((getMyLawyerProfile() as any)?.photoUrl ?? "");

    // Read tab from URL query param
    const tabParam = searchParams.get("tab") as Tab | null;
    if (tabParam && tabs.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [router, searchParams]);

  const setProfileField = <K extends keyof Lawyer>(field: K, value: Lawyer[K]) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!profile) return;
    updateMyProfile({ ...profile, languages: langs });
    // Save education
    getMyEducation().forEach((e) => removeEducation(e.id));
    education.forEach((e) => addEducation({ degree: e.degree, institution: e.institution, year: e.year, description: e.description }));
    // Save certs
    getMyCertifications().forEach((c) => removeCertification(c.id));
    certs.forEach((c) => addCertification({ title: c.title, issuer: c.issuer, year: c.year, expiryYear: c.expiryYear }));
    updateMemberships(memberships);
    updateAwards(awards);
    updateSeo(seoDesc, seoKeywords);
    updateNotifications(notifEmail, notifPhone);

    // Also save to API
    try {
      await fetch("/api/lawyer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          city: profile.city,
          specialization: profile.specialization,
          experience: profile.experience,
          price: profile.price,
          bio: profile.bio,
          gender: profile.gender,
          languages: langs,
          whatsapp: profile.whatsapp,
          telegram: profile.telegram,
          facebook: profile.facebook,
          instagram: profile.instagram,
          hue: profile.hue,
          initials: profile.initials,
          photoUrl: (profile as any).photoUrl || "",
        }),
      });
    } catch { /* silent */ }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const tabContent = () => {
    switch (activeTab) {
      case "basic": return <BasicTab profile={profile} setProfile={setProfileField} langs={langs} setLangs={setLangs} newLang={newLang} setNewLang={setNewLang} />;
      case "qualifications": return <QualificationsTab education={education} setEducation={setEducation} newEdu={newEdu} setNewEdu={setNewEdu} certs={certs} setCerts={setCerts} newCert={newCert} setNewCert={setNewCert} />;
      case "memberships": return <ListTab label="العضويات" icon={Shield} items={memberships} setItems={setMemberships} newItem={newMembership} setNewItem={setNewMembership} placeholder="اسم العضوية..." />;
      case "seo": return <SeoTab desc={seoDesc} setDesc={setSeoDesc} keywords={seoKeywords} setKeywords={setSeoKeywords} newKw={newKeyword} setNewKw={setNewKeyword} />;
      case "notifications": return <NotifTab email={notifEmail} setEmail={setNotifEmail} phone={notifPhone} setPhone={setNotifPhone} />;
      case "promotion": return <PromotionTab 
        promotionStatus={promotionStatus} 
        promotionPlan={promotionPlan}
        promoCity={promoCity}
        setPromoCity={setPromoCity}
        promoType={promoType}
        setPromoType={setPromoType}
        onRequestPromotion={() => {
          if (requestPromotion(promoCity, promoType)) {
            setPromotionStatus("pending");
            setPromotionPlan({ city: promoCity, type: promoType, startDate: new Date().toISOString() });
          }
        }}
        onCancelRequest={() => {
          if (cancelPromotionRequest()) {
            setPromotionStatus("none");
            setPromotionPlan(undefined);
          }
        }}
      />;
      case "subscription": return <SubscriptionTab
        subscription={subscription}
        plans={availablePlans}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
        billingCycle={billingCycle}
        setBillingCycle={setBillingCycle}
        onRequestPlan={(planId: string, cycle: "monthly" | "yearly") => {
          const result = requestPlan(planId, cycle);
          if (result.success) {
            setSubscription(getMySubscription());
            setAvailablePlans(getActivePlans());
          }
          return result;
        }}
        onCancelSubscription={() => {
          cancelSubscription();
          setSubscription(getMySubscription());
        }}
      />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">الملف الشخصي المتقدم</h1>
          <p className="mt-1 text-muted-foreground">تحكم بجميع تفاصيل ملفك المهني — من المعلومات الأساسية إلى تحسين محركات البحث</p>
        </div>
        <Button onClick={handleSave} variant="accent" className="gap-2 shadow-soft">
          {saved ? <><Check className="size-4" /> تم الحفظ</> : <><Save className="size-4" /> حفظ الكل</>}
        </Button>
      </div>

      {saved && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success flex items-center gap-2">
          <CheckCircle className="size-4" />
          تم حفظ جميع التغييرات بنجاح ✓
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === tab.key ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">{tabContent()}</div>
    </div>
  );
}

/* ══════════════════════════
   Reusable Components
   ══════════════════════════ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className={cn("relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors", on ? "bg-accent" : "bg-muted-foreground/30")} onClick={onToggle}>
        <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white transition-transform", on ? "translate-x-6" : "translate-x-1")} />
      </div>
    </div>
  );
}

/* ────── Basic Tab ────── */
function BasicTab({ profile, setProfile, langs, setLangs, newLang, setNewLang }: {
  profile: Lawyer; setProfile: <K extends keyof Lawyer>(f: K, v: Lawyer[K]) => void;
  langs: string[]; setLangs: (l: string[]) => void; newLang: string; setNewLang: (s: string) => void;
}) {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("حجم الصورة يجب أن يكون أقل من 2 ميغابايت"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setProfile("photoUrl" as any, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-soft">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="size-5 text-accent" /> المعلومات الأساسية</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="size-20 rounded-full object-cover border-2 border-accent" />
              ) : (
                <div className={cn("grid size-20 place-items-center rounded-full text-2xl font-bold text-white", profile.hue)}>
                  {profile.initials}
                </div>
              )}
              <label className="absolute -bottom-1 -left-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-md hover:bg-accent/90">
                <Camera className="size-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div>
              <p className="font-semibold text-sm">صورة الملف الشخصي</p>
              <p className="text-xs text-muted-foreground">JPG أو PNG — حد أقصى 2 ميغابايت</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="الاسم الكامل">
              <input type="text" value={profile.name} onChange={(e) => setProfile("name", e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" />
            </Field>
            <Field label="الاختصار (حرفين)">
              <input type="text" value={profile.initials} onChange={(e) => setProfile("initials", e.target.value.slice(0, 2))} maxLength={2}
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
            </Field>
          </div>
          <Field label="الرابط الإنجليزي (Slug)">
            <input type="text" value={profile.slug || ""} onChange={(e) => setProfile("slug", e.target.value.replace(/\s+/g, '-').toLowerCase())}
              placeholder="مثال: sara-nasser"
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
            <p className="mt-1 text-xs text-muted-foreground">يظهر في الرابط: /lawyers/{profile.slug || "sara-nasser"} — يمكنك تغييره من هنا</p>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="المدينة">
              <select value={profile.city} onChange={(e) => setProfile("city", e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent">
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="التخصص">
              <select value={profile.specialization} onChange={(e) => setProfile("specialization", e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent">
                {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-4">
            <Field label="سنوات الخبرة"><input type="number" min={0} max={70} value={profile.experience} onChange={(e) => setProfile("experience", Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" /></Field>
            <Field label="السعر ($)"><input type="number" min={0} value={profile.price} onChange={(e) => setProfile("price", Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" /></Field>
            <Field label="التقييم"><input type="number" min={0} max={5} step={0.1} value={profile.rating} onChange={(e) => setProfile("rating", Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" /></Field>
            <Field label="عدد المراجعات"><input type="number" min={0} value={profile.reviews} onChange={(e) => setProfile("reviews", Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" /></Field>
          </div>
          <Field label="نبذة تعريفية">
            <textarea value={profile.bio} onChange={(e) => setProfile("bio", e.target.value)} rows={4}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 resize-y" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="الجنس">
              <select value={profile.gender} onChange={(e) => setProfile("gender", e.target.value as "male" | "female")}
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent">
                <option value="male">ذكر</option><option value="female">أنثى</option>
              </select>
            </Field>
            <Field label="متصل الآن">
              <label className="flex items-center gap-3 pt-2 cursor-pointer">
                <div className={cn("relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors", profile.online ? "bg-success" : "bg-muted-foreground/30")}
                  onClick={() => setProfile("online", !profile.online)}>
                  <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white transition-transform", profile.online ? "translate-x-6" : "translate-x-1")} />
                </div>
                <span className="text-sm text-muted-foreground">{profile.online ? "متاح للتواصل" : "غير متاح"}</span>
              </label>
            </Field>
          </div>
          <Field label="اللغات">
            <div className="mb-2 flex flex-wrap gap-2">
              {langs.map((l) => (
                <span key={l} className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
                  {l}
                  <button onClick={() => setLangs(langs.filter((x) => x !== l))} className="text-accent/60 hover:text-accent"><X className="size-3.5" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newLang} onChange={(e) => setNewLang(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newLang.trim() && !langs.includes(newLang.trim())) { setLangs([...langs, newLang.trim()]); setNewLang(""); } } }}
                className="h-10 flex-1 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" placeholder="أضف لغة..." />
              <button onClick={() => { if (newLang.trim() && !langs.includes(newLang.trim())) { setLangs([...langs, newLang.trim()]); setNewLang(""); } }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent/90"><Plus className="size-4" /></button>
            </div>
          </Field>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-0 shadow-soft">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Phone className="size-5 text-accent" /> معلومات التواصل</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="رقم واتساب"><input type="text" dir="ltr" value={profile.whatsapp ?? ""} onChange={(e) => setProfile("whatsapp", e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" placeholder="+9647xxxxxxxxx" /></Field>
            <Field label="تيليغرام"><input type="text" dir="ltr" value={profile.telegram ?? ""} onChange={(e) => setProfile("telegram", e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" placeholder="@username" /></Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="فيسبوك"><input type="text" dir="ltr" value={profile.facebook ?? ""} onChange={(e) => setProfile("facebook", e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" placeholder="username" /></Field>
            <Field label="انستغرام"><input type="text" dir="ltr" value={profile.instagram ?? ""} onChange={(e) => setProfile("instagram", e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" placeholder="username" /></Field>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ────── Qualifications Tab (merged Education + Certifications) ────── */
function QualificationsTab({ education, setEducation, newEdu, setNewEdu, certs, setCerts, newCert, setNewCert }: {
  education: Education[]; setEducation: (e: Education[]) => void;
  newEdu: { degree: string; institution: string; year: number; description: string }; setNewEdu: React.Dispatch<React.SetStateAction<typeof newEdu>>;
  certs: Certification[]; setCerts: (c: Certification[]) => void;
  newCert: { title: string; issuer: string; year: number; expiryYear?: number }; setNewCert: React.Dispatch<React.SetStateAction<typeof newCert>>;
}) {
  const addEdu = () => {
    if (!newEdu.degree || !newEdu.institution) return;
    setEducation([...education, { id: `tmp-${Date.now()}`, ...newEdu }]);
    setNewEdu({ degree: "", institution: "", year: new Date().getFullYear(), description: "" });
  };
  const addCert = () => {
    if (!newCert.title || !newCert.issuer) return;
    setCerts([...certs, { id: `tmp-${Date.now()}`, ...newCert }]);
    setNewCert({ title: "", issuer: "", year: new Date().getFullYear(), expiryYear: undefined });
  };
  return (
    <div className="space-y-6">
      {/* Education Section */}
      <Card className="border-0 shadow-soft">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="size-5 text-accent" /> المؤهلات العلمية</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {education.length === 0 && <p className="text-sm text-muted-foreground py-4">لم تضف أي مؤهل علمي بعد</p>}
          {education.map((e) => (
            <div key={e.id} className="flex items-start justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div>
                <p className="font-semibold">{e.degree}</p>
                <p className="text-sm text-muted-foreground">{e.institution} · {e.year}</p>
                {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
              </div>
              <button onClick={() => setEducation(education.filter((x) => x.id !== e.id))} className="text-danger/60 hover:text-danger p-1"><X className="size-4" /></button>
            </div>
          ))}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-sm font-semibold">إضافة مؤهل جديد</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" placeholder="الشهادة" value={newEdu.degree} onChange={(e) => setNewEdu((p) => ({ ...p, degree: e.target.value }))}
                className="h-11 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
              <input type="text" placeholder="الجامعة" value={newEdu.institution} onChange={(e) => setNewEdu((p) => ({ ...p, institution: e.target.value }))}
                className="h-11 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="number" placeholder="سنة التخرج" value={newEdu.year || ""} onChange={(e) => setNewEdu((p) => ({ ...p, year: Number(e.target.value) }))}
                className="h-11 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
              <input type="text" placeholder="وصف (اختياري)" value={newEdu.description} onChange={(e) => setNewEdu((p) => ({ ...p, description: e.target.value }))}
                className="h-11 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
            </div>
            <Button onClick={addEdu} variant="accent" size="sm" className="gap-2"><Plus className="size-4" /> إضافة</Button>
          </div>
        </CardContent>
      </Card>

      {/* Certifications Section */}
      <Card className="border-0 shadow-soft">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Award className="size-5 text-accent" /> الشهادات المهنية</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {certs.length === 0 && <p className="text-sm text-muted-foreground py-4">لم تضف أي شهادة بعد</p>}
          {certs.map((c) => (
            <div key={c.id} className="flex items-start justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c.issuer} · {c.year}{c.expiryYear ? ` - ${c.expiryYear}` : ""}</p>
              </div>
              <button onClick={() => setCerts(certs.filter((x) => x.id !== c.id))} className="text-danger/60 hover:text-danger p-1"><X className="size-4" /></button>
            </div>
          ))}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-sm font-semibold">إضافة شهادة جديدة</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" placeholder="اسم الشهادة" value={newCert.title} onChange={(e) => setNewCert((p) => ({ ...p, title: e.target.value }))}
                className="h-11 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
              <input type="text" placeholder="الجهة المانحة" value={newCert.issuer} onChange={(e) => setNewCert((p) => ({ ...p, issuer: e.target.value }))}
                className="h-11 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="number" placeholder="سنة الحصول" value={newCert.year || ""} onChange={(e) => setNewCert((p) => ({ ...p, year: Number(e.target.value) }))}
                className="h-11 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
              <input type="number" placeholder="سنة الانتهاء (اختياري)" value={newCert.expiryYear || ""} onChange={(e) => setNewCert((p) => ({ ...p, expiryYear: Number(e.target.value) }))}
                className="h-11 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
            </div>
            <Button onClick={addCert} variant="accent" size="sm" className="gap-2"><Plus className="size-4" /> إضافة</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ────── Generic List Tab ────── */
function ListTab({ label, icon: Icon, items, setItems, newItem, setNewItem, placeholder }: {
  label: string; icon: React.ComponentType<{ className?: string }>;
  items: string[]; setItems: (i: string[]) => void;
  newItem: string; setNewItem: (s: string) => void; placeholder: string;
}) {
  const add = () => { if (newItem.trim()) { setItems([...items, newItem.trim()]); setNewItem(""); } };
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Icon className="size-5 text-accent" /> {label}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 && <p className="text-sm text-muted-foreground py-4">لم تضف أي {label} بعد</p>}
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
              {item}
              <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-accent/60 hover:text-accent"><X className="size-3.5" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            className="h-10 flex-1 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" placeholder={placeholder} />
          <button onClick={add} aria-label="إضافة عنصر" className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent/90"><Plus className="size-4" /></button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ────── SEO Tab ────── */
function SeoTab({ desc, setDesc, keywords, setKeywords, newKw, setNewKw }: {
  desc: string; setDesc: (s: string) => void;
  keywords: string[]; setKeywords: (k: string[]) => void;
  newKw: string; setNewKw: (s: string) => void;
}) {
  const addKw = () => { if (newKw.trim()) { setKeywords([...keywords, newKw.trim()]); setNewKw(""); } };
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Search className="size-5 text-accent" /> تحسين محركات البحث (SEO)</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <Field label="وصف الصفحة (Meta Description)">
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={300}
            className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-accent resize-y" />
          <p className="mt-1 text-xs text-muted-foreground">{desc.length}/300 حرف</p>
        </Field>
        <Field label="الكلمات المفتاحية (Keywords)">
          <div className="mb-2 flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
                {kw}
                <button onClick={() => setKeywords(keywords.filter((_, j) => j !== i))} className="text-accent/60 hover:text-accent"><X className="size-3.5" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newKw} onChange={(e) => setNewKw(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKw(); } }}
              className="h-10 flex-1 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" placeholder="أضف كلمة مفتاحية..." />
            <button onClick={addKw} aria-label="إضافة كلمة مفتاحية" className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent/90"><Plus className="size-4" /></button>
          </div>
        </Field>
      </CardContent>
    </Card>
  );
}

/* ────── Notifications Tab ────── */
function NotifTab({ email, setEmail, phone, setPhone }: { email: boolean; setEmail: (b: boolean) => void; phone: boolean; setPhone: (b: boolean) => void }) {
  return (
    <Card className="border-0 shadow-soft">
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Bell className="size-5 text-accent" /> إعدادات الإشعارات</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="إشعارات البريد الإلكتروني" desc="تلقي إشعارات عند وصول رسائل جديدة أو حجوزات" on={email} onToggle={() => setEmail(!email)} />
        <Toggle label="إشعارات الجوال" desc="تلقي إشعارات عبر رسائل نصية" on={phone} onToggle={() => setPhone(!phone)} />
      </CardContent>
    </Card>
  );
}

/* ────── Promotion Tab ────── */
function PromotionTab({ 
  promotionStatus, 
  promotionPlan, 
  promoCity, 
  setPromoCity, 
  promoType, 
  setPromoType,
  onRequestPromotion,
  onCancelRequest,
}: {
  promotionStatus: string;
  promotionPlan: Lawyer["promotionPlan"];
  promoCity: string;
  setPromoCity: (city: string) => void;
  promoType: "monthly" | "yearly";
  setPromoType: (type: "monthly" | "yearly") => void;
  onRequestPromotion: () => void;
  onCancelRequest: () => void;
}) {
  const isPending = promotionStatus === "pending";
  const isApproved = promotionStatus === "approved";
  const isRejected = promotionStatus === "rejected";

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="size-5 text-accent" /> الترويج والظهور في المحامين المميزين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Current Status */}
          {isPending && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
              <Clock className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-700 dark:text-amber-400">طلب الترويج قيد المراجعة</p>
                <p className="text-sm text-muted-foreground mt-1">
                  تم إرسال طلبك للموافقة عليه من قبل الإدارة. سيتم إشعارك عند الموافقة.
                </p>
                {promotionPlan && (
                  <p className="text-sm text-muted-foreground mt-1">
                    المحافظة: {promotionPlan.city} · نوع الخطة: {promotionPlan.type === "monthly" ? "شهرية" : "سنوية"}
                  </p>
                )}
                <Button onClick={onCancelRequest} variant="outline" size="sm" className="mt-3 gap-2">
                  <X className="size-4" /> إلغاء الطلب
                </Button>
              </div>
            </div>
          )}

          {isApproved && promotionPlan && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-start gap-3">
              <CheckCircle className="size-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">أنت الآن في المحامين المميزين!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  المحافظة: {promotionPlan.city} · نوع الخطة: {promotionPlan.type === "monthly" ? "شهرية" : "سنوية"}
                </p>
                {promotionPlan.expiryDate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ينتهي في: {new Date(promotionPlan.expiryDate).toLocaleDateString("en-US")}
                  </p>
                )}
              </div>
            </div>
          )}

          {isRejected && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
              <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400">تم رفض طلب الترويج</p>
                <p className="text-sm text-muted-foreground mt-1">
                  لم يتم قبول طلب الترويج. يمكنك المحاولة مرة أخرى بخطة مختلفة.
                </p>
              </div>
            </div>
          )}

          {/* Request Form */}
          {!isPending && !isApproved && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                قم بطلب الترويج لظهورك في قسم المحامين المميزين في الصفحة الرئيسية.
              </p>
              
              <Field label="المحافظة التي تريد الترويج فيها">
                <select 
                  value={promoCity} 
                  onChange={(e) => setPromoCity(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent"
                >
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="نوع الخطة">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPromoType("monthly")}
                    className={cn(
                      "rounded-xl border-2 p-4 text-center transition-all",
                      promoType === "monthly" ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                    )}
                  >
                    <Calendar className="mx-auto mb-2 size-6 text-accent" />
                    <p className="font-semibold">شهرية</p>
                    <p className="text-xs text-muted-foreground">تجديد شهري</p>
                  </button>
                  <button
                    onClick={() => setPromoType("yearly")}
                    className={cn(
                      "rounded-xl border-2 p-4 text-center transition-all",
                      promoType === "yearly" ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                    )}
                  >
                    <Calendar className="mx-auto mb-2 size-6 text-accent" />
                    <p className="font-semibold">سنوية</p>
                    <p className="text-xs text-muted-foreground">توفير 20%</p>
                  </button>
                </div>
              </Field>

              <Button onClick={onRequestPromotion} variant="accent" className="w-full gap-2">
                <Megaphone className="size-4" /> إرسال طلب الترويج
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ────── Subscription Tab ────── */
function SubscriptionTab({
  subscription,
  plans,
  selectedPlanId,
  setSelectedPlanId,
  billingCycle,
  setBillingCycle,
  onRequestPlan,
  onCancelSubscription,
}: {
  subscription: any;
  plans: any[];
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  billingCycle: "monthly" | "yearly";
  setBillingCycle: (c: "monthly" | "yearly") => void;
  onRequestPlan: (planId: string, cycle: "monthly" | "yearly") => { success: boolean; error?: string };
  onCancelSubscription: () => void;
}) {
  const formatPrice = (price: number) =>
    price === 0 ? "مجاني" : `${price.toLocaleString("en-US")} د.ع`;

  const [msg, setMsg] = useState("");

  const handleRequest = () => {
    if (!selectedPlanId) { setMsg("اختر خطة أولاً"); return; }
    const result = onRequestPlan(selectedPlanId, billingCycle);
    if (result.success) {
      setMsg("تم إرسال طلبك بنجاح — في انتظار موافقة الإدارة");
    } else {
      setMsg(result.error ?? "حدث خطأ");
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      pending: { label: "قيد المراجعة", cls: "bg-yellow-100 text-yellow-800" },
      active: { label: "نشط", cls: "bg-green-100 text-green-800" },
    };
    const b = map[s] ?? { label: s, cls: "bg-gray-100" };
    return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", b.cls)}>{b.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Current subscription */}
      {subscription && (
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="size-5 text-accent" /> اشتراكي الحالي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">{subscription.planName}</span>
              {statusBadge(subscription.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              الدورة: {subscription.billingCycle === "yearly" ? "سنوية" : "شهرية"} —
              السعر: {formatPrice(subscription.price)}
            </p>
            {subscription.expiryDate && (
              <p className="text-sm text-muted-foreground">
                ينتهي في: {new Date(subscription.expiryDate).toLocaleDateString("en-US")}
              </p>
            )}
            {subscription.status === "active" && (
              <Button size="sm" variant="outline" className="text-destructive" onClick={onCancelSubscription}>
                إلغاء الاشتراك
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available plans */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="size-5 text-accent" /> خطط الاشتراك
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={cn(
                  "rounded-xl border-2 p-4 text-right transition-all",
                  selectedPlanId === plan.id
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                )}
              >
                <p className="font-bold text-lg">{plan.nameAr}</p>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                <p className="mt-2 font-bold text-accent">
                  {formatPrice(billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice)}
                  <span className="text-xs text-muted-foreground font-normal">
                    /{billingCycle === "yearly" ? "سنوياً" : "شهرياً"}
                  </span>
                </p>
                <div className="mt-3 space-y-1">
                  {plan.features?.map((f: any) => (
                    <p key={f.key} className={cn("text-xs flex items-center gap-1", f.enabled ? "text-green-600" : "text-muted-foreground line-through")}>
                      {f.enabled ? "✓" : "✗"} {f.label}
                    </p>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "rounded-xl border-2 p-3 text-center transition-all",
                billingCycle === "monthly" ? "border-accent bg-accent/10" : "border-border"
              )}
            >
              <p className="font-semibold">شهري</p>
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "rounded-xl border-2 p-3 text-center transition-all",
                billingCycle === "yearly" ? "border-accent bg-accent/10" : "border-border"
              )}
            >
              <p className="font-semibold">سنوي</p>
              <p className="text-xs text-green-600">توفير 15%</p>
            </button>
          </div>

          {msg && (
            <p className={cn("text-sm font-medium", msg.includes("نجاح") ? "text-green-600" : "text-destructive")}>{msg}</p>
          )}

          <Button onClick={handleRequest} variant="accent" className="w-full gap-2" disabled={!!subscription && subscription.status === "active"}>
            <CreditCard className="size-4" />
            {subscription?.status === "active" ? "أنت مشترك بالفعل" : "إرسال طلب الاشتراك"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
