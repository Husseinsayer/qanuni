"use client";

import { motion } from "framer-motion";
import { SectionTitle, Card } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/components/reveal";
import { features } from "@/lib/data";

export function WhyUs() {
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
          {features.map((f) => {
            const Icon = f.icon;
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
