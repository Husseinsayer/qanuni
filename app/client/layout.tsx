"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, User, LogOut,
  Scale, Menu, X, PanelRightClose, PanelRightOpen,
  Sun, Moon, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { isUserLoggedIn, getUserSession, logoutUser } from "@/lib/user-auth";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

const navItems: NavItem[] = [
  { label: "لوحة التحكم", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "الملف الشخصي", href: "/client/profile", icon: User },
];

function ClientSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: {
  collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const session = getUserSession();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
          <Scale className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">حسابي</span>
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

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const session = getUserSession();
    if (!session || session.role === "lawyer") {
      router.push("/auth/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  if (!authChecked) return null;

  return (
    <div className="flex min-h-screen bg-background" dir="rtl">
      <ClientSidebar
        collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <a href="/" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-accent">
              العودة للموقع
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleLogout} title="تسجيل الخروج"
              className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="h-5 w-5" />
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
