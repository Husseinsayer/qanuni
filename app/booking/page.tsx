"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Check, Clock, Video, MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { lawyers } from "@/lib/data";
import { cn, toArabicDigits } from "@/lib/utils";

const slots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

export default function BookingPage() {
  const [lawyer, setLawyer] = React.useState(lawyers[0].id);
  const [mode, setMode] = React.useState<"video" | "phone" | "office">("video");
  const [slot, setSlot] = React.useState(slots[0]);
  const [done, setDone] = React.useState(false);

  const selected = lawyers.find((l) => l.id === lawyer)!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="حجز استشارة"
        title="احجز استشارة قانونية"
        subtitle="اختر المحامي ووقت الاستشارة المناسب لك في خطوات بسيطة."
        crumbs={[{ label: "الرئيسية", href: "/" }, { label: "حجز استشارة" }]}
      />

      <div className="container grid gap-6 pb-20 lg:grid-cols-[1fr_360px]">
        <div>
          {done ? (
            <Card className="grid place-items-center p-12 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-success/15 text-success">
                <Check className="size-8" />
              </span>
              <h3 className="mt-4 text-xl font-bold">تم تأكيد طلب الحجز</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                سيتواصل {selected.name} معك لتأكيد الموعد. (صفحة تجريبية)
              </p>
              <a href="/lawyers" className="mt-5 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white">
                العودة للمحامين
              </a>
            </Card>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-bold">1. اختر المحامي</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {lawyers.map((l) => (
                    <button
                      type="button"
                      key={l.id}
                      onClick={() => setLawyer(l.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 text-right transition",
                        lawyer === l.id ? "border-accent bg-accent/5" : "border-border hover:border-accent"
                      )}
                    >
                      <span className={cn("grid size-10 place-items-center rounded-xl bg-gradient-to-br text-sm font-bold text-white", l.hue)}>
                        {l.initials}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{l.name}</span>
                        <span className="block text-xs text-muted-foreground">{l.specialization}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 text-lg font-bold">2. نوع الاستشارة</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: "video", label: "مكالمة فيديو", icon: Video },
                    { id: "phone", label: "اتصال هاتفي", icon: Clock },
                    { id: "office", label: "زيارة المكتب", icon: MapPin },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMode(m.id as typeof mode)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 transition",
                        mode === m.id ? "border-accent bg-accent/5" : "border-border hover:border-accent"
                      )}
                    >
                      <m.icon className="size-5 text-accent" />
                      <span className="text-sm font-semibold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 text-lg font-bold">3. اختر الوقت</h3>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSlot(s)}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                        slot === s ? "border-accent bg-accent text-white" : "border-border hover:border-accent"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input required placeholder="اسمك" className="h-11 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
                  <input required type="tel" placeholder="رقم الهاتف" className="h-11 rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent" />
                </div>
              </Card>

              <Button type="submit" variant="accent" size="lg" className="w-full gap-2">
                <CalendarCheck className="size-4" /> تأكيد الحجز
              </Button>
            </form>
          )}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-bold">ملخص الحجز</h3>
            <div className="space-y-3 text-sm">
              <Row label="المحامي" value={selected.name} />
              <Row label="التخصص" value={selected.specialization} />
              <Row label="النوع" value={mode === "video" ? "مكالمة فيديو" : mode === "phone" ? "اتصال هاتفي" : "زيارة المكتب"} />
              <Row label="الوقت" value={slot} />
              <Row label="السعر" value={`${toArabicDigits(selected.price)} ألف د.ع`} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
