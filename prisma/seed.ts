import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── USERS ───
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@qanuni.iq" },
  });
  if (!existingAdmin) {
    const adminHash = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
    await prisma.user.create({
      data: { name: "مدير النظام", email: "admin@qanuni.iq", phone: "+9647700000000", passwordHash: adminHash, role: "admin", isActive: true, emailVerified: true },
    });
    console.log("  ✅ Admin user");
  }
  const existingLawyer = await prisma.user.findUnique({ where: { email: "lawyer@qanuni.iq" } });
  if (!existingLawyer) {
    await prisma.user.create({
      data: { name: "أحمد المحامي", email: "lawyer@qanuni.iq", phone: "+9647701112233", passwordHash: "1f650d62c28eab1cc5f7f3552a5b3cc900c0fb81a9be3fd1df96b7f593f7f00c", role: "lawyer", isActive: true },
    });
    await prisma.user.create({
      data: { name: "سارة المستخدم", email: "user@qanuni.iq", phone: "+9647801112233", passwordHash: "a4d8cdc9d06f1031d0b82f9e90d40bd9e358b53fbd89fec09e4557b328e8a850", role: "user", isActive: true },
    });
    console.log("  ✅ Demo users");
  }

  // ─── SITE HERO ───
  const existingHero = await prisma.siteHero.findFirst();
  if (!existingHero) {
    await prisma.siteHero.create({
      data: {
        badge: "المنصة القانونية الأولى في العراق",
        title: "دليلك الذكي للقوانين العراقية",
        subtitle: "ابحث في آلاف المواد القانونية، اعثر على أفضل المحامين، واحصل على استشارة قانونية موثوقة.",
        btnPrimary: "ابحث عن محامٍ",
        btnSecondary: "تصفح القوانين",
      },
    });
    console.log("  ✅ Site hero");
  }

  // ─── SITE FOOTER ───
  const existingFooter = await prisma.siteFooter.findFirst();
  if (!existingFooter) {
    await prisma.siteFooter.create({
      data: {
        description: "منصة قانوني هي دليلك الشامل للقوانين العراقية والمحامين المعتمدين في جميع المحافظات.",
        newsletterText: "اشترك لتصلك آخر التحديثات القانونية والمقالات.",
        phone: "+964 770 000 0000",
        email: "info@qanuni.iq",
        address: "بغداد، العراق — شارع الرشيد",
        workingHours: "السبت - الخميس: 8:00 ص - 5:00 م",
        socials: JSON.stringify({ facebook: "https://facebook.com/qanuni", twitter: "https://twitter.com/qanuni", instagram: "https://instagram.com/qanuni", linkedin: "https://linkedin.com/company/qanuni", youtube: "https://youtube.com/@qanuni" }),
        legalLinks: JSON.stringify([{ label: "سياسة الخصوصية", href: "/legal/privacy" }, { label: "شروط الاستخدام", href: "/legal/terms" }]),
      },
    });
    console.log("  ✅ Site footer");
  }

  // ─── LAWS ───
  const lawCount = await prisma.law.count();
  if (lawCount === 0) {
    const laws = [
      { id: "civil", name: "القانون المدني", articles: 2478, updated: "2025-11", icon: "Scale", color: "#1E3A8A", category: "civil", source: "الوقائع العراقية" },
      { id: "penal", name: "قانون العقوبات", articles: 462, updated: "2025-09", icon: "Gavel", color: "#0F172A", category: "penal", source: "الوقائع العراقية" },
      { id: "personal", name: "قانون الأحوال الشخصية", articles: 160, updated: "2025-12", icon: "HeartHandshake", color: "#F59E0B", category: "personal", source: "الوقائع العراقية" },
      { id: "labor", name: "قانون العمل", articles: 145, updated: "2025-10", icon: "Users", color: "#10B981", category: "labor", source: "الوقائع العراقية" },
      { id: "traffic", name: "قانون المرور", articles: 98, updated: "2025-08", icon: "Car", color: "#3B82F6", category: "traffic", source: "الوقائع العراقية" },
      { id: "companies", name: "قانون الشركات", articles: 312, updated: "2025-11", icon: "Building2", color: "#1E3A8A", category: "companies", source: "الوقائع العراقية" },
      { id: "investment", name: "قانون الاستثمار", articles: 74, updated: "2025-07", icon: "Landmark", color: "#F59E0B", category: "investment", source: "الوقائع العراقية" },
      { id: "commercial", name: "القانون التجاري", articles: 540, updated: "2025-06", icon: "Briefcase", color: "#3B82F6", category: "commercial", source: "الوقائع العراقية" },
    ];
    for (const law of laws) {
      await prisma.law.create({ data: law });
    }
    console.log("  ✅ 8 laws");
  }

  // ─── SERVICES ───
  const svcCount = await prisma.service.count();
  if (svcCount === 0) {
    const services = [
      { id: "s1", title: "الاستشارة القانونية", icon: "Scale", desc: "تحدث مع محامٍ مختص فوراً عبر الدردشة أو الهاتف." },
      { id: "s2", title: "صياغة العقود", icon: "FileText", desc: "عقود عمل وتأسيس شركات واتفاقيات موثقة قانونياً." },
      { id: "s3", title: "الشركات", icon: "Building2", desc: "تأسيس وإدارة الشركات والامتثال التنظيمي." },
      { id: "s4", title: "الوراثة", icon: "Network", desc: "تقسيم التركات وإصدار شهادات الحصر الوراثي." },
      { id: "s5", title: "القضايا المدنية", icon: "Gavel", desc: "تمثيل في المنازعات المالية والعقارية." },
      { id: "s6", title: "القضايا الجنائية", icon: "ShieldCheck", desc: "دفاع احترافي أمام المحاكم الجزائية." },
      { id: "s7", title: "قضايا الأسرة", icon: "HeartHandshake", desc: "طلاق وحضانة ونفقة بخصوصية ورعاية." },
      { id: "s8", title: "قضايا العمل", icon: "Users", desc: "حماية حقوق العامل ومنازعات التوظيف." },
      { id: "s9", title: "العقارات", icon: "Landmark", desc: "تسجيل وبيع وشراء وإدارة الأملاك." },
      { id: "s10", title: "قانون الأعمال", icon: "Briefcase", desc: "استشارات تجارية واستثمارية متكاملة." },
    ];
    for (const svc of services) {
      await prisma.service.create({ data: svc });
    }
    console.log("  ✅ 10 services");
  }

  // ─── CATEGORIES ───
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    const categories = [
      { name: "قوانين مدنية", icon: "Scale" },
      { name: "قوانين جزائية", icon: "Gavel" },
      { name: "قوانين تجارية", icon: "Briefcase" },
      { name: "قوانين عقارية", icon: "Building" },
      { name: "قوانين أحوال شخصية", icon: "Users" },
      { name: "قوانين إدارية", icon: "Landmark" },
    ];
    for (const cat of categories) {
      await prisma.category.create({ data: cat });
    }
    console.log("  ✅ 6 categories");
  }

  // ─── LAWYERS (50) ───
  const lawyerCount = await prisma.lawyer.count();
  if (lawyerCount === 0) {
    const lawyers = [
      { id: "l1", name: "أ.د. محمد عبد الكريم", slug: "mohammed-abdelkarim", city: "بغداد", specialization: "القانون المدني", experience: 22, rating: 4.9, reviewCount: 318, verified: true, online: true, price: 50, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "خبير في المنازعات العقارية والعقود التجارية مع خبرة واسعة أمام محاكم الاستئناف.", initials: "مع", hue: "from-blue-600 to-indigo-700", whatsapp: "+9647701112233", telegram: "@lawyer_mohammed", facebook: "mohammed.abdelkarim.law", instagram: "lawyer.mohammed.legal", promoted: false },
      { id: "l2", name: "المحامية سارة ناصر", slug: "sara-nasser", city: "أربيل", specialization: "الأحوال الشخصية", experience: 14, rating: 4.8, reviewCount: 204, verified: true, online: true, price: 40, gender: "female", languages: '["العربية", "الكردية", "الإنجليزية"]', bio: "متخصصة في قضايا الأحوال الشخصية والحضانة بأسلوب إنساني واحترافي.", initials: "سن", hue: "from-amber-500 to-orange-600", whatsapp: "+9647502223344", telegram: "@lawyer_sara", facebook: "sara.nasser.law", instagram: "lawyer.sara.legal", promoted: false },
      { id: "l3", name: "الأستاذ خالد العبيدي", slug: "khaled-alubaidi", city: "البصرة", specialization: "القانون الجنائي", experience: 18, rating: 4.7, reviewCount: 176, verified: true, online: false, price: 60, gender: "male", languages: '["العربية"]', bio: "محامٍ جنائي يمثل المتهمين في القضايا الجسيمة ويتميز بالمرافعات الخطابية.", initials: "خع", hue: "from-slate-700 to-slate-900", whatsapp: "+9647703334455", telegram: "@lawyer_khaled", facebook: "khaled.alubaidi.law", promoted: false },
      { id: "l4", name: "المحامية رنا جاسم", slug: "rana-jasim", city: "بغداد", specialization: "قانون العمل", experience: 9, rating: 4.9, reviewCount: 142, verified: true, online: true, price: 35, gender: "female", languages: '["العربية", "الإنجليزية"]', bio: "تدافع عن حقوق العمال وتتخصص في منازعات الفصل التعسفي ومكافآت نهاية الخدمة.", initials: "رج", hue: "from-emerald-500 to-teal-600", whatsapp: "+9647804445566", telegram: "@lawyer_rana", facebook: "rana.jasim.law", instagram: "lawyer.rana.legal", promoted: false },
      { id: "l5", name: "الأستاذ عمر فؤاد", slug: "omar-fouad", city: "النجف", specialization: "القانون التجاري", experience: 16, rating: 4.6, reviewCount: 98, verified: false, online: true, price: 45, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "مستشار قانوني للشركات الناشئة وعقود الاستثمار والتأسيس التجاري.", initials: "عف", hue: "from-blue-500 to-cyan-600", whatsapp: "+9647816667788", telegram: "@lawyer_omar", promoted: false },
      { id: "l6", name: "المحامية هدى كريم", slug: "huda-kareem", city: "كربلاء", specialization: "العقارات", experience: 11, rating: 4.8, reviewCount: 121, verified: true, online: false, price: 38, gender: "female", languages: '["العربية"]', bio: "خبرة في تسجيل العقار وتقسيم التركات والمنازعات العقارية الوقفية.", initials: "هك", hue: "from-purple-500 to-fuchsia-600", whatsapp: "+9647704445566", telegram: "@lawyer_huda", facebook: "huda.kareem.law", instagram: "lawyer.huda.legal", promoted: false },
      { id: "l7", name: "الأستاذ ياسر العاني", slug: "yasser-alani", city: "بغداد", specialization: "القانون الإداري", experience: 20, rating: 4.7, reviewCount: 187, verified: true, online: true, price: 55, gender: "male", languages: '["العربية", "الإنجليزية", "الفرنسية"]', bio: "يمثل الموظفين في الطعون الإدارية أمام محكمة القضاء الإداري.", initials: "يع", hue: "from-indigo-600 to-blue-700", whatsapp: "+9647827778899", telegram: "@lawyer_yasser", facebook: "yasser.alani.law", instagram: "lawyer.yasser.legal", promoted: false },
      { id: "l8", name: "المحامية ليلى حسن", slug: "layla-hassan", city: "أربيل", specialization: "الأحوال الشخصية", experience: 7, rating: 4.9, reviewCount: 89, verified: false, online: true, price: 30, gender: "female", languages: '["العربية", "الكردية"]', bio: "تركز على التسويات الودية في قضايا الطلاق والميراث بخصوصية تامة.", initials: "لح", hue: "from-rose-500 to-pink-600", whatsapp: "+9647515556677", telegram: "@lawyer_layla", instagram: "lawyer.layla.legal", promoted: false },
      { id: "l9", name: "أ. أحمد خليل", slug: "ahmed-khalil", city: "بغداد", specialization: "قانون الشركات", experience: 12, rating: 4.7, reviewCount: 156, verified: true, online: true, price: 50, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "مستشار قانوني متخصص في تأسيس الشركات والصفقات التجارية الكبرى والامتثال التنظيمي.", initials: "أخ", hue: "from-blue-600 to-indigo-700", whatsapp: "+9647705556677", telegram: "@lawyer_ahmed", promoted: true },
      { id: "l10", name: "المحامية فاطمة حسين", slug: "fatima-hussein", city: "النجف", specialization: "القانون الدستوري", experience: 15, rating: 4.8, reviewCount: 134, verified: true, online: false, price: 55, gender: "female", languages: '["العربية"]', bio: "متخصصة في القانون الدستوري والمنازعات الإدارية أمام مجلس الدولة.", initials: "فح", hue: "from-purple-500 to-fuchsia-600", facebook: "fatima.hussein.law", promoted: true },
      { id: "l11", name: "الأستاذ علي جعفر", slug: "ali-jafar", city: "البصرة", specialization: "القانون المالي", experience: 20, rating: 4.6, reviewCount: 198, verified: true, online: true, price: 65, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "خبير في القانون المالي والضرائب والمعاملات المالية أمام الجهات الحكومية.", initials: "عج", hue: "from-slate-700 to-slate-900", whatsapp: "+9647709990011", telegram: "@lawyer_ali", promoted: false },
      { id: "l12", name: "المحامية نور سالم", slug: "noor-salem", city: "الموصل", specialization: "القانون الصحي", experience: 8, rating: 4.9, reviewCount: 87, verified: false, online: true, price: 35, gender: "female", languages: '["العربية", "الإنجليزية"]', bio: "متخصصة في المسؤولية الطبية والقانون الصحي وحقوق المرضى.", initials: "نس", hue: "from-emerald-500 to-teal-600", whatsapp: "+9647511112233", telegram: "@lawyer_noor", promoted: false },
      { id: "l13", name: "الأستاذ حسام مهدي", slug: "hsam-mahdi", city: "كركوك", specialization: "قانون الملكية الفكرية", experience: 10, rating: 4.5, reviewCount: 76, verified: true, online: true, price: 45, gender: "male", languages: '["العربية", "الكردية", "الإنجليزية"]', bio: "مستشار في حماية العلامات التجارية وبراءات الاختراع والحقوق الفكرية.", initials: "حم", hue: "from-blue-500 to-cyan-600", whatsapp: "+9647702223344", telegram: "@lawyer_hsam", promoted: false },
      { id: "l14", name: "المحامية دعاء كريم", slug: "doaa-kareem", city: "السليمانية", specialization: "الأحوال الشخصية", experience: 6, rating: 4.8, reviewCount: 65, verified: false, online: true, price: 30, gender: "female", languages: '["العربية", "الكردية"]', bio: "متخصصة في قضايا الأسرة والحضانة والنفقة بأسلوب حنون واحترافي.", initials: "دك", hue: "from-rose-500 to-pink-600", whatsapp: "+9647503334455", telegram: "@lawyer_doaa", promoted: false },
      { id: "l15", name: "الأستاذ كرار ناصر", slug: "karar-nasser", city: "بغداد", specialization: "القانون الجنائي", experience: 25, rating: 4.9, reviewCount: 289, verified: true, online: false, price: 70, gender: "male", languages: '["العربية"]', bio: "محامٍ جنائي بارز يمثّل في القضايا الكبرى أمام محكمة الجنايات المركزية.", initials: "كن", hue: "from-indigo-600 to-blue-700", whatsapp: "+9647814445566", telegram: "@lawyer_karar", promoted: true },
      { id: "l16", name: "المحامية مريم عادل", slug: "mariam-adel", city: "الناصرية", specialization: "القانون البيئي", experience: 7, rating: 4.6, reviewCount: 52, verified: false, online: true, price: 35, gender: "female", languages: '["العربية", "الإنجليزية"]', bio: "متخصصة في القضايا البيئية والتلوث وحماية الموارد الطبيعية.", initials: "مع", hue: "from-teal-500 to-emerald-600", whatsapp: "+9647706667788", telegram: "@lawyer_mariam", promoted: false },
      { id: "l17", name: "الأستاذ صادق حيدر", slug: "sadiq-haider", city: "الحلة", specialization: "القانون الدولي", experience: 18, rating: 4.7, reviewCount: 143, verified: true, online: true, price: 60, gender: "male", languages: '["العربية", "الإنجليزية", "الفرنسية"]', bio: "خبير في القانون الدولي الإنساني والمعاملات الدولية والتحكيم التجاري.", initials: "شح", hue: "from-red-500 to-rose-600", whatsapp: "+9647829990011", telegram: "@lawyer_sadiq", promoted: false },
      { id: "l18", name: "المحامية أمل فوزي", slug: "amal-fawzi", city: "الكوت", specialization: "قانون الهجرة", experience: 9, rating: 4.8, reviewCount: 98, verified: true, online: true, price: 40, gender: "female", languages: '["العربية", "الإنجليزية"]', bio: "متخصصة في قانون الهجرة وتأشيرات العمل والإقامة الدائمة في الدول الأجنبية.", initials: "أف", hue: "from-amber-500 to-orange-600", whatsapp: "+9647708889900", telegram: "@lawyer_amal", promoted: false },
      { id: "l19", name: "الأستاذ باسل رياض", slug: "basel-riyadh", city: "دهوك", specialization: "القانون التجاري", experience: 14, rating: 4.6, reviewCount: 112, verified: true, online: true, price: 50, gender: "male", languages: '["العربية", "الكردية", "الإنجليزية"]', bio: "مستشار قانوني للشركات متعدد الجنسيات والصفقات التجارية العابرة للحدود.", initials: "بر", hue: "from-slate-700 to-slate-900", whatsapp: "+9647512223344", telegram: "@lawyer_basel", promoted: false },
      { id: "l20", name: "المحامية هند عثمان", slug: "hind-osman", city: "الرمادي", specialization: "قانون العمل", experience: 11, rating: 4.7, reviewCount: 89, verified: true, online: false, price: 40, gender: "female", languages: '["العربية"]', bio: "تدافع عن حقوق العمال في قضايا الفصل التعسفي وحوادث العمل والتأمينات.", initials: "هع", hue: "from-purple-500 to-fuchsia-600", whatsapp: "+9647813334455", telegram: "@lawyer_hind", promoted: false },
      { id: "l21", name: "الأستاذ فيصل نوري", slug: "faisal-nouri", city: "بغداد", specialization: "القانون الإداري", experience: 22, rating: 4.8, reviewCount: 234, verified: true, online: true, price: 60, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "خبير في القضاء الإداري وطعون الموظفين والمنازعات الإدارية أمام محكمة القضاء الإداري.", initials: "فن", hue: "from-emerald-500 to-teal-600", whatsapp: "+9647701112244", telegram: "@lawyer_faisal", promoted: false },
      { id: "l22", name: "المحامية ريم عباس", slug: "reem-abbas", city: "أربيل", specialization: "الملكية الفكرية", experience: 5, rating: 4.9, reviewCount: 43, verified: false, online: true, price: 35, gender: "female", languages: '["العربية", "الكردية", "الإنجليزية"]', bio: "متخصصة في تسجيل العلامات التجارية وحماية حقوق الملكية الفكرية للشركات الناشئة.", initials: "رع", hue: "from-blue-600 to-indigo-700", whatsapp: "+9647504445566", telegram: "@lawyer_reem", promoted: false },
      { id: "l23", name: "الأستاذ جمال قاسم", slug: "jamal-qasim", city: "النجف", specialization: "القانون المدني", experience: 19, rating: 4.6, reviewCount: 167, verified: true, online: false, price: 50, gender: "male", languages: '["العربية"]', bio: "محامٍ مدني متخصص في المنازعات العقارية والعقود والمسؤولية التعاقدية.", initials: "جق", hue: "from-indigo-600 to-blue-700", whatsapp: "+9647825556677", telegram: "@lawyer_jamal", promoted: false },
      { id: "l24", name: "المحامية سماح توفيق", slug: "samah-tawfiq", city: "كربلاء", specialization: "الأحوال الشخصية", experience: 13, rating: 4.8, reviewCount: 145, verified: true, online: true, price: 45, gender: "female", languages: '["العربية"]', bio: "متخصصة في قضايا الزواج والطلاق والحضانة والنفقة بخبرة واسعة أمام المحاكم الشرعية.", initials: "ست", hue: "from-amber-500 to-orange-600", whatsapp: "+9647707778899", telegram: "@lawyer_samah", promoted: false },
      { id: "l25", name: "الأستاذ ماجد جلال", slug: "majid-jalal", city: "الموصل", specialization: "القانون العقاري", experience: 16, rating: 4.7, reviewCount: 123, verified: true, online: true, price: 55, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "خبير في قانون التسجيل العقاري والمنازعات الوقفية والملكية المشتركة.", initials: "مج", hue: "from-blue-500 to-cyan-600", whatsapp: "+9647518889900", telegram: "@lawyer_majid", promoted: false },
      { id: "l26", name: "المحامية نادية شوقي", slug: "nadia-shawqi", city: "بغداد", specialization: "القانون التجاري", experience: 10, rating: 4.7, reviewCount: 88, verified: true, online: true, price: 42, gender: "female", languages: '["العربية", "الإنجليزية"]', bio: "متخصصة في منازعات الشركات والعلامات التجارية والمنافسة غير المشروعة.", initials: "نش", hue: "from-blue-600 to-indigo-700", whatsapp: "+9647701234567", telegram: "@lawyer_nadia", promoted: false },
      { id: "l27", name: "الأستاذ غسان حامد", slug: "ghassan-hamed", city: "البصرة", specialization: "القانون البحري", experience: 24, rating: 4.8, reviewCount: 167, verified: true, online: false, price: 70, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "خبير في القانون البحري والتجارة الدولية ومنازعات الشحن والنقل البحري.", initials: "غح", hue: "from-cyan-500 to-blue-600", whatsapp: "+9647702345678", telegram: "@lawyer_ghassan", promoted: true },
      { id: "l28", name: "المحامية نجلاء سامي", slug: "najlaa-sami", city: "أربيل", specialization: "قانون الأسرة", experience: 8, rating: 4.8, reviewCount: 73, verified: false, online: true, price: 35, gender: "female", languages: '["العربية", "الكردية"]', bio: "متخصصة في قضايا النفقة والحضانة والزيارة والتسوية الودية للنزاعات الأسرية.", initials: "نس", hue: "from-rose-500 to-pink-600", whatsapp: "+9647503456789", telegram: "@lawyer_najlaa", promoted: false },
      { id: "l29", name: "الأستاذ طارق زياد", slug: "tariq-ziad", city: "النجف", specialization: "القانون المدني", experience: 17, rating: 4.6, reviewCount: 134, verified: true, online: true, price: 50, gender: "male", languages: '["العربية"]', bio: "خبير في العقود المدنية والتأمينات والمسؤولية التقصيرية.", initials: "طز", hue: "from-slate-700 to-slate-900", whatsapp: "+9647814567890", telegram: "@lawyer_tariq", promoted: false },
      { id: "l30", name: "المحامية هبة أكرم", slug: "hiba-akram", city: "السليمانية", specialization: "القانون الدولي", experience: 9, rating: 4.7, reviewCount: 61, verified: true, online: true, price: 45, gender: "female", languages: '["العربية", "الكردية", "الإنجليزية", "الفرنسية"]', bio: "متخصصة في القانون الدولي لحقوق الإنسان واللجوء والهجرة.", initials: "هأ", hue: "from-purple-500 to-fuchsia-600", whatsapp: "+9647705678901", telegram: "@lawyer_hiba", promoted: false },
      { id: "l31", name: "الأستاذ إياد موفق", slug: "eyad-mowafak", city: "كركوك", specialization: "القانون التجاري", experience: 15, rating: 4.5, reviewCount: 92, verified: true, online: true, price: 48, gender: "male", languages: '["العربية", "الكردية"]', bio: "مستشار قانوني في عقود الامتياز التجاري والتوزيع والوكالات التجارية.", initials: "إم", hue: "from-blue-500 to-cyan-600", whatsapp: "+9647506789012", telegram: "@lawyer_eyad", promoted: false },
      { id: "l32", name: "المحامية سحر عبود", slug: "sahar-abood", city: "الحلة", specialization: "قانون العمل", experience: 11, rating: 4.8, reviewCount: 97, verified: true, online: true, price: 38, gender: "female", languages: '["العربية"]', bio: "تدافع عن حقوق العمال ونقاباتهم في قضايا الأجور والتعويضات والتأمين الصحي.", initials: "سع", hue: "from-emerald-500 to-teal-600", whatsapp: "+9647817890123", telegram: "@lawyer_sahar", promoted: false },
      { id: "l33", name: "الأستاذ ليث عمار", slug: "laith-amar", city: "بغداد", specialization: "القانون الجنائي", experience: 21, rating: 4.9, reviewCount: 256, verified: true, online: false, price: 75, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "محامٍ جنائي مخضرم يتمتع بسجل حافل في قضايا الإرهاب والجرائم المنظمة.", initials: "لع", hue: "from-indigo-600 to-blue-700", whatsapp: "+9647708901234", telegram: "@lawyer_laith", promoted: true },
      { id: "l34", name: "المحامية زهراء نزار", slug: "zahra-nizar", city: "الناصرية", specialization: "الأحوال الشخصية", experience: 6, rating: 4.7, reviewCount: 48, verified: false, online: true, price: 28, gender: "female", languages: '["العربية"]', bio: "متخصصة في الخلع والطلاق والاتفاقيات الزوجية والتوثيق الشرعي.", initials: "زن", hue: "from-amber-500 to-orange-600", whatsapp: "+9647509012345", telegram: "@lawyer_zahra", promoted: false },
      { id: "l35", name: "الأستاذ مهند سيف", slug: "mohannad-seif", city: "بغداد", specialization: "قانون الشركات", experience: 14, rating: 4.6, reviewCount: 108, verified: true, online: true, price: 52, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "مستشار قانوني في تأسيس الشركات المساهمة والاستحواذ والاندماج.", initials: "مس", hue: "from-blue-600 to-indigo-700", whatsapp: "+9647810123456", telegram: "@lawyer_mohannad", promoted: false },
      { id: "l36", name: "المحامية بشرى وليد", slug: "bushra-waleed", city: "دهوك", specialization: "قانون البيئة", experience: 7, rating: 4.6, reviewCount: 39, verified: false, online: true, price: 32, gender: "female", languages: '["العربية", "الكردية"]', bio: "ناشطة في مجال العدالة البيئية ومكافحة التلوث والمخالفات البيئية.", initials: "بث", hue: "from-teal-500 to-emerald-600", whatsapp: "+9647521234567", telegram: "@lawyer_bushra", promoted: false },
      { id: "l37", name: "الأستاذ موفق خضير", slug: "muwafaq-khudhair", city: "الموصل", specialization: "القانون المدني", experience: 23, rating: 4.7, reviewCount: 198, verified: true, online: false, price: 55, gender: "male", languages: '["العربية"]', bio: "خبير في المنازعات المدنية والتنفيذ الجبري وإجراءات الطعن.", initials: "مخ", hue: "from-slate-700 to-slate-900", whatsapp: "+9647702345678", telegram: "@lawyer_muwafaq", promoted: false },
      { id: "l38", name: "المحامية رؤى فيصل", slug: "roua-faisal", city: "أربيل", specialization: "قانون الملكية الفكرية", experience: 5, rating: 4.8, reviewCount: 32, verified: false, online: true, price: 30, gender: "female", languages: '["العربية", "الكردية", "الإنجليزية"]', bio: "متخصصة في الملكية الفكرية وحقوق المؤلف والعلامات التجارية.", initials: "رف", hue: "from-blue-500 to-cyan-600", whatsapp: "+9647503456789", telegram: "@lawyer_roua", promoted: false },
      { id: "l39", name: "الأستاذ قطري عدنان", slug: "qatari-adnan", city: "بغداد", specialization: "القانون الإداري", experience: 19, rating: 4.8, reviewCount: 176, verified: true, online: true, price: 58, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "خبير في دعاوى التعويض الإداري وإلغاء القرارات الإدارية.", initials: "قع", hue: "from-indigo-600 to-blue-700", whatsapp: "+9647814567890", telegram: "@lawyer_qatari", promoted: false },
      { id: "l40", name: "المحامية ميادة جابر", slug: "mayada-jaber", city: "البصرة", specialization: "القانون التجاري", experience: 13, rating: 4.7, reviewCount: 104, verified: true, online: true, price: 48, gender: "female", languages: '["العربية", "الإنجليزية"]', bio: "مستشارة قانونية في عقود البيع الدولي وخطابات الاعتماد والتحصيل.", initials: "مج", hue: "from-purple-500 to-fuchsia-600", whatsapp: "+9647705678901", telegram: "@lawyer_mayada", promoted: false },
      { id: "l41", name: "الأستاذ نواف سليمان", slug: "nawaf-sulaiman", city: "النجف", specialization: "قانون العقارات", experience: 16, rating: 4.6, reviewCount: 119, verified: true, online: true, price: 48, gender: "male", languages: '["العربية"]', bio: "خبير في تسجيل العقارات والأراضي والمنازعات العقارية والوقفية.", initials: "نس", hue: "from-emerald-500 to-teal-600", whatsapp: "+9647506789012", telegram: "@lawyer_nawaf", promoted: false },
      { id: "l42", name: "المحامية إيمان شاكر", slug: "iman-shaker", city: "كربلاء", specialization: "قانون الأسرة", experience: 10, rating: 4.9, reviewCount: 84, verified: true, online: true, price: 40, gender: "female", languages: '["العربية"]', bio: "تتخصص في قضايا الأسرة والحضانة والطلاق والنفقة والتسويات الودية.", initials: "إش", hue: "from-amber-500 to-orange-600", whatsapp: "+9647817890123", telegram: "@lawyer_iman", promoted: true },
      { id: "l43", name: "الأستاذ كمال بشير", slug: "kamel-bashir", city: "بغداد", specialization: "القانون الدستوري", experience: 25, rating: 4.9, reviewCount: 312, verified: true, online: false, price: 80, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "خبير دستوري بارز ومرشح سابق لمجلس القضاء الأعلى.", initials: "كب", hue: "from-indigo-600 to-blue-700", whatsapp: "+9647708901234", telegram: "@lawyer_kamel", promoted: true },
      { id: "l44", name: "المحامية زينب هاشم", slug: "zainab-hashim", city: "السليمانية", specialization: "القانون الجنائي", experience: 8, rating: 4.7, reviewCount: 56, verified: true, online: true, price: 38, gender: "female", languages: '["العربية", "الكردية"]', bio: "محامية جنائية تدافع عن حقوق النساء في قضايا العنف الأسري والجرائم الإلكترونية.", initials: "زه", hue: "from-rose-500 to-pink-600", whatsapp: "+9647509012345", telegram: "@lawyer_zainab", promoted: false },
      { id: "l45", name: "الأستاذ رشيد نعمة", slug: "rasheed-nima", city: "الموصل", specialization: "القانون التجاري", experience: 18, rating: 4.6, reviewCount: 145, verified: true, online: true, price: 55, gender: "male", languages: '["العربية"]', bio: "خبير في القانون التجاري وعقود المقاولات والمشاريع الحكومية.", initials: "رن", hue: "from-blue-500 to-cyan-600", whatsapp: "+9647810123456", telegram: "@lawyer_rasheed", promoted: false },
      { id: "l46", name: "المحامية تغريد وهاب", slug: "taghrid-wahab", city: "بغداد", specialization: "قانون العمل", experience: 12, rating: 4.7, reviewCount: 95, verified: true, online: true, price: 42, gender: "female", languages: '["العربية", "الإنجليزية"]', bio: "متخصصة في منازعات العمل الجماعية والتأمينات الاجتماعية وتعويضات الإصابات.", initials: "تو", hue: "from-teal-500 to-emerald-600", whatsapp: "+9647521234567", telegram: "@lawyer_taghrid", promoted: false },
      { id: "l47", name: "الأستاذ حازم نجم", slug: "hazem-najm", city: "البصرة", specialization: "القانون المدني", experience: 20, rating: 4.7, reviewCount: 165, verified: true, online: false, price: 60, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "خبير في منازعات المقاولات والهندسة والعقود الهندسية.", initials: "حن", hue: "from-slate-700 to-slate-900", whatsapp: "+9647702345678", telegram: "@lawyer_hazem", promoted: false },
      { id: "l48", name: "المحامية شهد مالك", slug: "shahad-malik", city: "أربيل", specialization: "القانون الدولي", experience: 6, rating: 4.8, reviewCount: 41, verified: false, online: true, price: 35, gender: "female", languages: '["العربية", "الكردية", "الإنجليزية", "التركية"]', bio: "متخصصة في القانون الدولي للاجئين وعديمي الجنسية.", initials: "شم", hue: "from-purple-500 to-fuchsia-600", whatsapp: "+9647503456789", telegram: "@lawyer_shahad", promoted: false },
      { id: "l49", name: "الأستاذ فراس ماجد", slug: "firas-majid", city: "بغداد", specialization: "قانون الشركات", experience: 13, rating: 4.6, reviewCount: 88, verified: true, online: true, price: 50, gender: "male", languages: '["العربية", "الإنجليزية"]', bio: "مستشار قانوني في تأسيس الشركات الأجنبية في العراق والمناطق الحرة.", initials: "فر", hue: "from-blue-600 to-indigo-700", whatsapp: "+9647814567890", telegram: "@lawyer_firas", promoted: false },
      { id: "l50", name: "المحامية سجى عادل", slug: "saja-adel", city: "النجف", specialization: "الأحوال الشخصية", experience: 7, rating: 4.9, reviewCount: 54, verified: false, online: true, price: 30, gender: "female", languages: '["العربية"]', bio: "تقدم استشارات شرعية وقانونية في قضايا الخطوبة والزواج والطلاق.", initials: "سع", hue: "from-rose-500 to-pink-600", whatsapp: "+9647705678901", telegram: "@lawyer_saja", promoted: false },
    ];
    for (const lawyer of lawyers) {
      await prisma.lawyer.create({ data: lawyer });
    }
    console.log(`  ✅ ${lawyers.length} lawyers`);
  }

  // ─── ARTICLES ───
  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    const articles = [
      { id: "a1", category: "القانون المدني", title: "كل ما يهمك معرفته عن القانون المدني العراقي", excerpt: "نظرة شاملة على أبواب القانون المدني العراقي رقم 40 لسنة 1951 وأهم التعديلات التي طرأت عليه.", content: "", author: "أ.د. محمد عبد الكريم", authorId: "l1", date: "2025-12-01", readingTime: 10, hue: "from-blue-400 to-indigo-500", views: 2847, status: "published" },
      { id: "a2", category: "الأحوال الشخصية", title: "حقوق المرأة في قانون الأحوال الشخصية العراقي", excerpt: "نظرة على أبرز المواد التي تمنح المرأة حقوقها في الزواج والطلاق وحضانة الأطفال.", content: "", author: "المحامية سارة ناصر", authorId: "l2", date: "2025-11-28", readingTime: 8, hue: "from-amber-400 to-orange-500", views: 3421, status: "published" },
      { id: "a3", category: "العقارات", title: "كيف تشتري عقاراً في العراق دون مشاكل قانونية", excerpt: "دليل خطوة بخطوة لإتمام صفقة عقارية قانونية وآمنة في العراق.", content: "", author: "المحامية هدى كريم", authorId: "l6", date: "2025-11-20", readingTime: 12, hue: "from-purple-400 to-fuchsia-500", views: 1892, status: "published" },
      { id: "a4", category: "القانون التجاري", title: "تأسيس الشركات في العراق: دليل المستثمر الشامل", excerpt: "كل ما تحتاج معرفته عن تأسيس الشركات بأنواعها المختلفة في العراق.", content: "", author: "الأستاذ عمر فؤاد", authorId: "l5", date: "2025-11-18", readingTime: 15, hue: "from-cyan-400 to-blue-500", views: 2156, status: "published" },
      { id: "a5", category: "قانون العمل", title: "حقوق العامل في القانون العراقي: عقود العمل وإنهاؤها", excerpt: "شرح مفصل لحقوق وواجبات العامل وصاحب العمل وفق قانون العمل العراقي.", content: "", author: "المحامية رنا جاسم", authorId: "l4", date: "2025-11-15", readingTime: 9, hue: "from-emerald-400 to-teal-500", views: 1634, status: "published" },
      { id: "a6", category: "القانون العقاري", title: "الفرق بين الملكية المشتركة والملكية الفردية في قانون التسجيل العقاري", excerpt: "كيف يتم تسجيل العقار المشترك وما حقوق كل شريك وإجراءات القسمة والبيع.", content: "", author: "المحامية هدى كريم", authorId: "l6", date: "2025-11-10", readingTime: 7, hue: "from-purple-400 to-fuchsia-500", views: 756, status: "published" },
      { id: "a7", category: "الأحوال الشخصية", title: "إثبات النسب في القانون العراقي: الطرق الحديثة والقديمة", excerpt: "كيف يثبت النسب بالفراش والإقرار والبينة وفحوصات DNA وفق التشريعات العراقية.", content: "", author: "المحامية سارة ناصر", authorId: "l2", date: "2025-11-05", readingTime: 8, hue: "from-amber-400 to-orange-500", views: 1432, status: "published" },
    ];
    for (const article of articles) {
      await prisma.article.create({ data: article });
    }
    console.log(`  ✅ ${articles.length} articles`);
  }

  // ─── LEGAL TEMPLATES ───
  const tmplCount = await prisma.legalTemplate.count();
  if (tmplCount === 0) {
    const templates = [
      {
        name: "نموذج عقد إيجار عقار",
        category: "العقارات",
        description: "عقد إيجار موحد للأملاك السكنية والتجارية وفق القانون العراقي",
        variables: JSON.stringify([
          { id: "v1", name: "اسم المؤجر", placeholder: "اسم المؤجر", defaultValue: "", required: true },
          { id: "v2", name: "اسم المستأجر", placeholder: "اسم المستأجر", defaultValue: "", required: true },
          { id: "v3", name: "وصف العقار", placeholder: "وصف العقار (المساحة - الموقع)", defaultValue: "", required: true },
          { id: "v4", name: "مدة الإيجار", placeholder: "مدة الإيجار", defaultValue: "سنة واحدة", required: true },
          { id: "v5", name: "الأجرة الشهرية", placeholder: "الأجرة الشهرية", defaultValue: "", required: true },
          { id: "v6", name: "تاريخ العقد", placeholder: "تاريخ العقد", defaultValue: "", required: true },
        ]),
        keywords: JSON.stringify(["إيجار", "عقار", "عقد", "سكن", "أجرة"]),
        content: `عقد إيجار عقار

في تاريخ {{v6}} تم الاتفاق بين كل من:

أولاً: السيد/ {{v1}} (المؤجر)
ثانياً: السيد/ {{v2}} (المستأجر)

تم الاتفاق على الآتي:

المادة الأولى: محل العقد
يؤجر المؤجر للمستأجر العقار التالي: {{v3}}

المادة الثانية: مدة الإيجار
تبدأ مدة الإيجار من تاريخ التوقيع وتستمر لمدة {{v4}}.

المادة الثالثة: الأجرة
يلتزم المستأجر بدفع أجرة شهرية مقدارها {{v5}} دينار عراقي في موعد أقصاه اليوم الخامس من كل شهر.

المادة الرابعة: الضمان
يودع المستأجر مبلغاً تأمينياً يعادل إيجار شهرين يرد في نهاية العقد بعد خصم ما عليه.

المادة الخامسة: الصيانة
يلتزم المؤجر بالصيانة الأساسية للعقار، ويلتزم المستأجر بالصيانة اليومية.

المادة السادسة: إنهاء العقد
لكل من الطرفين إنهاء العقد بعد إشعار مسبق بشهر.

حرر في {{v6}}

{{v1}} — المؤجر
{{v2}} — المستأجر`,
        notes: "نموذج عقد إيجار مطابق للمادة 721 من القانون المدني العراقي",
      },
      {
        name: "نموذج عقد عمل",
        category: "قانون العمل",
        description: "عقد عمل موحد بين صاحب العمل والعامل وفق قانون العمل العراقي رقم 37 لسنة 2015",
        variables: JSON.stringify([
          { id: "v1", name: "اسم صاحب العمل", placeholder: "اسم صاحب العمل", defaultValue: "", required: true },
          { id: "v2", name: "اسم العامل", placeholder: "اسم العامل", defaultValue: "", required: true },
          { id: "v3", name: "طبيعة العمل", placeholder: "طبيعة العمل والمسمى الوظيفي", defaultValue: "", required: true },
          { id: "v4", name: "الراتب الشهري", placeholder: "الراتب الشهري", defaultValue: "", required: true },
          { id: "v5", name: "مدة العقد", placeholder: "مدة العقد", defaultValue: "سنة قابلة للتجديد", required: true },
          { id: "v6", name: "تاريخ العقد", placeholder: "تاريخ العقد", defaultValue: "", required: true },
        ]),
        keywords: JSON.stringify(["عمل", "عقد", "توظيف", "راتب", "عامل", "صاحب عمل"]),
        content: `عقد عمل

تم في تاريخ {{v6}} الاتفاق بين:

الطرف الأول: {{v1}} (صاحب العمل)
الطرف الثاني: {{v2}} (العامل)

بناءً على قانون العمل العراقي رقم 37 لسنة 2015 تم الاتفاق على الآتي:

المادة الأولى: المسمى الوظيفي
يُعين الطرف الثاني بوظيفة {{v3}}.

المادة الثانية: مدة العقد
يبرم هذا العقد لمدة {{v5}}، تبدأ من تاريخ التوقيع.

المادة الثالثة: الأجر
يتقاضى العامل أجراً شهرياً قدره {{v4}} دينار عراقي.

المادة الرابعة: ساعات العمل
ثماني ساعات يومياً، ويوم راحة أسبوعياً.

المادة الخامسة: الإجازات
يستحق العامل إجازة سنوية مدفوعة الأجر مدتها 30 يوماً.

المادة السادسة: إنهاء الخدمة
لكل من الطرفين إنهاء العقد بموجب إشعار قبله حسب القانون.

{{v1}}
{{v2}}`,
        notes: "نموذج عقد عمل لمدة محددة",
      },
      {
        name: "نموذج وكالة قانونية",
        category: "القانون المدني",
        description: "وكالة عامة أو خاصة تخول الوكيل صلاحية التصرف نيابة عن الموكل",
        variables: JSON.stringify([
          { id: "v1", name: "اسم الموكل", placeholder: "اسم الموكل", defaultValue: "", required: true },
          { id: "v2", name: "اسم الوكيل", placeholder: "اسم الوكيل", defaultValue: "", required: true },
          { id: "v3", name: "نوع الوكالة", placeholder: "عامة / خاصة", defaultValue: "عامة", required: true },
          { id: "v4", name: "نطاق الوكالة", placeholder: "صلاحيات الوكيل", defaultValue: "", required: true },
          { id: "v5", name: "تاريخ الوكالة", placeholder: "تاريخ الوكالة", defaultValue: "", required: true },
        ]),
        keywords: JSON.stringify(["وكالة", "توكيل", "موكل", "وكيل", "تصرف"]),
        content: `نموذج وكالة

بسم الله الرحمن الرحيم

تم في تاريخ {{v5}} تحرير هذه الوكالة بين:

الموكل: {{v1}}
الوكيل: {{v2}}

نوع الوكالة: {{v3}}

يخول الموكل بموجب هذه الوكالة الوكيل بالقيام بالآتي:
{{v4}}

يكون الوكيل مسؤولاً أمام الموكل بموجب أحكام الوكالة في القانون المدني العراقي.

حرر في {{v5}}

الموكل: {{v1}}
الوكيل: {{v2}}`,
        notes: "وكالة قابلة للتعديل حسب الحاجة",
      },
      {
        name: "نموذج عقد زواج رسمي",
        category: "الأحوال الشخصية",
        description: "نموذج عقد زواج شرعي مطابق لأحكام قانون الأحوال الشخصية العراقي",
        variables: JSON.stringify([
          { id: "v1", name: "اسم الزوج", placeholder: "اسم الزوج", defaultValue: "", required: true },
          { id: "v2", name: "اسم الزوجة", placeholder: "اسم الزوجة", defaultValue: "", required: true },
          { id: "v3", name: "المهر", placeholder: "المهر المقدم والمؤخر", defaultValue: "", required: true },
          { id: "v4", name: "الشهود", placeholder: "أسماء الشهود", defaultValue: "", required: true },
          { id: "v5", name: "تاريخ العقد", placeholder: "تاريخ العقد", defaultValue: "", required: true },
        ]),
        keywords: JSON.stringify(["زواج", "عقد", "مهر", "شهود", "أحوال شخصية", "شرعي"]),
        content: `عقد زواج

بسم الله الرحمن الرحيم
{ ﴿وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا﴾ }

تم في تاريخ {{v5}} عقد الزواج الشرعي بين:

الزوج: {{v1}}
الزوجة: {{v2}}

المهر: {{v3}} دينار عراقي

الشهود: {{v4}}

تم العقد وفق أحكام قانون الأحوال الشخصية العراقي.

حرر في {{v5}}
المأذون الشرعي`,
        notes: "نموذج عقد زواج شرعي",
      },
      {
        name: "نموذج صلح وتسوية ودية",
        category: "القانون المدني",
        description: "اتفاق صلح ودي لتسوية المنازعات دون اللجوء للتقاضي",
        variables: JSON.stringify([
          { id: "v1", name: "الطرف الأول", placeholder: "الطرف الأول", defaultValue: "", required: true },
          { id: "v2", name: "الطرف الثاني", placeholder: "الطرف الثاني", defaultValue: "", required: true },
          { id: "v3", name: "موضوع النزاع", placeholder: "موضوع النزاع", defaultValue: "", required: true },
          { id: "v4", name: "شروط التسوية", placeholder: "شروط التسوية", defaultValue: "", required: true },
          { id: "v5", name: "تاريخ الصلح", placeholder: "تاريخ الصلح", defaultValue: "", required: true },
        ]),
        keywords: JSON.stringify(["صلح", "تسوية", "ودية", "نزاع", "اتفاق"]),
        content: `اتفاق صلح وتسوية ودية

في تاريخ {{v5}} تم الاتفاق بين:

الطرف الأول: {{v1}}
الطرف الثاني: {{v2}}

بما أن بين الطرفين نزاع حول: {{v3}}
ورغبة منهما في إنهاء النزاع ودياً فقد اتفقا على الآتي:

المادة الأولى: يتنازل كل طرف عن دعواه تجاه الآخر.
المادة الثانية: يلتزم الطرفان بشروط التسوية التالية: {{v4}}
المادة الثالثة: يعتبر هذا الاتفاق نهائياً وملزماً للطرفين.
المادة الرابعة: في حال الإخلال بالاتفاق يحق للطرف الآخر الرجوع للقضاء.

حرر في {{v5}}

الطرف الأول: {{v1}}
الطرف الثاني: {{v2}}
الشاهد`,
        notes: "صلح ودي قبل التقاضي",
      },
    ];
    for (const tmpl of templates) {
      await prisma.legalTemplate.create({ data: tmpl });
    }
    console.log(`  ✅ ${templates.length} legal templates`);
  }

  // ─── SITE CONFIG (logo + site name) ───
  const existingLogoConfig = await prisma.siteConfig.findUnique({ where: { key: "logo" } });
  if (!existingLogoConfig) {
    await prisma.siteConfig.create({ data: { key: "logo", value: "/qanuni/logo.png" } });
    await prisma.siteConfig.create({ data: { key: "siteName", value: "قانوني" } });
    console.log("  ✅ Site config (logo, site name)");
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
