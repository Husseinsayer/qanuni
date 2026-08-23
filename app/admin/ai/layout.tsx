// ===== Iraqi Legal Assistant - Admin AI Layout =====
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Settings,
  MessageSquare,
  HelpCircle,
  FileText,
  BarChart3,
  MessageCircle,
  Bug,
  Palette,
  Shield,
  Clock,
  BookOpen,
} from "lucide-react";

const aiPages = [
  { href: "/admin/ai/settings", label: "إعدادات الذكاء الاصطناعي", icon: Settings },
  { href: "/admin/ai/bot-instructions", label: "تعليمات البوت", icon: BookOpen },
  { href: "/admin/ai/prompts", label: "إدارة البرومبت", icon: FileText },
  { href: "/admin/ai/questions", label: "إدارة الأسئلة", icon: HelpCircle },
  { href: "/admin/ai/appearance", label: "المظهر والألوان", icon: Palette },
  { href: "/admin/ai/answer-settings", label: "إعدادات الإجابة", icon: MessageCircle },
  { href: "/admin/ai/confidence", label: "إعدادات الثقة", icon: Shield },
  { href: "/admin/ai/conversations", label: "سجل المحادثات", icon: Clock },
  { href: "/admin/ai/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/admin/ai/debug", label: "اختبار البوت", icon: Bug },
];

export default function AdminAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <Card className="p-4">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            المساعد القانوني الذكي
          </h2>
          <nav className="space-y-1">
            {aiPages.map((page) => {
              const Icon = page.icon;
              const isActive = pathname === page.href;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {page.label}
                </Link>
              );
            })}
          </nav>
        </Card>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
