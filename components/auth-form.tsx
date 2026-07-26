"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, Mail, Lock, User, Phone, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { registerUser, loginUser, getUserSession } from "@/lib/user-auth";
import { ensureLawyerProfile } from "@/lib/lawyer-profiles";
import { getDefaultPlan } from "@/lib/lawyer-plans";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [role, setRole] = React.useState<"user" | "lawyer">("user");
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const isRegister = mode === "register";

  function dashboardUrl(): string {
    const session = getUserSession();
    return session?.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard";
  }

  React.useEffect(() => {
    if (done) {
      const t = setTimeout(() => router.push(dashboardUrl()), 1500);
      return () => clearTimeout(t);
    }
  }, [done, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { name, email, phone, password, confirm } = formData;

    if (isRegister) {
      if (password !== confirm) {
        setError("كلمتا المرور غير متطابقتين");
        setLoading(false);
        return;
      }
      const err = await registerUser(name, email, phone, password, role === "lawyer" ? "lawyer" : "user");
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      // Auto-login after registration
      await loginUser(email, password);
      // Immediately create lawyer profile for new lawyer registrations
      if (role === "lawyer") {
        ensureLawyerProfile();
        // Assign default subscription plan
        try {
          const defaultPlan = getDefaultPlan();
          const subsRaw = localStorage.getItem("lawyer_plan_subscriptions");
          const subs = subsRaw ? JSON.parse(subsRaw) : [];
          const session = JSON.parse(localStorage.getItem("user_session") || "{}");
          if (session.userId && !subs.find((s: any) => s.lawyerId === session.userId)) {
            subs.push({
              id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              lawyerId: session.userId,
              lawyerName: session.name,
              lawyerEmail: session.email,
              planId: defaultPlan.id,
              planName: defaultPlan.nameAr,
              billingCycle: "monthly",
              status: "active",
              price: 0,
              startDate: new Date().toISOString(),
              expiryDate: "",
              requestedAt: new Date().toISOString(),
              approvedAt: new Date().toISOString(),
            });
            localStorage.setItem("lawyer_plan_subscriptions", JSON.stringify(subs));
          }
        } catch { /* silent */ }
      }
      setDone(true);
    } else {
      const ok = await loginUser(email, password);
      if (!ok) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }
      router.push(dashboardUrl());
    }
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
          <h1 className="text-2xl font-extrabold">
            {isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister
              ? "انضم إلى منصة قانوني للوصول إلى كامل الخدمات"
              : "مرحباً بعودتك إلى منصة قانوني"}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-7 shadow-premium">
          {done ? (
            <div className="grid place-items-center py-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
                <Check className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-bold">
                {isRegister ? "تم إنشاء حسابك بنجاح" : "تم تسجيل الدخول بنجاح"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">جارٍ تحويلك إلى الصفحة الرئيسية...</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {isRegister && (
                <Field icon={User} label="الاسم الكامل" type="text" placeholder="اسمك الكامل" required
                  value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
              )}
              {isRegister && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">نوع الحساب</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setRole("user")}
                      className={cn(
                        "flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                        role === "user" ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"
                      )}>
                      مستخدم
                    </button>
                    <button type="button" onClick={() => setRole("lawyer")}
                      className={cn(
                        "flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                        role === "lawyer" ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"
                      )}>
                      محامٍ
                    </button>
                  </div>
                </div>
              )}
              <Field icon={Mail} label="البريد الإلكتروني" type="email" placeholder="you@example.com" required
                value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
              {isRegister && (
                <Field icon={Phone} label="رقم الهاتف" type="tel" placeholder="+964 7xx xxx xxxx" required
                  value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
              )}
              <Field icon={Lock} label="كلمة المرور" type="password" placeholder="••••••••" required
                value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} />
              {isRegister && (
                <Field icon={Lock} label="تأكيد كلمة المرور" type="password" placeholder="••••••••" required
                  value={formData.confirm} onChange={(v) => setFormData({ ...formData, confirm: v })} />
              )}

              {!isRegister && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" className="size-4 rounded border-border" /> تذكرني
                  </label>
                  <a href="/auth/forgot-password" className="font-semibold text-accent">
                    نسيت كلمة المرور؟
                  </a>
                </div>
              )}

              {error && (
                <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                  {error}
                </p>
              )}

              <Button type="submit" variant="accent" size="lg" className="w-full">
                {isRegister ? "إنشاء الحساب" : "دخول"}
              </Button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isRegister ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}{" "}
            <a
              href={isRegister ? "/auth/login" : "/auth/register"}
              className="font-bold text-accent"
            >
              {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

const Field = React.forwardRef<HTMLInputElement, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
}>(({ icon: Icon, label, type, placeholder, required, value, onChange, id }, ref) => {
  const inputId = id || `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="h-11 w-full rounded-xl border border-border bg-muted/40 pr-10 pl-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>
    </div>
  );
});

Field.displayName = "Field";
