"use client";

import Link from "next/link";
import { ShieldX, ArrowRight } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-accent/10 blur-xl" />
        <ShieldX className="relative size-20 text-accent" strokeWidth={1.5} />
      </div>

      <h1 className="mt-8 text-6xl font-extrabold text-accent">403</h1>
      <h2 className="mt-4 text-2xl font-bold text-foreground">وصول مرفوض</h2>
      <p className="mt-3 max-w-md text-muted-foreground">
        عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الإدارة.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
      >
        <ArrowRight className="size-4" />
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}
