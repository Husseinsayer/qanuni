"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Mail, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate password reset (no backend in current MVP)
    await new Promise((r) => setTimeout(r, 1000));

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      setLoading(false);
      return;
    }

    // Always show success (avoids email enumeration)
    setDone(true);
    setLoading(false);
  };

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
          <h1 className="text-2xl font-extrabold">نسيت كلمة المرور؟</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-7 shadow-premium">
          {done ? (
            <div className="grid place-items-center py-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
                <Check className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-bold">تم إرسال الرابط بنجاح</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                <ArrowLeft className="size-4" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
                {loading ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
              </Button>
            </form>
          )}

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
