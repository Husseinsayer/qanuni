"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AdBanner } from "@/components/ad-banner";
import {
  FileText,
  MessageSquare,
  ArrowLeft,
  Receipt,
  Users,
  HeartHandshake,
} from "lucide-react";

const SERVICES = [
  {
    title: "نماذج قانونية",
    desc: "نماذج جاهزة للعقود والطلبات القانونية جاهزة للتحميل والتعديل",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
    href: "/legal-templates",
  },
  {
    title: "حاسبة الميراث",
    desc: "احسب نصيب كل وارث حسب الشريعة الإسلامية والقانون العراقي",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    href: "/inheritance",
  },
  {
    title: "حاسبة النفقة",
    desc: "حساب نفقة الزوجة والأطفال حسب القانون العراقي",
    icon: HeartHandshake,
    color: "from-rose-500 to-pink-600",
    href: "/contact",
  },
  {
    title: "حاسبة الرسوم القضائية",
    desc: "احسب الرسوم المحكمة للمطالبات المالية والدعاوى القضائية",
    icon: Receipt,
    color: "from-amber-500 to-orange-600",
    href: "/contact",
  },
  {
    title: "الاستشارات القانونية",
    desc: "احصل على استشارة قانونية متخصصة من أفضل المحامين العراقيين",
    icon: MessageSquare,
    color: "from-violet-500 to-purple-600",
    href: "/contact",
  },
];

export function ServicesContent() {
  return (
    <>
      <AdBanner placementKey="services-top" />

      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((svc) => (
            <Link key={svc.title} href={svc.href} className="group block text-right">
              <Card className="relative h-full overflow-hidden border border-border/50 p-6 transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-1">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${svc.color}`} />

                <div className="flex items-start gap-4 pt-4">
                  <div
                    className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${svc.color} text-white shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                  >
                    <svc.icon className="size-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold">{svc.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {svc.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  <span>ابدأ الآن</span>
                  <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
