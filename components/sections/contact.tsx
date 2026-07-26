"use client";

import * as React from "react";
import { Phone, Mail, MapPin, Clock, Send, Check } from "lucide-react";
import { SectionTitle, Card } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";

const subjects = ["استشارة قانونية", "شكوى", "اقتراح", "أخرى"];

export function ContactSection() {
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", subject: subjects[0], message: "" });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="scroll-mt-20 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="تواصل معنا"
          title="نحن هنا لخدمتك"
          subtitle="أرسل استفسارك وسيتواصل معك فريقنا المختص"
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Info */}
          <Reveal>
            <Card className="h-full p-8">
              <h3 className="text-xl font-bold">معلومات التواصل</h3>
              <div className="mt-6 space-y-4">
                {[
                  { icon: Phone, label: "الهاتف", value: "+964 700 000 0000" },
                  { icon: Mail, label: "البريد الإلكتروني", value: "info@iqlegal.example" },
                  { icon: MapPin, label: "العنوان", value: "بغداد — الكرخ، شارع الرشيد" },
                  { icon: Clock, label: "ساعات العمل", value: "السبت — الخميس · 9 ص — 5 م" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-4 rounded-xl border border-border p-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                      <row.icon className="size-5" />
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <p className="font-semibold">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder — replace with Google Maps embed when API key available */}
              <div className="relative mt-6 grid h-44 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20">
                <MapPin className="size-10 text-accent" />
                <span className="absolute bottom-3 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground">
                  خريطة الموقع (Google Maps)
                </span>
              </div>
            </Card>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1}>
            <Card className="h-full p-8">
              {sent ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <span className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
                      <Check className="size-7" />
                    </span>
                    <h3 className="mt-4 text-xl font-bold">تم إرسال رسالتك بنجاح</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      شكراً لتواصلك معنا، سيتواصل فريقنا معك قريباً.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-5 rounded-xl border border-border px-5 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent"
                    >
                      إرسال رسالة أخرى
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">الاسم الكامل</label>
                    <input
                      required
                      value={form.name}
                      onChange={update("name")}
                      className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent"
                      placeholder="اسمك"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">البريد الإلكتروني</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">الموضوع</label>
                    <select
                      value={form.subject}
                      onChange={update("subject")}
                      className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent"
                    >
                      {subjects.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">الرسالة</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={update("message")}
                      className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-accent"
                      placeholder="اكتب رسالتك..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
                  >
                    <Send className="size-4" /> إرسال الرسالة
                  </button>
                </form>
              )}
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
