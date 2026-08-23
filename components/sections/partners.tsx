"use client";

import { motion } from "framer-motion";
import { SectionTitle, Card } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/components/reveal";
import { useSiteData } from "@/lib/use-site-data";
import { iconMap } from "@/lib/icons";
import { Building2 } from "lucide-react";

const defaultPartners = [
  { id: "p1", name: "وزارة العدل العراقية", title: "شريك استراتيجي", icon: "Landmark", url: "#" },
  { id: "p2", name: "مجلس القضاء الأعلى", title: "شريك مؤسسي", icon: "Scale", url: "#" },
  { id: "p3", name: "نقابة المحامين العراقيين", title: "شريك رسمي", icon: "Users", url: "#" },
  { id: "p4", name: "هيئة ال찡اف العراقية", title: "شريك مؤسسي", icon: "ShieldCheck", url: "#" },
];

export function Partners() {
  const { partners: dbPartners } = useSiteData();
  const partnerData = dbPartners.length > 0 ? dbPartners : defaultPartners;

  return (
    <section id="partners" className="scroll-mt-20 bg-muted/30 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="شركاؤنا"
          title="الجهات الرسمية والمؤسسات الشريكة"
          subtitle="نعمل مع أبرز المؤسسات القانونية والقضائية في العراق"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {partnerData.map((p) => {
            const Icon = (iconMap as Record<string, React.ComponentType<{ className?: string }>>)[p.icon] ?? Building2;
            return (
              <motion.div key={p.id} variants={fadeUp}>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  <Card className="card-hover group relative h-full overflow-hidden p-6 text-center transition-all duration-300 hover:shadow-md">
                    <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-accent/5 blur-2xl transition group-hover:bg-accent/15" />
                    <div className="relative">
                      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl border border-accent/20 bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                        <Icon className="size-8" />
                      </div>
                      <h3 className="text-lg font-bold">{p.name}</h3>
                      <p className="mt-1 text-sm text-accent">{p.title}</p>
                    </div>
                  </Card>
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
