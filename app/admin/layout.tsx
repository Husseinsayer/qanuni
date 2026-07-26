"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Scale,
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  ScrollText,
  Megaphone,
  Palette,
  Search,
  Settings,
  Bell,
  Sun,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  Menu,
  X,
  LogOut,
  Shield,
  MapPin,
  Code2,
  History,
  BarChart3,
  ChevronDown,
  MessageCircle,
  BookOpen,
  ClipboardList,
  HelpCircle,
  FileStack,
  Tag,
  ExternalLink,
  Database,
  CreditCard,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDataProvider } from "./admin-context";
import { ToastProvider } from "@/components/ui/toast";
import { useTheme } from "next-themes";
import { isAdminLoggedIn, adminLogout } from "@/lib/admin-data";

type NavChild = { label: string; href: string; icon: LucideIcon };
type NavGroup = {
  label: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  children: NavChild[];
};

const navGroups: NavGroup[] = [
  {
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    defaultOpen: true,
    children: [{ label: "الرئيسية", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "المحتوى",
    icon: ScrollText,
    defaultOpen: true,
    children: [
      { label: "المحامون", href: "/admin/lawyers", icon: Users },
      { label: "إدارة الترويج", href: "/admin/promotions", icon: Megaphone },
      { label: "الخطط والاشتراكات", href: "/admin/plans", icon: CreditCard },
      { label: "المقالات", href: "/admin/articles", icon: FileText },
      { label: "القوانين", href: "/admin/laws", icon: Scale },
      { label: "المكاتب", href: "/admin/law-firms", icon: Building2 },
      { label: "المحتوى", href: "/admin/content", icon: ScrollText },
    ],
  },
  {
    label: "التحليلات",
    icon: BarChart3,
    defaultOpen: true,
    children: [
      { label: "لوحة التحليلات", href: "/admin/analytics", icon: BarChart3 },
      { label: "إعدادات التحليلات", href: "/admin/analytics/settings", icon: Settings },
    ],
  },
  {
    label: "كبار المسئولين (SEO)",
    icon: Search,
    defaultOpen: true,
    children: [
      { label: "لوحة SEO", href: "/admin/seo", icon: Search },
      { label: "إعدادات SEO", href: "/admin/seo/settings", icon: Settings },
      { label: "محلل المحتوى", href: "/admin/seo/content", icon: Search },
      { label: "أدوات SEO", href: "/admin/seo/tools", icon: Settings },
      { label: "Local SEO", href: "/admin/seo/local", icon: MapPin },
    ],
  },
  {
    label: "الإعلانات",
    icon: Megaphone,
    defaultOpen: false,
    children: [
      { label: "إعدادات الإعلانات", href: "/admin/ads", icon: Megaphone },
      { label: "أماكن الإعلانات", href: "/admin/ad-placements", icon: MapPin },
      { label: "البنرات", href: "/admin/banners", icon: Megaphone },
      { label: "أكواد HTML", href: "/admin/html-codes", icon: Code2 },
    ],
  },
  {
    label: "النظام",
    icon: Settings,
    defaultOpen: false,
    children: [
      { label: "سجل العمليات", href: "/admin/activity-log", icon: History },
      { label: "المستخدمون", href: "/admin/users", icon: Shield },
      { label: "المظهر", href: "/admin/theme", icon: Palette },
      { label: "الإعدادات", href: "/admin/settings", icon: Settings },
      { label: "نسخ احتياطي واستعادة", href: "/admin/backup", icon: Database },
    ],
  },
  {
    label: "المساعد القانوني",
    icon: MessageCircle,
    defaultOpen: false,
    children: [
      { label: "إعدادات المساعد", href: "/admin/ai/settings", icon: Settings },
      { label: "الأسئلة الشائعة", href: "/admin/ai/questions", icon: FileText },
      { label: "المظهر والردود", href: "/admin/ai/appearance", icon: Palette },
      { label: "إعدادات الإجابات", href: "/admin/ai/answer-settings", icon: Settings },
      { label: "درجة الثقة", href: "/admin/ai/confidence", icon: BarChart3 },
      { label: "المحادثات", href: "/admin/ai/conversations", icon: History },
      { label: "التحليلات", href: "/admin/ai/analytics", icon: BarChart3 },
      { label: "التحقق والتجربة", href: "/admin/ai/debug", icon: Code2 },
    ],
  },
  {
    label: "مركز المعرفة القانونية",
    icon: BookOpen,
    defaultOpen: false,
    children: [
      { label: "الرئيسية", href: "/admin/knowledge-center", icon: LayoutDashboard },
      { label: "الإجراءات القانونية", href: "/admin/knowledge-center/procedures", icon: ClipboardList },
      { label: "النماذج القانونية", href: "/admin/knowledge-center/templates", icon: FileText },
      { label: "الخدمات والروابط", href: "/admin/knowledge-center/services", icon: ExternalLink },
      { label: "الأسئلة والأجوبة", href: "/admin/knowledge-center/qa", icon: HelpCircle },
      { label: "الكتب والمؤلفات", href: "/admin/knowledge-center/terms", icon: BookOpen },
      { label: "الجهات الحكومية", href: "/admin/knowledge-center/governments", icon: Building2 },
      { label: "المستندات المطلوبة", href: "/admin/knowledge-center/documents", icon: FileStack },
      { label: "الكلمات المفتاحية", href: "/admin/knowledge-center/keywords", icon: Tag },
    ],
  },
  {
    label: "البريد الإلكتروني",
    icon: Mail,
    defaultOpen: false,
    children: [
      { label: "الإعدادات", href: "/admin/email", icon: Settings },
      { label: "قوالب البريد", href: "/admin/email/templates", icon: FileText },
      { label: "سجلات الإرسال", href: "/admin/email/logs", icon: History },
    ],
  },
];

function findActiveChild(pathname: string): { child: NavChild; group: NavGroup } | null {
  let best: { child: NavChild; group: NavGroup; hrefLen: number } | null = null;
  for (const g of navGroups) {
    for (const c of g.children) {
      if (pathname === c.href) {
        // Exact match → always best
        if (!best || c.href.length > best.hrefLen) {
          best = { child: c, group: g, hrefLen: c.href.length };
        }
      } else if (c.href !== "/admin" && pathname.startsWith(c.href + "/")) {
        // Prefix match → only if more specific than current best
        if (!best || c.href.length > best.hrefLen) {
          best = { child: c, group: g, hrefLen: c.href.length };
        }
      }
    }
  }
  return best;
}

function isChildActive(child: NavChild, pathname: string): boolean {
  const active = findActiveChild(pathname);
  return active?.child.href === child.href;
}

function findActiveLabel(pathname: string): string {
  return findActiveChild(pathname)?.child.label ?? "لوحة التحكم";
}

function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(navGroups.filter((g) => g.defaultOpen).map((g) => g.label))
  );

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
          <Scale className="h-5 w-5" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-white">لوحة الإدارة</span>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navGroups.map((group) => {
          const isOpen = openGroups.has(group.label);
          const groupActive = group.children.some((c) => isChildActive(c, pathname));
          if (collapsed) {
            // icon-only: navigate to first child on click
            const landing = group.children[0];
            return (
              <Link
                key={group.label}
                href={landing.href}
                onClick={onMobileClose}
                title={group.label}
                className={cn(
                  "flex items-center justify-center rounded-xl px-2 py-2.5 text-sm font-medium transition-all duration-200",
                  groupActive
                    ? "bg-accent text-white shadow-glow"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <group.icon className="h-5 w-5 shrink-0" />
              </Link>
            );
          }
          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  groupActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <group.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-right">{group.label}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-white/50 transition-transform duration-300",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="mb-1 mt-1 flex flex-col gap-0.5 border-r border-white/10 pr-4">
                  {group.children.map((child) => {
                    const active = isChildActive(child, pathname);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          active
                            ? "bg-accent text-white shadow-glow"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            active ? "bg-white" : "bg-white/30"
                          )}
                        />
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          {collapsed ? (
            <PanelRightOpen className="h-5 w-5" />
          ) : (
            <>
              <PanelRightClose className="h-5 w-5" />
              <span>طي القائمة</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-l border-white/10 gradient-primary transition-all duration-300 lg:flex",
          collapsed ? "w-[70px]" : "w-[260px]"
        )}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute inset-y-0 right-0 w-[260px] gradient-primary shadow-premium">
            <button
              onClick={onMobileClose}
              className="absolute left-3 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setAuthChecked(true);
      return;
    }
    if (!isAdminLoggedIn()) {
      router.push("/admin/login");
    } else {
      setAuthChecked(true);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    adminLogout();
    router.push("/admin/login");
  };

  if (!authChecked) {
    return null;
  }

  // Login page renders without admin shell
  if (pathname === "/admin/login") {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background" dir="rtl">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xl md:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-foreground">
                {findActiveLabel(pathname)}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <LogOut className="h-5 w-5" />
              </button>

              <button className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
              </button>

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white">
                م
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDataProvider>
      <AdminShell>{children}</AdminShell>
    </AdminDataProvider>
  );
}
