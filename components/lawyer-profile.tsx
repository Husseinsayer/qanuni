"use client";

import * as React from "react";
import {
  BadgeCheck,
  MapPin,
  Briefcase,
  Star,
  Globe,
  Clock,
  ArrowLeft,
  Heart,
  FileText,
  Award,
  Send,
  ThumbsUp,
  DollarSign,
  CheckCircle,
  GraduationCap,
  Users,
  Trophy,
  BookOpen,
  ScrollText,
  User,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { articles, type Lawyer } from "@/lib/data";
import { resolveLawyer, getExtByLawyerId, type LawyerService, type WorkingHours, type Review as ExtReview, type Education, type Certification, type PortfolioItem } from "@/lib/lawyer-profiles";
import { useSiteData } from "@/lib/use-site-data";
import { cn, toArabicDigits } from "@/lib/utils";
import { AdBanner } from "@/components/ad-banner";
import { useSession } from "next-auth/react";

// LocalStorage-based reviews
type LocalReview = { name: string; text: string; rating: number; date?: string };
function getStoredReviews(lawyerId: string) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`reviews_${lawyerId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function addStoredReview(lawyerId: string, review: { name: string; text: string; rating: number }) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredReviews(lawyerId);
    if (existing.length >= 10) return; // Rate limit: max 10 reviews per lawyer
    existing.unshift({ ...review, date: new Date().toISOString() });
    localStorage.setItem(`reviews_${lawyerId}`, JSON.stringify(existing));
  } catch { /* silent */ }
}

// LocalStorage-based favorites
function isFavorited(lawyerId: string) {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("favorites");
    const favs: string[] = raw ? JSON.parse(raw) : [];
    return favs.includes(lawyerId);
  } catch { return false; }
}
function toggleFavorite(lawyerId: string) {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("favorites");
    const favs: string[] = raw ? JSON.parse(raw) : [];
    if (favs.includes(lawyerId)) {
      localStorage.setItem("favorites", JSON.stringify(favs.filter((id) => id !== lawyerId)));
      return false;
    } else {
      favs.push(lawyerId);
      localStorage.setItem("favorites", JSON.stringify(favs));
      return true;
    }
  } catch { return false; }
}

const socialIcons = [
  { key: "whatsapp", label: "واتساب", color: "bg-green-500 hover:bg-green-600", href: (v: string) => `https://wa.me/${v.replace(/[^0-9]/g, "")}`, icon: "💬" },
  { key: "telegram", label: "تلغرام", color: "bg-sky-500 hover:bg-sky-600", href: (v: string) => `https://t.me/${v.replace("@", "")}`, icon: "✈️" },
  { key: "facebook", label: "فيسبوك", color: "bg-blue-600 hover:bg-blue-700", href: (v: string) => `https://facebook.com/${v}`, icon: "📘" },
  { key: "instagram", label: "انستغرام", color: "bg-gradient-to-br from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500", href: (v: string) => `https://instagram.com/${v}`, icon: "📷" },
];

