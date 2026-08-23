"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Scale, BookOpen, Hash, UserRound, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { Reveal } from "@/components/reveal";
import { useSiteData } from "@/lib/use-site-data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const tabs = [
  { id: "law", label: "قانون", icon: Scale, placeholder: "ابحث باسم القانون...", example: "القانون المدني" },
  { id: "article", label: "مادة", icon: BookOpen, placeholder: "ابحث بنص المادة...", example: "الحضانة" },
  { id: "number", label: "رقم قانون", icon: Hash, placeholder: "أدخل رقم القانون...", example: "40 لسنة 1951" },
  { id: "lawyer", label: "اسم محام", icon: UserRound, placeholder: "ابحث باسم المحامي...", example: "محمد" },
] as const;

export function Hero() {
  const [tab, setTab] = React.useState<(typeof tabs)[number]["id"]>("law");
  const active = tabs.find((t) => t.id === tab)!;
  const router = useRouter();
  const { hero, stats, logo } = useSiteData();
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.06] via-background to-background" />
        <div className="absolute -right-24 -top-24 size-[26rem] rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -left-24 top-32 size-[22rem] rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute inset-0 bg-grid-light bg-[size:38px_38px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:bg-grid-dark" />
      </div>

      <div className="container grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-8">
        {/* Text */}
        <div className="text-right">
          <Reveal>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
              <ShieldCheck className="size-4" /> {hero.badge || "منصة قانونية عراقية موثوقة"}
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-3xl font-extrabold leading-[1.6] tracking-tight sm:text-4xl md:text-5xl md:leading-[1.45]">
              {hero.title || "دليلك الذكي للقوانين"}
              <br />
              <span className="text-gradient">{hero.titleGradient || "العراقية والمحامين"}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {hero.subtitle || "ابحث في آلاف المواد القانونية، اعثر على أفضل المحامين، واقرأ أحدث المقالات القانونية في مكان واحد."}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/laws" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "contents")}>
                {hero.btnPrimary || "استكشف القوانين"}
              </Link>
              <Link href="/lawyers" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "contents")}>
                {hero.btnSecondary || "ابحث عن محام"}
              </Link>
            </div>
          </Reveal>

          {/* Search box */}
          <Reveal delay={0.2}>
            <div className="mt-10 rounded-3xl border border-border bg-card/80 p-3 shadow-premium backdrop-blur-xl">
              <div className="flex flex-wrap gap-1 rounded-2xl bg-muted/50 p-1">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const isActive = t.id === tab;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                        isActive
                          ? "bg-background text-accent shadow-soft"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2 p-1">
                <input
                  ref={searchInputRef}
                  className="hero-search-input h-12 flex-1 rounded-xl bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={active.placeholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = searchInputRef.current?.value.trim();
                      if (!val) return;
                      const q = encodeURIComponent(val);
                      router.push(tab === "lawyer" ? `/lawyers?q=${q}` : `/laws?q=${q}`);
                    }
                  }}
                />
                <Button
                  variant="accent"
                  size="lg"
                  className="gap-2"
                  onClick={() => {
                    const val = searchInputRef.current?.value.trim();
                    if (!val) return;
                    const q = encodeURIComponent(val);
                    router.push(tab === "lawyer" ? `/lawyers?q=${q}` : `/laws?q=${q}`);
                  }}
                >
                  <Search className="size-4" /> بحث
                </Button>
              </div>
              <p className="px-4 pb-2 pt-1 text-xs text-muted-foreground">
                مثال: {active.example}
              </p>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.25}>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-extrabold text-foreground md:text-3xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground md:text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Visual */}
        <Reveal delay={0.1} className="relative hidden md:block">
          <div className="relative mx-auto w-full max-w-md">
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[18rem] -left-24"
            >
              <img
                src={logo || "/qanuni/logo.png"}
                alt="قانوني"
                loading="lazy"
                className="w-[30rem] drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
