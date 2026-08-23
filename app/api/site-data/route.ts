import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { sampleArticles as defaultSampleArticles } from "@/lib/data";
import { getSiteDataCache, setSiteDataCache, isSiteDataCacheValid, invalidateSiteDataCache } from "@/lib/site-data-cache";

export const dynamic = "force-dynamic";

/** Map the unified store's sampleArticles into the public lawArticles shape. */
function mapSampleArticles(sample: Record<string, { num: number; text: string }[]>) {
  const out: { id: string; lawId: string; number: number; text: string }[] = [];
  for (const [lawId, articles] of Object.entries(sample || {})) {
    for (const a of articles || []) {
      out.push({ id: `${lawId}-${a.num}`, lawId, number: a.num, text: a.text });
    }
  }
  return out;
}

export async function GET() {
  if (isSiteDataCacheValid()) {
    return NextResponse.json(getSiteDataCache()!.payload);
  }

  // Core data — keep to 12 parallel queries max (libsql connection pool limit)
  const [laws, services, dbCategories, siteHero, siteFooter, lawyers, lawFirms, articles, siteFeatures, siteTestimonials, siteFaqs] =
    await Promise.all([
      prisma.law.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }).catch(() => []),
      prisma.service.findMany({ where: { isActive: true }, orderBy: { title: "asc" } }).catch(() => []),
      prisma.category.findMany({ orderBy: { name: "asc" } }).catch(() => []),
      prisma.siteHero.findFirst().catch(() => null),
      prisma.siteFooter.findFirst().catch(() => null),
      prisma.lawyer.findMany({ orderBy: { name: "asc" } }).catch(() => []),
      prisma.lawFirm.findMany({ orderBy: { name: "asc" } }).catch(() => []),
      prisma.article.findMany({ where: { status: "published" }, orderBy: { date: "desc" } }).catch(() => []),
      prisma.siteFeature.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
      prisma.siteTestimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
      prisma.siteFaq.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
    ]);

  let categories = dbCategories;

  // Second batch — avoid exceeding libsql connection pool
  const [sitePartners, cassationCount, instructionCount, systemCount] = await Promise.all([
    prisma.sitePartner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.cassationDecision.count({ where: { isActive: true } }).catch(() => 0),
    prisma.instruction.count({ where: { isActive: true } }).catch(() => 0),
    prisma.system.count({ where: { isActive: true } }).catch(() => 0),
  ]);

  const hero = siteHero || {
    badge: "المنصة القانونية الأولى في العراق",
    title: "دليلك الذكي للقوانين",
    titleGradient: "العراقية والمحامين",
    subtitle:
      "ابحث في آلاف المواد القانونية، اعثر على أفضل المحامين، واحصل على استشارة قانونية موثوقة.",
    btnPrimary: "ابحث عن محامٍ",
    btnSecondary: "تصفح القوانين",
  };

  const footer = siteFooter || {
    description:
      "منصة قانوني هي دليلك الشامل للقوانين العراقية والمحامين المعتمدين في جميع المحافظات.",
    newsletterText: "اشترك لتصلك آخر التحديثات القانونية والمقالات.",
    phone: "+964 770 000 0000",
    email: "info@qanuni.iq",
    address: "بغداد، العراق — شارع الرشيد",
    workingHours: "السبت - الخميس: 8:00 ص - 5:00 م",
    socials: JSON.stringify({
      facebook: "https://facebook.com/qanuni",
      twitter: "https://twitter.com/qanuni",
      instagram: "https://instagram.com/qanuni",
      linkedin: "https://linkedin.com/company/qanuni",
      youtube: "https://youtube.com/@qanuni",
    }),
    legalLinks: JSON.stringify([
      { label: "سياسة الخصوصية", href: "/legal/privacy" },
      { label: "شروط الاستخدام", href: "/legal/terms" },
    ]),
  };

  // Default features if DB is empty
  const defaultFeatures = [
    { id: "f1", title: "محامون موثوقون", desc: "نتحقق من ترخيص وهوية كل محامٍ قبل نشر ملفه.", icon: "ShieldCheck" },
    { id: "f2", title: "معلومات موثقة", desc: "نصوص القوانين مأخوذة من المصادر الرسمية ومحدثة.", icon: "FileText" },
    { id: "f3", title: "قوانين عراقية محدثة", desc: "أحدث التعديلات والتشريعات النافذة أولاً بأول.", icon: "Scale" },
    { id: "f4", title: "بحث سريع", desc: "وصول فوري لأي مادة قانونية أو محامٍ خلال ثوانٍ.", icon: "Sparkles" },
    { id: "f5", title: "منصة آمنة", desc: "تشفير كامل لبياناتك وخصوصية مضمونة.", icon: "ShieldCheck" },
    { id: "f6", title: "دعم احترافي", desc: "فريق متخصص يجيب على استفساراتك على مدار الساعة.", icon: "Users" },
  ];

  // Default testimonials if DB is empty
  const defaultTestimonials = [
    { id: "t1", name: "أحمد الراشد", role: "رائد أعمال", rating: 5, text: "وفرت عليّ المنصة أسابيع من البحث. وجدت محامياً متخصصاً في تأسيس الشركات خلال دقائق.", initials: "أر", hue: "from-blue-500 to-indigo-600" },
    { id: "t2", name: "منى الكعبي", role: "موظفة حكومية", rating: 5, text: "استشرت محامية في قضية حضانة وحصلت على إجابة دقيقة ومطمئنة في نفس اليوم.", initials: "مك", hue: "from-amber-500 to-orange-600" },
    { id: "t3", name: "كريم العبيدي", role: "تاجر", rating: 4, text: "مكتبة القوانين منظمة بشكل رائع. أستطيع الرجوع لأي مادة قانونية بسهولة وسرعة.", initials: "كع", hue: "from-emerald-500 to-teal-600" },
  ];

  // Default FAQs if DB is empty
  const defaultFaqs = [
    { q: "كيف يمكنني البحث عن مادة قانونية محددة؟", a: "استخدم صندوق البحث في الصفحة الرئيسية أو صفحة القوانين، ويمكنك البحث برقم القانون أو اسمه أو نص المادة. النتائج تظهر فوراً مع رابط المادة الكامل." },
    { q: "هل المحامون المعروضون موثقون؟", a: "نعم، كل محامٍ يظهر على المنصة يحمل شارة (موثق) بعد التحقق من رخصة مزاولة المهنة وهويته من نقابة المحامين العراقيين." },
    { q: "هل الاستشارة الأولى مدفوعة؟", a: "يحدد كل محامٍ سعر الاستشارة المعروض على ملفه بوضوح قبل الحجز، وتوجد خيارات استشارات أولية بأسعار رمزية." },
    { q: "هل النصوص القانونية محدثة؟", a: "نعم، نعتمد المصادر الرسمية لقرارات مجلس النواب والجريدة الوقائع العراقية، ونحدّث المحتوى فور صدور أي تعديل." },
    { q: "هل يمكنني حفظ القوانين والمحامين المفضلين؟", a: "بالتأكيد، يمكنك إضافة المواد القانونية والمحامين إلى المفضلة ومتابعة ما استعرضته مؤخراً من حسابك." },
    { q: "كيف أتواصل مع الدعم الفني؟", a: "عبر نموذج التواصل في الصفحة أو قنوات التواصل الاجتماعي المدرجة في التذييل، ويُردّ فريقنا خلال ساعات." },
  ];

  const features = siteFeatures.length > 0
    ? siteFeatures.map((f) => ({ id: f.id, title: f.title, desc: f.desc, icon: f.icon }))
    : defaultFeatures;

  const testimonials = siteTestimonials.length > 0
    ? siteTestimonials.map((t) => ({ id: t.id, name: t.name, role: t.role, rating: t.rating, text: t.text, initials: t.initials, hue: t.hue }))
    : defaultTestimonials;

  const faqs = siteFaqs.length > 0
    ? siteFaqs.map((fq) => ({ q: fq.question, a: fq.answer }))
    : defaultFaqs;

  const stats = [
    { value: 100000, suffix: "+", label: "مادة قانونية" },
    { value: 50, suffix: "+", label: "محامٍ" },
    { value: 50000, suffix: "+", label: "مستخدم" },
  ];

  let lawPageTabs = [
    { id: "all", name: "القوانين العراقية", count: laws.length },
    { id: "decisions", name: "قرارات محكمة التمييز", filterCategory: "cassation", count: cassationCount },
    { id: "regulations", name: "التعليمات", filterCategory: "regulation", count: instructionCount },
    { id: "systems", name: "الأنظمة", filterCategory: "system", count: systemCount },
  ];

  // Read site settings from SiteConfig
  const [registrationEnabledRow, lawTypeVisibilityRow, lawPageTabsRow, categoriesRow, adminDataRow] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { key: "registrationEnabled" } }).catch(() => null),
    prisma.siteConfig.findUnique({ where: { key: "lawTypeVisibility" } }).catch(() => null),
    prisma.siteConfig.findUnique({ where: { key: "lawPageTabs" } }).catch(() => null),
    prisma.siteConfig.findUnique({ where: { key: "categories" } }).catch(() => null),
    prisma.siteConfig.findUnique({ where: { key: "adminData" } }).catch(() => null),
  ]);

  const registrationEnabled = registrationEnabledRow ? registrationEnabledRow.value === "true" : true;
  let lawTypeVisibility: Record<string, boolean> = { all: true, decisions: true, regulations: true, systems: true };
  if (lawTypeVisibilityRow) {
    try { lawTypeVisibility = JSON.parse(lawTypeVisibilityRow.value); } catch {}
  }

  // If admin saved custom tabs, merge their names with computed counts
  if (lawPageTabsRow) {
    try {
      const savedTabs = JSON.parse(lawPageTabsRow.value) as { id: string; name: string; filterCategory?: string }[];
      lawPageTabs = savedTabs.map((st) => {
        const def = lawPageTabs.find((d) => d.id === st.id);
        return {
          id: st.id,
          name: st.name,
          filterCategory: st.filterCategory || def?.filterCategory,
          count: def?.count ?? 0,
        };
      });
    } catch {}
  }

  // Filter tabs by lawTypeVisibility
  lawPageTabs = lawPageTabs.filter((tab) => lawTypeVisibility[tab.id] !== false);

  // Override categories from SiteConfig (admin-saved categories with correct IDs)
  if (categoriesRow) {
    try { categories = JSON.parse(categoriesRow.value); } catch {}
  }

  // Default partners if DB is empty
  const defaultPartners = [
    { id: "p1", name: "وزارة العدل العراقية", title: "شريك استراتيجي", icon: "Landmark", url: "#" },
    { id: "p2", name: "مجلس القضاء الأعلى", title: "شريك مؤسسي", icon: "Scale", url: "#" },
    { id: "p3", name: "نقابة المحامين العراقيين", title: "شريك رسمي", icon: "Users", url: "#" },
    { id: "p4", name: "هيئة ال찡اف العراقية", title: "شريك مؤسسي", icon: "ShieldCheck", url: "#" },
  ];

  const partners = sitePartners.length > 0
    ? sitePartners.map((p) => ({ id: p.id, name: p.name, title: p.title, icon: p.icon, url: p.url }))
    : defaultPartners;

  const dbArticles = articles.map((a) => ({ ...a, lawyerId: a.authorId }));

  const payload = {
    laws,
    services,
    categories,
    lawyers,
    lawFirms,
    articles: dbArticles,
    lawArticles: mapSampleArticles(defaultSampleArticles),
    hero,
    footer,
    stats,
    features,
    testimonials,
    faqs,
    partners,
    logo: "/qanuni/logo.png",
    siteName: "قانوني",
    lawPageTabs,
    registrationEnabled,
    lawTypeVisibility,
  };

  // Overlay admin-edited content (single source of truth in the adminData doc).
  // This is what makes admin panel edits appear on the public site.
  let finalPayload: Record<string, unknown> = { ...payload };
  if (adminDataRow?.value) {
    try {
      const ad = JSON.parse(adminDataRow.value) as Record<string, unknown>;
      if (ad && typeof ad === "object") {
        finalPayload = {
          ...payload,
          laws: ad.laws ?? payload.laws,
          services: ad.services ?? payload.services,
          categories: ad.categories ?? payload.categories,
          lawyers: ad.lawyers ?? payload.lawyers,
          lawFirms: ad.lawFirms ?? payload.lawFirms,
          articles: ad.articles ?? payload.articles,
          features: ad.features ?? payload.features,
          testimonials: ad.testimonials ?? payload.testimonials,
          faqs: ad.faqs ?? payload.faqs,
          partners: ad.partners ?? payload.partners,
          hero: ad.hero ?? payload.hero,
          footer: ad.footer ?? payload.footer,
          lawPageTabs: ad.lawPageTabs ?? payload.lawPageTabs,
          registrationEnabled: ad.registrationEnabled ?? payload.registrationEnabled,
          lawTypeVisibility: ad.lawTypeVisibility ?? payload.lawTypeVisibility,
          lawArticles: ad.sampleArticles
            ? mapSampleArticles(ad.sampleArticles as Record<string, { num: number; text: string }[]>)
            : payload.lawArticles,
        };
      }
    } catch {
      /* ignore malformed doc */
    }
  }

  setSiteDataCache(finalPayload);
  return NextResponse.json(finalPayload);
}