export function LawyerProfile({ id }: { id: string }) {
  const { data: session } = useSession();
  const [lawyer, setLawyer] = React.useState<Lawyer | null>(null);
  const [services, setServices] = React.useState<LawyerService[]>([]);
  const [workingHours, setWorkingHours] = React.useState<WorkingHours | null>(null);
  const [, setExtReviews] = React.useState<ExtReview[]>([]);
  const [education, setEducation] = React.useState<Education[]>([]);
  const [certifications, setCertifications] = React.useState<Certification[]>([]);
  const [memberships, setMemberships] = React.useState<string[]>([]);
  const [awards, setAwards] = React.useState<string[]>([]);
  const [portfolio, setPortfolio] = React.useState<PortfolioItem[]>([]);
  const [saved, setSaved] = React.useState(false);
  const [reviewName, setReviewName] = React.useState("");
  const [reviewText, setReviewText] = React.useState("");
  const [reviewRating, setReviewRating] = React.useState(5);
  const [showReviewForm, setShowReviewForm] = React.useState(false);

  // Auto-fill name from session
  React.useEffect(() => {
    if (session?.user?.name && !reviewName) {
      setReviewName(session.user.name);
    }
  }, [session?.user?.name]);

  const [loadError, setLoadError] = React.useState(false);

  const { lawyers: apiLawyers, isLoading: siteLoading } = useSiteData();

  React.useEffect(() => {
    const found = resolveLawyer(id);
    let matched: Lawyer | null = null;

    if (found) {
      matched = found;
    } else {
      // Fallback: check localStorage profiles directly by ID
      try {
        const raw = localStorage.getItem("lawyer_profiles");
        if (raw) {
          const profiles = JSON.parse(raw) as Lawyer[];
          const match = profiles.find((l) => l.id === id);
          if (match) matched = match;
        }
      } catch { /* silent */ }

      // Fallback: check API-fetched lawyers from useSiteData by slug
      if (!matched) {
        const apiMatch = apiLawyers.find((l) => l.slug === id);
        if (apiMatch) matched = apiMatch;
      }
    }

    // Fallback: fetch from database API
    if (!matched && !siteLoading) {
      fetch(`/api/lawyer/${id}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data && data.id) {
            const dbMapped: Lawyer = {
              id: data.id,
              name: data.name || "",
              slug: data.slug || "",
              city: data.city || "",
              specialization: data.specialization || "",
              experience: data.experience || 0,
              rating: data.rating || 0,
              reviews: data.reviewCount || 0,
              verified: data.verified || false,
              price: data.price || 0,
              online: data.online || false,
              gender: (data.gender as "male" | "female") || "male",
              languages: (() => { try { return JSON.parse(data.languages || "[]"); } catch { return ["العربية"]; } })(),
              bio: data.bio || "",
              initials: data.initials || "",
              hue: data.hue || "from-blue-600 to-indigo-700",
              whatsapp: data.whatsapp || "",
              telegram: data.telegram || "",
              facebook: data.facebook || "",
              instagram: data.instagram || "",
              photoUrl: data.photoUrl || "",
              points: data.points || 0,
              email: data.user?.email || "",
              userId: data.userId || data.user?.id || "",
            };
            setLawyer(dbMapped);
            setSaved(isFavorited(dbMapped.id));
          } else {
            setLoadError(true);
          }
        })
        .catch(() => setLoadError(true));
      return;
    }

    if (matched) {
      setLawyer(matched);
      setSaved(isFavorited(matched.id));

      // Load extension data (services, education, etc.)
      const ext = getExtByLawyerId(matched.id);
      if (ext) {
        setServices(ext.services);
        setWorkingHours(ext.workingHours);
        setExtReviews(ext.reviews);
        setEducation(ext.education);
        setCertifications(ext.certifications);
        setMemberships(ext.memberships);
        setAwards(ext.awards);
        setPortfolio(ext.portfolio);
      }
    } else if (!siteLoading && apiLawyers.length >= 0) {
      setLoadError(true);
    }
  }, [id, apiLawyers, siteLoading]);

  if (loadError) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-semibold text-muted-foreground">المحامي غير موجود</p>
        <p className="mt-2 text-sm text-muted-foreground">لم يتم العثور على ملف هذا المحامي</p>
      </div>
    );
  }

  if (!lawyer) return <div className="container py-20 text-center"><p className="text-lg font-semibold">جاري تحميل البيانات...</p></div>;

  // Plan feature check for THIS lawyer's plan (looked up from their profile's planId)
  const lawyerPlanFeatures = (() => {
    try {
      const raw = localStorage.getItem("lawyer_plan_subscriptions");
      if (!raw) return null;
      const subs = JSON.parse(raw) as any[];
      const active = subs.find((s: any) => s.lawyerId === id && s.status === "active");
      if (!active) return null;
      const plansRaw = localStorage.getItem("lawyer_plans");
      if (!plansRaw) return null;
      const plans = JSON.parse(plansRaw) as any[];
      const plan = plans.find((p: any) => p.id === active.planId);
      return plan?.features ?? null;
    } catch { return null; }
  })();
  const planHas = (key: string) => lawyerPlanFeatures?.find((f: any) => f.key === key)?.enabled ?? false;

  const lawyerArticles = articles.filter((a) => a.lawyerId === id);
  const articleCount = lawyerArticles.length;
  const hasBadge = articleCount >= 3;

  // Reward tier based on points
  const points = (lawyer as any).points || 0;
  const rewardTier = points >= 200 ? { nameAr: "خبير قانوني", color: "#10B981" }
    : points >= 100 ? { nameAr: "ناشر متميز", color: "#EF4444" }
    : points >= 60 ? { nameAr: "ناشر محترف", color: "#F59E0B" }
    : points >= 30 ? { nameAr: "ناشر نشط", color: "#8B5CF6" }
    : points >= 10 ? { nameAr: "ناشر", color: "#3B82F6" }
    : null;

  const storedReviews = getStoredReviews(id);
  const defaultReviews = [
    "تجربة تعامل احترافية ومريحة مع هذا المحامي، أنصح به.",
    "شرح واضح ومتابعة دقيقة حتى انتهاء القضية.",
  ];
  const reviews = storedReviews.length > 0 ? storedReviews : defaultReviews.map((t) => ({ name: "مستخدم", text: t, rating: 5, date: new Date().toISOString() }));

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) return;
    addStoredReview(id, { name: reviewName, text: reviewText, rating: reviewRating });
    setReviewName("");
    setReviewText("");
    setShowReviewForm(false);
  };

  return (
    <div className="container pb-20">
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-6 bg-gradient-to-l from-secondary to-accent p-8 text-white md:flex-row md:items-center">
          {lawyer.photoUrl ? (
            <img
              src={lawyer.photoUrl}
              alt={lawyer.name}
              className="size-24 rounded-3xl object-cover shadow-premium"
            />
          ) : (
            <span
              className={cn(
                "grid size-24 place-items-center rounded-3xl bg-gradient-to-br text-3xl font-extrabold text-white shadow-premium",
                lawyer.hue
              )}
            >
              {lawyer.initials}
            </span>
          )}
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <h2 className="text-2xl font-extrabold md:text-3xl">{lawyer.name}</h2>
              {lawyer.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-[#1F2937]">
                  <BadgeCheck className="size-3.5" /> موثّق
                </span>
              )}
              {hasBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  <Award className="size-3.5" /> كاتب مميز
                </span>
              )}
              {rewardTier && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: rewardTier.color }}
                >
                  <Award className="size-3.5" /> {rewardTier.nameAr}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-white/85 md:justify-start">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" /> {lawyer.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-4" /> {lawyer.specialization}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" /> {toArabicDigits(lawyer.experience)} سنة خبرة
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-gold text-gold" /> {toArabicDigits(lawyer.rating.toFixed(1))} ({toArabicDigits(lawyer.reviews)} تقييم)
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="size-4" /> {articleCount} مقال
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="size-4" /> {lawyer.languages.join("، ")}
              </span>
              {lawyer.online && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse" /> متصل
                </span>
              )}
            </div>
          </div>
          <div className="ml-0 flex gap-2 md:mr-auto">
            <button
              onClick={() => setSaved(toggleFavorite(lawyer.id))}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                saved ? "bg-gold/15 text-gold" : "border border-white/30 text-white hover:bg-white/10"
              )}
            >
              <Heart className={cn("size-4", saved && "fill-gold")} />
              {saved ? "مُضاف" : "أضف للمفضلة"}
            </button>
          </div>
        </div>
      </Card>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Bio */}
          <Card className="p-6">
            <h3 className="mb-3 text-lg font-bold">نبذة تعريفية</h3>
            <p className="leading-relaxed text-muted-foreground">{lawyer.bio}</p>
          </Card>

          {/* Education */}
          {education.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-5 text-lg font-bold flex items-center gap-2"><GraduationCap className="size-5 text-accent" /> المؤهلات العلمية</h3>
              <div className="relative space-y-0">
                <div className="absolute right-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-accent to-accent/20" />
                {education.map((e) => (
                  <div key={e.id} className="relative flex gap-4 pb-5 pl-4 last:pb-0">
                    <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-sm">
                      <GraduationCap className="size-3.5" />
                    </div>
                    <div className="flex-1 rounded-xl border border-border bg-muted/20 p-4 transition hover:bg-muted/40">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground">{e.degree}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{e.institution}</p>
                          {e.description && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/80">{e.description}</p>}
                        </div>
                        <span className="shrink-0 rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">{toArabicDigits(e.year)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-5 text-lg font-bold flex items-center gap-2"><ScrollText className="size-5 text-accent" /> الشهادات المهنية</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {certifications.map((c) => (
                  <div key={c.id} className="group relative overflow-hidden rounded-xl border border-border bg-muted/20 p-4 transition hover:border-accent/30 hover:bg-muted/40">
                    <div className="absolute -left-2 -top-2 size-16 rounded-full bg-accent/5" />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground">{c.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{c.issuer}</p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">{toArabicDigits(c.year)}</span>
                      </div>
                      {c.expiryYear && (
                        <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                          ينتهي: {toArabicDigits(c.expiryYear)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Memberships & Awards */}
          {(memberships.length > 0 || awards.length > 0) && (
            <Card className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {memberships.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-bold flex items-center gap-2"><Users className="size-5 text-accent" /> العضويات</h3>
                    <ul className="space-y-2">
                      {memberships.map((m, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="size-3.5 text-accent shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {awards.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-bold flex items-center gap-2"><Trophy className="size-5 text-accent" /> الجوائز</h3>
                    <ul className="space-y-2">
                      {awards.map((a, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Award className="size-3.5 text-gold shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Services */}
          {services.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-bold flex items-center gap-2"><DollarSign className="size-5 text-accent" /> الخدمات والأسعار</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((s) => (
                  <div key={s.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-accent/10 px-2.5 py-1 text-sm font-bold text-accent">{s.price}$</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3" /> {s.duration}
                      {s.online && (
                        <span className="flex items-center gap-1 text-success"><CheckCircle className="size-3" /> أونلاين</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-bold flex items-center gap-2"><BookOpen className="size-5 text-accent" /> الأعمال والقضايا السابقة</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {portfolio.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold">{p.title}</p>
                      <span className="shrink-0 rounded-lg bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">{toArabicDigits(p.year)}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{p.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-md bg-muted/60 px-2 py-0.5 font-medium">{p.category}</span>
                      <span className={cn(
                        "rounded-md px-2 py-0.5 font-medium",
                        p.outcome === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                      )}>
                        {p.outcome === "success" ? "ناجح" : "قيد الإجراء"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Working Hours */}
          {workingHours && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-bold flex items-center gap-2"><Clock className="size-5 text-accent" /> مواعيد العمل</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(workingHours).map(([day, val]) => {
                  if (!val || !val.enabled) return null;
                  return (
                    <div key={day} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
                      <span className="text-sm font-semibold">{day}</span>
                      <span className="text-xs text-muted-foreground" dir="ltr">{val.from} - {val.to}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Social buttons */}
          {(lawyer.whatsapp || lawyer.telegram || lawyer.facebook || lawyer.instagram) && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-bold">تواصل عبر</h3>
              <div className="flex flex-wrap gap-3">
                {socialIcons.map((s) => {
                  const val = lawyer[s.key as keyof Lawyer] as string | undefined;
                  if (!val) return null;
                  return (
                    <a
                      key={s.key}
                      href={s.href(val)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition shadow-soft",
                        s.color
                      )}
                    >
                      <span>{s.icon}</span> {s.label}
                    </a>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Articles by this lawyer */}
          {lawyerArticles.length > 0 && planHas("articles") && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-bold">مقالات المحامي</h3>
              <div className="space-y-3">
                {lawyerArticles.map((a) => (
                  <a
                    key={a.id}
                    href={`/blog/${a.id}`}
                    className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-accent hover:bg-accent/5"
                  >
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{a.title}</p>
                      <div className="mt-1 flex items-center justify-end gap-3 text-xs text-muted-foreground">
                        <span>{a.date}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" /> {toArabicDigits(a.views)} مشاهدة
                        </span>
                      </div>
                    </div>
                    <ArrowLeft className="size-4 text-accent" />
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Reviews */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">آراء العملاء</h3>
              <button
                onClick={() => setShowReviewForm((s) => !s)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent/20"
              >
                <ThumbsUp className="size-4" /> أضف تقييمك
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="mb-4 rounded-xl border border-border p-4">
                <div className="mb-3">
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">اسمك</label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 h-10">
                    <User className="size-4 text-muted-foreground" />
                    <input
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="اسمك"
                      className="flex-1 bg-transparent text-sm outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">تقييمك</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="اكتب تجربتك مع هذا المحامي..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-accent"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">عدد النجوم</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRating(n)}
                        className={cn("transition", n <= reviewRating ? "text-gold" : "text-muted-foreground/30")}
                      >
                        <Star className={cn("size-6", n <= reviewRating && "fill-gold")} />
                      </button>
                    ))}
                    <span className="mr-2 text-sm text-muted-foreground">({reviewRating} من 5)</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
                >
                  <Send className="size-4" /> إرسال التقييم
                </button>
              </form>
            )}

            <div className="space-y-3">
              {reviews.map((r: LocalReview, i: number) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gold">
                      {Array.from({ length: r.rating ?? 5 }).map((_, s) => (
                        <Star key={s} className="size-3.5 fill-gold" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-foreground">{r.name}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
          {/* Points & Plan Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-l from-primary to-accent p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="size-5" />
                  <span className="text-sm font-bold">النقاط والخطة</span>
                </div>
                {rewardTier && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">{rewardTier.nameAr}</span>
                )}
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-extrabold">{points}</span>
                <span className="mb-1 text-sm text-white/80">نقطة</span>
              </div>
              {/* Progress to next tier */}
              {(() => {
                const tiers = [0, 10, 30, 60, 100, 200];
                const tierNames = ["مبتدئ", "ناشر", "ناشر نشط", "ناشر محترف", "ناشر متميز", "خبير قانوني"];
                const currentIdx = tiers.findLastIndex((t) => points >= t);
                const nextIdx = Math.min(currentIdx + 1, tiers.length - 1);
                if (currentIdx >= tiers.length - 1) return null;
                const progress = ((points - tiers[currentIdx]) / (tiers[nextIdx] - tiers[currentIdx])) * 100;
                return (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>التالي: {tierNames[nextIdx]}</span>
                      <span>{tiers[nextIdx] - points} نقطة متبقية</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-lg font-bold">{points}</p>
                  <p className="text-[10px] text-muted-foreground">النقاط</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-lg font-bold">{articleCount}</p>
                  <p className="text-[10px] text-muted-foreground">المقالات</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-lg font-bold">{lawyer.reviews}</p>
                  <p className="text-[10px] text-muted-foreground">التقييمات</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Ad: الشريط الجانبي للمحامي */}
          <AdBanner placementKey="lawyer-sidebar" />
        </div>
      </div>

    </div>
  );
}
