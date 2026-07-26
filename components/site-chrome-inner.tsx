"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/header";
import { SiteFooter } from "@/components/footer";
import { FloatingAI } from "@/components/floating-ai";
import { AiAssistantFab } from "@/components/ai-assistant-fab";

export function SiteChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isChat = pathname.startsWith("/chat");
  const hideChrome = isAdmin;
  const hideFooter = isAdmin || isChat;

  return (
    <div className="relative flex min-h-screen flex-col">
      {!hideChrome && <SiteHeader />}
      <main id="main-content" className="flex-1">{children}</main>
      {!hideFooter && <SiteFooter />}
      {!hideFooter && <FloatingAI />}
      {!isAdmin && <AiAssistantFab />}
    </div>
  );
}
