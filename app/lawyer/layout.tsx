"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, User, Palette, LogOut, DollarSign, Clock, Star, BarChart3,
  Scale, Menu, X, PanelRightClose, PanelRightOpen,
  Sun, Moon, Bell, Mail, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

const navItems: NavItem[] = [
  { label: "لوحة التحكم", href: "/lawyer/dashboard", icon: LayoutDashboard },
  { label: "الملف الشخصي", href: "/lawyer/profile", icon: User },
  { label: "المقالات", href: "/lawyer/dashboard/articles", icon: FileText },
  { label: "الرسائل", href: "/lawyer/messages", icon: Mail },
  { label: "المظهر", href: "/lawyer/appearance", icon: Palette },
  { label: "الخدمات", href: "/lawyer/services", icon: DollarSign },
  { label: "مواعيد العمل", href: "/lawyer/schedule", icon: Clock },
  { label: "التقييمات", href: "/lawyer/reviews", icon: Star },
  { label: "التحليلات", href: "/lawyer/analytics", icon: BarChart3 },
];

function LawyerSidebar({ collapsed, onToggle, mobileOpen, onMobileClose, session }: {
  collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onMobileClose: () => void;
  session: { name?: string | null };
}) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
          <Scale className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">لوحة المحامي</span>
            <span className="text-xs text-white/60">{session?.name ?? ""}</span>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center",
                active
                  ? "bg-accent text-white shadow-glow"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          {collapsed ? <PanelRightOpen className="h-5 w-5" /> : <><PanelRightClose className="h-5 w-5" /><span>طي القائمة</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-l border-white/10 gradient-primary transition-all duration-300 lg:flex",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}>
        {sidebarContent}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute inset-y-0 right-0 w-[240px] gradient-primary shadow-premium">
            <button onClick={onMobileClose} className="absolute left-3 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

function bridgeSession(session: { id: string; name?: string | null; email?: string | null }) {
  if (typeof window === "undefined") return;
  const expiry = Date.now() + 1000 * 60 * 60 * 24;
  const localStorageSession = {
    userId: session.id,
    name: session.name || "",
    email: session.email || "",
    role: "lawyer" as const,
    token: crypto.randomUUID(),
    expiry,
  };
  localStorage.setItem("user_session", JSON.stringify(localStorageSession));

  const accountsRaw = localStorage.getItem("user_accounts");
  const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];
  const hasAccount = accounts.some((a: { email: string }) => a.email === session.email);
  if (!hasAccount) {
    accounts.push({
      id: session.id,
      name: session.name || "",
      email: session.email || "",
      phone: "",
      passwordHash: "",
      role: "lawyer",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("user_accounts", JSON.stringify(accounts));
  }
}

function seedProfileFromDB() {
  if (typeof window === "undefined") return;
  const sessionRaw = localStorage.getItem("user_session");
  let sessionUserId = "";
  try {
    const s = sessionRaw ? JSON.parse(sessionRaw) : null;
    sessionUserId = s?.userId || "";
  } catch {}

  fetch("/api/lawyer/profile")
    .then((r) => r.json())
    .then((data) => {
      if (data.lawyer) {
        const lawyer = data.lawyer;
        const languages = typeof lawyer.languages === "string" ? JSON.parse(lawyer.languages) : lawyer.languages || ["العربية"];
        const profileId = sessionUserId || lawyer.id;
        const profile = {
          id: profileId,
          dbLawyerId: lawyer.id,
          name: data.user?.name || lawyer.name,
          slug: lawyer.slug || "",
          city: lawyer.city || "بغداد",
          specialization: lawyer.specialization || "القانون المدني",
          experience: lawyer.experience || 0,
          rating: lawyer.rating || 0,
          reviews: lawyer.reviewCount || 0,
          verified: lawyer.verified || false,
          price: lawyer.price || 0,
          online: lawyer.online || false,
          gender: lawyer.gender || "male",
          languages,
          bio: lawyer.bio || "",
          initials: lawyer.initials || (data.user?.name || "").slice(0, 2),
          hue: lawyer.hue || "from-blue-600 to-indigo-700",
          whatsapp: lawyer.whatsapp || "",
          telegram: lawyer.telegram || "",
          facebook: lawyer.facebook || "",
          instagram: lawyer.instagram || "",
          email: data.user?.email || "",
          password: "",
        };

        const profilesRaw = localStorage.getItem("lawyer_profiles");
        const profiles = profilesRaw ? JSON.parse(profilesRaw) : [];
        const existingIdx = profiles.findIndex((p: { id: string }) => p.id === profile.id);
        if (existingIdx >= 0) {
          profiles[existingIdx] = profile;
        } else {
          profiles.push(profile);
        }
        localStorage.setItem("lawyer_profiles", JSON.stringify(profiles));

        const adminRaw = localStorage.getItem("admin_site_data");
        const adminData = adminRaw ? JSON.parse(adminRaw) : {};
        if (!adminData.lawyers) adminData.lawyers = [];
        const adminIdx = adminData.lawyers.findIndex((l: { id: string }) => l.id === profile.id);
        if (adminIdx >= 0) {
          adminData.lawyers[adminIdx] = profile;
        } else {
          adminData.lawyers.push(profile);
        }
        localStorage.setItem("admin_site_data", JSON.stringify(adminData));
      }
    })
    .catch(() => {});
}

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const bridgedRef = useRef(false);

  // Bridge session synchronously before children render
  if (status === "authenticated" && session?.user && !bridgedRef.current && typeof window !== "undefined") {
    bridgedRef.current = true;
    bridgeSession({ id: session.user.id, name: session.user.name, email: session.user.email });
    seedProfileFromDB();
  }

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
    } else if (session.user?.role !== "lawyer") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !session || session.user?.role !== "lawyer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background" dir="rtl">
      <LawyerSidebar
        collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)}
        session={session.user}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-accent">
              العودة للموقع
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => signOut({ callbackUrl: "/" })} title="تسجيل الخروج"
              className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <button className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted/60">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted/60"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
