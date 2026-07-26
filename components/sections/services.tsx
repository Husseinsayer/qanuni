"use client";

import { motion } from "framer-motion";
import { SectionTitle, Card } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/components/reveal";
import { services } from "@/lib/data";
import { ArrowLeft } from "lucide-react";

export function ServicesSection() {
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
           {services.map((s) => {
             const Icon = s.icon;
             return (
               <motion.div key={s.id} variants={fadeUp}>
                   <a href="/contact" className="block h-full group">
                   <Card className="card-hover h-full p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-1">
                     <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-secondary to-accent text-white shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                       <Icon className="size-7" />
                     </div>
                     <h3 className="text-base font-bold md:text-lg">{s.title}</h3>
                     <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                     <div className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                       <span>اطلب الخدمة</span>
                       <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                     </div>
                   </Card>
                 </a>
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
          <p className="mb-4 text-muted-foreground">لم تجد الخدمة التي تبحث عنها؟</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90 hover:shadow-lg"
          >
            تواصل معنا الآن
            <ArrowLeft className="size-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
