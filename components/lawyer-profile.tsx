"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  Briefcase,
  Star,
  CalendarCheck,
  MessageSquare,
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
} from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { lawyers, articles, type Lawyer } from "@/lib/data";
import { resolveLawyer, getExtByLawyerId, type LawyerService, type WorkingHours, type Review as ExtReview, type Education, type Certification, type PortfolioItem } from "@/lib/lawyer-profiles";
import { getMyPlanFeatures, hasFeature } from "@/lib/lawyer-plans";
import { cn, toArabicDigits } from "@/lib/utils";
import { AdBanner } from "@/components/ad-banner";

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

// LocalStorage-based saved articles
function isArticleSaved(articleId: string) {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("saved_articles");
    const saved: string[] = raw ? JSON.parse(raw) : [];
    return saved.includes(articleId);
  } catch { return false; }
}
function toggleSaveArticle(articleId: string) {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("saved_articles");
    const saved: string[] = raw ? JSON.parse(raw) : [];
    if (saved.includes(articleId)) {
      localStorage.setItem("saved_articles", JSON.stringify(saved.filter((id) => id !== articleId)));
      return false;
    } else {
      saved.push(articleId);
      localStorage.setItem("saved_articles", JSON.stringify(saved));
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
  const [lawyer, setLawyer] = React.useState<Lawyer | null>(null);
  const [services, setServices] = React.useState<LawyerService[]>([]);
  const [workingHours, setWorkingHours] = React.useState<WorkingHours | null>(null);
  const [extReviews, setExtReviews] = React.useState<ExtReview[]>([]);
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

  const [loadError, setLoadError] = React.useState(false);

  React.useEffect(() => {
    const found = resolveLawyer(id);
    if (found) {
      setLawyer(found);
      setSaved(isFavorited(found.id));
    } else {
      // Fallback: check localStorage profiles directly by ID
      try {
        const raw = localStorage.getItem("lawyer_profiles");
        if (raw) {
          const profiles = JSON.parse(raw) as Lawyer[];
          const match = profiles.find((l) => l.id === id);
          if (match) {
            setLawyer(match);
            setSaved(isFavorited(match.id));
          } else {
            setLoadError(true);
          }
        } else {
          setLoadError(true);
        }
      } catch {
        setLoadError(true);
      }
    }
    const ext = getExtByLawyerId(id);
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
  }, [id]);

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
          <span
            className={cn(
              "grid size-24 place-items-center rounded-3xl bg-gradient-to-br text-3xl font-extrabold text-white shadow-premium",
              lawyer.hue
            )}
          >
            {lawyer.initials}
          </span>
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <h2 className="text-2xl font-extrabold md:text-3xl">{lawyer.name}</h2>
              {lawyer.verified && planHas("verification") && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-[#1F2937]">
                  <BadgeCheck className="size-3.5" /> موثّق
                </span>
              )}
              {hasBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  <Award className="size-3.5" /> كاتب مميز
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
            <a
              href="#booking"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-secondary transition hover:bg-gold"
            >
              <CalendarCheck className="size-4" /> احجز استشارة
            </a>
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
              <h3 className="mb-4 text-lg font-bold flex items-center gap-2"><GraduationCap className="size-5 text-accent" /> المؤهلات العلمية</h3>
              <div className="space-y-3">
                {education.map((e) => (
                  <div key={e.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{e.degree}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{e.institution}</p>
                        {e.description && <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>}
                      </div>
                      <span className="shrink-0 rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">{toArabicDigits(e.year)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-bold flex items-center gap-2"><ScrollText className="size-5 text-accent" /> الشهادات المهنية</h3>
              <div className="space-y-3">
                {certifications.map((c) => (
                  <div key={c.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{c.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{c.issuer}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">{toArabicDigits(c.year)}</span>
                    </div>
                    {c.expiryYear && (
                      <p className="mt-1 text-xs text-muted-foreground">ينتهي في: {toArabicDigits(c.expiryYear)}</p>
                    )}
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
                <input
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="اسمك"
                  className="mb-3 h-10 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent"
                  required
                />
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="تقييمك وتجربتك مع هذا المحامي..."
                  rows={3}
                  className="mb-3 w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-accent"
                  required
                />
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">التقييم:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      className={cn("transition", n <= reviewRating ? "text-gold" : "text-muted-foreground/30")}
                    >
                      <Star className={cn("size-5", n <= reviewRating && "fill-gold")} />
                    </button>
                  ))}
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
        <div id="booking" className="lg:sticky lg:top-24 lg:self-start space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold">حجز استشارة</h3>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">سعر الاستشارة</span>
              <span className="font-bold text-accent">{toArabicDigits(lawyer.price)} ألف د.ع</span>
            </div>
            <a
              href="/booking"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
            >
              <CalendarCheck className="size-4" /> احجز موعداً
            </a>
            <a
              href={lawyer.whatsapp ? `https://wa.me/${lawyer.whatsapp.replace(/[^0-9]/g, '')}` : '/contact'}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:border-accent hover:text-accent",
                !planHas("messages") && "pointer-events-none opacity-40"
              )}
            >
              <MessageSquare className="size-4" /> {planHas("messages") ? "مراسلة مباشرة" : "مراسلة (خطة مطلوبة)"}
            </a>
            <button
              onClick={() => setSaved(toggleFavorite(lawyer.id))}
              className={cn(
                "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition",
                saved ? "border-gold text-gold" : "border-border hover:border-gold hover:text-gold"
              )}
            >
              <Heart className={cn("size-4", saved && "fill-gold")} />
              {saved ? "مضاف إلى المفضلة" : "أضف إلى المفضلة"}
            </button>
          </Card>

          {/* Ad: Skyscraper في Sidebar */}
          <AdBanner size="skyscraper" placementKey="sidebar-top" />
        </div>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <span className="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent">
        <Icon className="size-4" />
      </span>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Eye({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
