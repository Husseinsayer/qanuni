"use client";

import * as React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const legalLinks = [
  { label: "سياسة الخصوصية", href: "/legal/privacy" },
  { label: "الشروط والأحكام", href: "/legal/terms" },
  { label: "اتفاقية الاستخدام", href: "/legal/terms" },
  { label: "ملفات تعريف الارتباط", href: "/legal/privacy" },
];

const socials: { Icon: React.ComponentType<{ className?: string }>; href: string; label: string }[] = [
  { Icon: Facebook, href: "https://facebook.com/iqlegal", label: "فيسبوك" },
  { Icon: Twitter, href: "https://twitter.com/iqlegal", label: "إكس" },
  { Icon: Instagram, href: "https://instagram.com/iqlegal", label: "إنستغرام" },
  { Icon: Linkedin, href: "https://linkedin.com/company/iqlegal", label: "لينكدإن" },
  { Icon: Youtube, href: "https://youtube.com/@iqlegal", label: "يوتيوب" },
];

export function SiteFooter() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setDone(true);
    setEmail("");
  };

  return (
    <footer className="relative overflow-hidden bg-primary text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_55%)]" />
      <div className="container relative py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="قانوني" loading="lazy" className="size-10 rounded-xl object-contain" />
              <span className="text-xl font-extrabold">قانوني</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              منصة عراقية موثوقة تجمع القوانين والمحامين والمعرفة القانونية في مكان واحد، لخدمة المواطن العراقي بكل ثقة.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-accent"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white/90">روابط سريعة</h4>
            <ul className="space-y-2.5">
              {[
                { label: "الرئيسية", href: "/" },
                { label: "القوانين العراقية", href: "/laws" },
                { label: "دليل المحامين", href: "/lawyers" },
                { label: "مكاتب المحامين", href: "/law-firms" },
                { label: "الخدمات", href: "/services" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-white/70 transition hover:text-gold">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white/90">روابط قانونية</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-white/70 transition hover:text-gold">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white/90">النشرة البريدية</h4>
            <p className="text-sm text-white/70">اشترك ليصلك كل جديد في القانون العراقي.</p>
            {done ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/20 px-4 py-3 text-sm font-semibold text-success">
                <Check className="size-4" /> تم اشتراكك بنجاح
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني"
                  className="h-11 rounded-xl bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/50 focus:ring-2 focus:ring-gold/50"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-bold text-[#1F2937] transition hover:brightness-105"
                >
                  <Send className="size-4" /> اشتراك
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-sm text-white/60 md:flex-row md:text-right">
          <p>© 2026 منصة قانوني. جميع الحقوق محفوظة.</p>
          <p>صُمم بعناية لخدمة العدالة في العراق</p>
        </div>
      </div>
    </footer>
  );
}
