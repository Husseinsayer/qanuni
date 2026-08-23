"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionTitle, Card } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/components/reveal";
import { useSiteData } from "@/lib/use-site-data";
import { iconMap } from "@/lib/icons";
import { ArrowLeft, FileText, MessageSquare, Receipt, Users, HeartHandshake } from "lucide-react";

const FALLBACK_SERVICES = [
  {
    id: "s1",
    title: "نماذج قانونية",
    desc: "نماذج جاهزة للعقود والطلبات القانونية جاهزة للتحميل والتعديل",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
    href: "/legal-templates",
  },
  {
    id: "s2",
    title: "حاسبة الميراث",
    desc: "احسب نصيب كل وارث حسب الشريعة الإسلامية والقانون العراقي",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    href: "/inheritance",
  },
  {
    id: "s3",
    title: "حاسبة النفقة",
    desc: "حساب نفقة الزوجة والأطفال حسب القانون العراقي",
    icon: HeartHandshake,
    color: "from-rose-500 to-pink-600",
    href: "/services",
  },
  {
    id: "s4",
    title: "حاسبة الرسوم القضائية",
    desc: "احسب الرسوم المحكمة للمطالبات المالية والدعاوى القضائية",
    icon: Receipt,
    color: "from-amber-500 to-orange-600",
    href: "/services",
  },
  {
    id: "s5",
    title: "الاستشارات القانونية",
    desc: "احصل على استشارة قانونية متخصصة من أفضل المحامين العراقيين",
    icon: MessageSquare,
    color: "from-violet-500 to-purple-600",
    href: "/contact",
  },
];

const iconColorMap: Record<string, string> = {
  FileText: "from-blue-500 to-indigo-600",
  Users: "from-emerald-500 to-teal-600",
  HeartHandshake: "from-rose-500 to-pink-600",
  Receipt: "from-amber-500 to-orange-600",
  MessageSquare: "from-violet-500 to-purple-600",
  Scale: "from-slate-600 to-slate-800",
  Gavel: "from-red-500 to-rose-600",
  Building2: "from-cyan-500 to-blue-600",
  Landmark: "from-indigo-500 to-violet-600",
  Briefcase: "from-emerald-500 to-teal-600",
};

export function ServicesSection() {
  const { services: adminServices } = useSiteData();

  const displayServices =
    adminServices.length > 0
      ? adminServices.map((s) => ({
          id: s.id,
          title: s.title,
          desc: s.desc,
          icon: iconMap[s.icon] || FileText,
          color: iconColorMap[s.icon] || "from-secondary to-accent",
          href: "/services",
        }))
      : FALLBACK_SERVICES;

  return (
    <section id="services" className="scroll-mt-20 bg-gradient-to-b from-muted/30 to-background py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="خدماتنا القانونية"
          title="حلول قانونية شاملة ومتكاملة"
          subtitle="نقدم مجموعة متنوعة من الخدمات القانونية المتخصصة لتلبية جميع احتياجاتك القانونية"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        >
          {displayServices.map((s) => {
            const Icon = s.icon;
            const color = s.color || "from-secondary to-accent";
            return (
              <motion.div key={s.id} variants={fadeUp}>
                <Link href={s.href || "/services"} className="block h-full group">
                  <Card className="card-hover h-full p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-1">
                    <div
                      className={`mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                    >
                      <Icon className="size-7" />
                    </div>
                    <h3 className="text-base font-bold md:text-lg">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    <div className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                      <span>اطلب الخدمة</span>
                      <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="mb-4 text-muted-foreground">استعرض جميع خدماتنا القانونية في مكان واحد</p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90 hover:shadow-lg"
          >
            عرض قسم الخدمات
            <ArrowLeft className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
