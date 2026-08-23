"use client";

import { motion } from "framer-motion";
import { SectionTitle, Card } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/components/reveal";
import { useSiteData } from "@/lib/use-site-data";
import { iconMap } from "@/lib/icons";
import { Scale } from "lucide-react";

const defaultFeatures = [
  { id: "f1", title: "محامون موثوقون", desc: "نتحقق من ترخيص وهوية كل محامٍ قبل نشر ملفه.", icon: "ShieldCheck" },
  { id: "f2", title: "معلومات موثقة", desc: "نصوص القوانين مأخوذة من المصادر الرسمية ومحدثة.", icon: "FileText" },
  { id: "f3", title: "قوانين عراقية محدثة", desc: "أحدث التعديلات والتشريعات النافذة أولاً بأول.", icon: "Scale" },
  { id: "f4", title: "بحث سريع", desc: "وصول فوري لأي مادة قانونية أو محامٍ خلال ثوانٍ.", icon: "Sparkles" },
  { id: "f5", title: "منصة آمنة", desc: "تشفير كامل لبياناتك وخصوصية مضمونة.", icon: "ShieldCheck" },
  { id: "f6", title: "دعم احترافي", desc: "فريق متخصص يجيب على استفساراتك على مدار الساعة.", icon: "Users" },
];

export function WhyUs() {
  const { features: dbFeatures } = useSiteData();
  const featureData = dbFeatures.length > 0 ? dbFeatures : defaultFeatures;
  return (
    <section id="about" className="scroll-mt-20 bg-muted/30 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="لماذا نحن"
          title="لماذا تثق بمنصة قانوني"
          subtitle="نجمع بين الموثوقية والتقنية لخدمة المواطن العراقي"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featureData.map((f) => {
            const Icon = (iconMap as Record<string, React.ComponentType<{ className?: string }>>)[f.icon] ?? Scale;
            return (
              <motion.div key={f.id} variants={fadeUp}>
                <Card className="card-hover group relative h-full overflow-hidden p-6">
                  <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-accent/5 blur-2xl transition group-hover:bg-accent/15" />
                  <div className="relative">
                    <div className="mb-4 grid size-14 place-items-center rounded-2xl border border-accent/20 bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