// POST — save hero / footer / stats / config to DB (admin only)
export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const results: string[] = [];

  try {
    // Save hero
    if (body.hero) {
      const existing = await prisma.siteHero.findFirst();
      if (existing) {
        await prisma.siteHero.update({
          where: { id: existing.id },
          data: {
            badge: body.hero.badge ?? existing.badge,
            title: body.hero.title ?? existing.title,
            titleGradient: body.hero.titleGradient ?? existing.titleGradient,
            subtitle: body.hero.subtitle ?? existing.subtitle,
            btnPrimary: body.hero.btnPrimary ?? existing.btnPrimary,
            btnSecondary: body.hero.btnSecondary ?? existing.btnSecondary,
          },
        });
      } else {
        await prisma.siteHero.create({
          data: {
            badge: body.hero.badge ?? "",
            title: body.hero.title ?? "",
            titleGradient: body.hero.titleGradient ?? "",
            subtitle: body.hero.subtitle ?? "",
            btnPrimary: body.hero.btnPrimary ?? "",
            btnSecondary: body.hero.btnSecondary ?? "",
          },
        });
      }
      results.push("hero");
    }

    // Save footer
    if (body.footer) {
      const existing = await prisma.siteFooter.findFirst();
      const footerData = {
        description: body.footer.description ?? "",
        newsletterText: body.footer.newsletterText ?? "",
        phone: body.footer.phone ?? "",
        email: body.footer.email ?? "",
        address: body.footer.address ?? "",
        workingHours: body.footer.workingHours ?? "",
        socials: typeof body.footer.socials === "object"
          ? JSON.stringify(body.footer.socials)
          : body.footer.socials ?? "{}",
        legalLinks: Array.isArray(body.footer.legalLinks)
          ? JSON.stringify(body.footer.legalLinks)
          : body.footer.legalLinks ?? "[]",
      };
      if (existing) {
        await prisma.siteFooter.update({
          where: { id: existing.id },
          data: footerData,
        });
      } else {
        await prisma.siteFooter.create({ data: footerData });
      }
      results.push("footer");
    }

    // Save stats as SiteConfig entry
    if (body.stats) {
      const existing = await prisma.siteConfig.findUnique({ where: { key: "stats" } });
      const statsJson = JSON.stringify(body.stats);
      if (existing) {
        await prisma.siteConfig.update({
          where: { key: "stats" },
          data: { value: statsJson },
        });
      } else {
        await prisma.siteConfig.create({
          data: { key: "stats", value: statsJson },
        });
      }
      results.push("stats");
    }

    // Save any generic config key
    if (body.config) {
      for (const [key, value] of Object.entries(body.config) as [string, string][]) {
        const existing = await prisma.siteConfig.findUnique({ where: { key } });
        const val = typeof value === "object" ? JSON.stringify(value) : String(value);
        if (existing) {
          await prisma.siteConfig.update({ where: { key }, data: { value: val } });
        } else {
          await prisma.siteConfig.create({ data: { key, value: val } });
        }
      }
      results.push("config");
    }

    // Save features (replace all)
    if (Array.isArray(body.features)) {
      await prisma.siteFeature.deleteMany();
      for (let i = 0; i < body.features.length; i++) {
        const f = body.features[i];
        await prisma.siteFeature.create({
          data: {
            title: f.title ?? "",
            desc: f.desc ?? "",
            icon: f.icon ?? "ShieldCheck",
            sortOrder: i,
          },
        });
      }
      results.push("features");
    }

    // Save testimonials (replace all)
    if (Array.isArray(body.testimonials)) {
      await prisma.siteTestimonial.deleteMany();
      for (let i = 0; i < body.testimonials.length; i++) {
        const t = body.testimonials[i];
        await prisma.siteTestimonial.create({
          data: {
            name: t.name ?? "",
            role: t.role ?? "",
            rating: t.rating ?? 5,
            text: t.text ?? "",
            initials: t.initials ?? "",
            hue: t.hue ?? "from-blue-500 to-indigo-600",
            sortOrder: i,
          },
        });
      }
      results.push("testimonials");
    }

    // Save FAQs (replace all)
    if (Array.isArray(body.faqs)) {
      await prisma.siteFaq.deleteMany();
      for (let i = 0; i < body.faqs.length; i++) {
        const fq = body.faqs[i];
        await prisma.siteFaq.create({
          data: {
            question: fq.q ?? fq.question ?? "",
            answer: fq.a ?? fq.answer ?? "",
            sortOrder: i,
          },
        });
      }
      results.push("faqs");
    }

    // Save partners (replace all)
    if (Array.isArray(body.partners)) {
      await prisma.sitePartner.deleteMany();
      for (let i = 0; i < body.partners.length; i++) {
        const p = body.partners[i];
        await prisma.sitePartner.create({
          data: {
            name: p.name ?? "",
            title: p.title ?? "",
            icon: p.icon ?? "Building2",
            url: p.url ?? "",
            sortOrder: i,
          },
        });
      }
      results.push("partners");
    }

    // Save registration enabled
    if (typeof body.registrationEnabled === "boolean") {
      const existing = await prisma.siteConfig.findUnique({ where: { key: "registrationEnabled" } });
      const val = String(body.registrationEnabled);
      if (existing) {
        await prisma.siteConfig.update({ where: { key: "registrationEnabled" }, data: { value: val } });
      } else {
        await prisma.siteConfig.create({ data: { key: "registrationEnabled", value: val } });
      }
      results.push("registrationEnabled");
    }

    // Save law type visibility
    if (body.lawTypeVisibility && typeof body.lawTypeVisibility === "object") {
      const val = JSON.stringify(body.lawTypeVisibility);
      const existing = await prisma.siteConfig.findUnique({ where: { key: "lawTypeVisibility" } });
      if (existing) {
        await prisma.siteConfig.update({ where: { key: "lawTypeVisibility" }, data: { value: val } });
      } else {
        await prisma.siteConfig.create({ data: { key: "lawTypeVisibility", value: val } });
      }
      results.push("lawTypeVisibility");
    }

    // Save law page tabs
    if (Array.isArray(body.lawPageTabs)) {
      const val = JSON.stringify(body.lawPageTabs);
      const existing = await prisma.siteConfig.findUnique({ where: { key: "lawPageTabs" } });
      if (existing) {
        await prisma.siteConfig.update({ where: { key: "lawPageTabs" }, data: { value: val } });
      } else {
        await prisma.siteConfig.create({ data: { key: "lawPageTabs", value: val } });
      }
      results.push("lawPageTabs");
    }

    // Save categories
    if (Array.isArray(body.categories)) {
      const val = JSON.stringify(body.categories);
      const existing = await prisma.siteConfig.findUnique({ where: { key: "categories" } });
      if (existing) {
        await prisma.siteConfig.update({ where: { key: "categories" }, data: { value: val } });
      } else {
        await prisma.siteConfig.create({ data: { key: "categories", value: val } });
      }
      results.push("categories");
    }

    invalidateSiteDataCache(); // invalidate cached payload after admin edit
    return NextResponse.json({ ok: true, saved: results });
  } catch (error) {
    console.error("Failed to save site data:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
