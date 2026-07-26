"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/components/reveal";
import { services } from "@/lib/data";
import { getKnowledgeData } from "@/lib/knowledge-center/store";
import type { LegalTemplate } from "@/lib/knowledge-center/types";
import {
  Scale,
  FileText,
  Building2,
  Users,
  HeartHandshake,
  Briefcase,
  Landmark,
  ShieldCheck,
  Gavel,
  Network,
  ArrowLeft,
  Clock,
  ExternalLink,
  Printer,
  Download,
  Copy,
  CheckCircle,
  Wrench,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Scale,
  FileText,
  Building2,
  Users,
  HeartHandshake,
  Briefcase,
  Landmark,
  ShieldCheck,
  Gavel,
  Network,
};

export default function ServicesPage() {
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      const data = getKnowledgeData();
      setTemplates(data.templates.filter((t) => t.isActive && !t.deletedAt));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <PageHeader
        eyebrow="خدماتنا"
        title="الخدمات القانونية"
        subtitle="حلول قانونية متكاملة تغطي جميع جوانب حياتك العملية والشخصية."
        crumbs={[{ label: "الرئيسية", href: "/" }, { label: "الخدمات" }]}
      />

      {/* ===== services grid ===== */}
      <section className="container py-12 md:py-16">
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
            const Icon = iconMap[s.icon?.name] || FileText;
            const isAvailable = true; // all base services available
            return (
              <motion.div key={s.id} variants={fadeUp}>
                <a
                  href={isAvailable ? "/contact" : "/services/coming-soon"}
                  className="block h-full group"
                >
                  <Card className="card-hover h-full p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-1">
                    <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-secondary to-accent text-white shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                      <Icon className="size-7" />
                    </div>
                    <h3 className="text-base font-bold md:text-lg">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    <div className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                      <span>{isAvailable ? "اطلب الخدمة" : "قريباً"}</span>
                      <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </Card>
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ===== Legal Templates Section ===== */}
      <section className="container border-t border-border py-12 md:py-16">
        <SectionTitle
          eyebrow="نماذج قانونية"
          title="نماذج قانونية جاهزة"
          subtitle="نماذج قانونية احترافية يمكنك تحميلها واستخدامها مباشرة"
        />

        {loading ? (
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border-0 bg-muted/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="mt-2 h-3 w-16 rounded bg-muted" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border py-12 text-center">
            <FileText className="mx-auto mb-4 size-12 text-muted-foreground/30" />
            <p className="text-lg font-semibold">لا توجد نماذج قانونية بعد</p>
            <p className="text-sm text-muted-foreground">سيتم إضافة النماذج قريباً من إدارة المحتوى</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((tmpl) => (
              <Card
                key={tmpl.id}
                className="group cursor-pointer border-0 shadow-soft transition-all hover:shadow-lg hover:border-accent/30 hover:-translate-y-1"
                onClick={() => setSelectedTemplate(tmpl)}
              >
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">{tmpl.name}</h3>
                      <span className="text-xs text-muted-foreground">{tmpl.category}</span>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{tmpl.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {new Date(tmpl.updatedAt).toLocaleDateString("ar-IQ")}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition-all group-hover:opacity-100">
                      <span>عرض النموذج</span>
                      <ArrowLeft className="size-3" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ===== Template Preview Modal ===== */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedTemplate.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedTemplate.content)}
                  className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold transition hover:bg-muted/50"
                >
                  {copied ? <CheckCircle className="size-4 text-green-600" /> : <Copy className="size-4" />}
                  {copied ? "تم النسخ" : "نسخ"}
                </button>
                <button
                  onClick={() => {
                    const w = window.open("", "_blank");
                    if (w) {
                      // Sanitize content to prevent XSS
                      const sanitize = (str: string) => str
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                      const safeName = sanitize(selectedTemplate.name);
                      const safeContent = sanitize(selectedTemplate.content);
                      w.document.write(`<html dir="rtl"><head><title>${safeName}</title><style>body{font-family:sans-serif;padding:40px;line-height:1.8;white-space:pre-wrap}</style></head><body>${safeContent}</body></html>`);
                      w.document.close();
                      w.print();
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold transition hover:bg-muted/50"
                >
                  <Printer className="size-4" />
                  طباعة
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="rounded-xl border border-border px-3 py-2 text-sm font-semibold transition hover:bg-muted/50"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
              <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-7">
                {selectedTemplate.content}
              </div>

              {/* Variables */}
              {selectedTemplate.variables.length > 0 && (
                <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                  <h3 className="mb-3 font-bold text-sm">المتغيرات المتاحة</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map((v) => (
                      <span
                        key={v.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
                      >
                        <Wrench className="size-3" />
                        {v.name}
                        {v.required && <span className="text-red-500">*</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
