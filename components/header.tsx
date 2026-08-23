"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
  FileText,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/data";

import { useSiteData } from "@/lib/use-site-data";

export function SiteHeader() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { data: session, status } = useSession();
  const { logo, siteName, registrationEnabled } = useSiteData();
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const loggedIn = status === "authenticated" && !!session?.user;
  const userName = (session?.user as any)?.name ?? "";
  const userRole = (session?.user as any)?.role ?? "";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  const isDark = mounted ? (resolvedTheme ?? theme) === "dark" : false;

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut({ redirect: false });
    router.push("/");
  };

  const dashboardUrl = userRole === "admin" ? "/admin" : userRole === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "glass shadow-premium" : "bg-background/80 backdrop-blur-md"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo (right / RTL start) */}
        <Link href="/" className="flex shrink-0 items-center gap-3 overflow-hidden">
          <img src={logo || "/qanuni/logo.png"} alt={siteName || "قانوني"} loading="lazy" className="size-10 rounded-xl object-contain" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tight">{siteName || "قانوني"}</span>
            <span className="text-[11px] text-muted-foreground">الدليل القانوني العراقي</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster (left / RTL end) */}
        <div className="flex items-center gap-2">
          {/* تم حذف زر طلب الخدمة وجرس الإشعارات بناءً على طلب المستخدم */}

          <button
            aria-label="تبديل الوضع الداكن"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="grid size-10 place-items-center rounded-xl border border-border text-foreground transition hover:bg-muted/60"
          >
            {mounted ? (
              isDark ? <Sun className="size-4" /> : <Moon className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>

          {/* Desktop User Menu */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            {loggedIn ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border border-border px-3 py-2 transition-all",
                    dropdownOpen ? "border-accent bg-accent/5 shadow-sm" : "hover:border-accent/50 hover:bg-muted/30"
                  )}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white">
                    {userName.charAt(0)}
                  </span>
                  <span className="hidden text-sm font-semibold lg:block">{userName}</span>
                  <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 w-56 origin-top-left overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-premium"
                    >
                      <div className="mb-1 border-b border-border px-3 py-2.5">
                        <p className="text-sm font-bold truncate">{userName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRole === "lawyer" ? "محامٍ" : "مستخدم"}</p>
                      </div>

                      <Link
                        href={dashboardUrl}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-accent/10 hover:text-accent"
                      >
                        <LayoutDashboard className="size-4" />
                        {userRole === "admin" ? "لوحة التحكم" : userRole === "lawyer" ? "لوحة المحامي" : "حسابي"}
                      </Link>
                      <Link
                        href="/lawyers"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-accent/10 hover:text-accent"
                      >
                        <FileText className="size-4" />
                        دليل المحامين
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-accent/10 hover:text-accent"
                      >
                        <HelpCircle className="size-4" />
                        مساعدة
                      </Link>
                      <div className="mt-1 border-t border-border pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/10"
                        >
                          <LogOut className="size-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-all",
                      dropdownOpen ? "border-accent bg-accent/5" : "hover:border-accent/50 hover:bg-muted/30"
                    )}
                  >
                    <User className="size-4" />
                    حسابي
                    <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-48 origin-top-left overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-premium"
                      >
                        <Link
                          href="/auth/login"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-accent/10 hover:text-accent"
                        >
                          <LogOut className="size-4" />
                          تسجيل الدخول
                        </Link>
                        {registrationEnabled !== false && (
                          <Link
                            href="/auth/register"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl bg-accent/10 px-3 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/20"
                          >
                            <User className="size-4" />
                            إنشاء حساب
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label="القائمة"
            onClick={() => setMobileOpen(true)}
            className="relative z-10 grid size-10 shrink-0 place-items-center rounded-xl border border-border lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col bg-background p-6 shadow-premium"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2 font-extrabold">
                  <img src={logo || "/qanuni/logo.png"} alt={siteName || "قانوني"} loading="lazy" className="size-6 rounded-lg object-contain" /> {siteName || "قانوني"}
                </span>
                <button
                  aria-label="إغلاق"
                  onClick={() => setMobileOpen(false)}
                  className="grid size-9 place-items-center rounded-lg border border-border"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-semibold transition hover:bg-muted/60 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2 pt-6">
                {/* تم حذف زر طلب الخدمة من الجوال */}

                {loggedIn ? (
                  <>
                    <Link
                      href={dashboardUrl}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-semibold text-accent transition hover:bg-muted/60"
                    >
                      <LayoutDashboard className="size-5" />
                      {userRole === "lawyer" ? "لوحة المحامي" : "حسابي"}
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-semibold text-danger transition hover:bg-muted/60"
                    >
                      <LogOut className="size-5" />
                      تسجيل الخروج
                    </button>
                    <div className="px-3 pt-1 text-sm text-muted-foreground">
                      مرحباً، {userName}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-semibold transition hover:bg-muted/60 hover:text-accent"
                    >
                      <LogOut className="size-5" />
                      تسجيل الدخول
                    </Link>
                    {registrationEnabled !== false && (
                      <Link
                        href="/auth/register"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl bg-accent px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-accent/90"
                      >
                        إنشاء حساب
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
