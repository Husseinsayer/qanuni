"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Lock, Check, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  // If no token/email, show invalid state
  if (!token || !email) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <div className="rounded-3xl border border-border bg-card p-7 shadow-premium">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-danger/15 text-danger">
              <AlertCircle className="size-7" />
            </span>
            <h2 className="mt-4 text-lg font-bold">رابط غير صالح</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              رابط إعادة تعيين كلمة المرور غير صالح. يرجى طلب رابط جديد.
            </p>
            <Link
              href="/auth/forgot-password"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              <ArrowLeft className="size-4" />
              طلب رابط جديد
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "فشل إعادة تعيين كلمة المرور");
        setLoading(false);
        return;
      }

      setDone(true);
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="rounded-3xl border border-border bg-card p-7 shadow-premium">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
              <Check className="size-7" />
            </span>
            <h3 className="mt-4 text-lg font-bold">تم إعادة التعيين بنجاح</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              <ArrowLeft className="size-4" />
              تسجيل الدخول
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 grid size-12 place-items-center rounded-2xl gradient-primary text-white shadow-soft">
            <Scale className="size-6" />
          </span>
          <h1 className="text-2xl font-extrabold">إعادة تعيين كلمة المرور</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أدخل كلمة المرور الجديدة لحسابك
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-7 shadow-premium">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">كلمة المرور الجديدة</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 pr-10 pl-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 pr-10 pl-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}

            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
              {loading ? "جارٍ الحفظ..." : "إعادة تعيين كلمة المرور"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            تذكرت كلمة المرور؟{" "}
            <Link href="/auth/login" className="font-bold text-accent">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
