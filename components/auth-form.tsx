"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Scale, Mail, Lock, User, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const [, setLoading] = React.useState(false);
  const [role, setRole] = React.useState<"user" | "lawyer">("user");
  const [idImage, setIdImage] = React.useState<string>("");
  const [specialization, setSpecialization] = React.useState("");
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const isRegister = mode === "register";

  function dashboardUrl(roleName?: string): string {
    const r = roleName || role;
    if (r === "admin") return "/admin";
    if (r === "lawyer") return "/lawyer/dashboard";
    return "/client/dashboard";
  }

  React.useEffect(() => {
    if (done && !(isRegister && role === "lawyer")) {
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

      if (role === "lawyer" && !idImage) {
        setError("يجب رفع صورة هوية المحامي للتحقق");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
            role: role === "lawyer" ? "lawyer" : "user",
            specialization: role === "lawyer" ? specialization : undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "فشل إنشاء الحساب");
          setLoading(false);
          return;
        }

        // Lawyers: show pending approval notice, don't auto-login
        if (role === "lawyer") {
          setDone(true);
          setLoading(false);
          return;
        }

        // Regular users: show pending approval notice
        setDone(true);
        setLoading(false);
        return;
      } catch {
        setError("حدث خطأ في الاتصال بالخادم");
        setLoading(false);
        return;
      }

      setDone(true);
    } else {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }

      // Determine redirect based on user role
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const { user } = await meRes.json();
          router.push(dashboardUrl(user?.role));
          router.refresh();
          return;
        }
      } catch { /* silent fallback */ }
      router.push(dashboardUrl());
      router.refresh();
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
                {isRegister
                  ? "تم استلام طلب التسجيل"
                  : "تم تسجيل الدخول بنجاح"}
              </h3>
              {isRegister ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  طلبك قيد المراجعة من قبل الإدارة. سنرسل لك إشعاراً عند الموافقة عليه.
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">جارٍ تحويلك إلى الصفحة الرئيسية...</p>
              )}
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
              {isRegister && role === "lawyer" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">التخصص القانوني</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-accent"
                      required
                    >
                      <option value="">اختر التخصص...</option>
                      <option value="القانون المدني">القانون المدني</option>
                      <option value="القانون الجنائي">القانون الجنائي</option>
                      <option value="الأحوال الشخصية">الأحوال الشخصية</option>
                      <option value="القانون التجاري">القانون التجاري</option>
                      <option value="القانون الإداري">القانون الإداري</option>
                      <option value="قانون العمل">قانون العمل</option>
                      <option value="القانون العقاري">القانون العقاري</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">صورة هوية المحامي أو بطاقة النقابة</label>
                    <p className="mb-2 text-xs text-muted-foreground">للتحقق من هويتك كمحامٍ مرخص</p>
                    <div className="relative flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-6 transition hover:border-accent/50">
                      {idImage ? (
                        <div className="text-center">
                          <img src={idImage} alt="صورة الهوية" className="mx-auto h-32 rounded-lg object-contain" />
                          <button type="button" onClick={() => setIdImage("")} className="mt-2 text-xs font-semibold text-danger hover:underline">
                            إزالة الصورة
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer text-center">
                          <svg className="mx-auto size-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <span className="mt-2 block text-sm font-semibold text-muted-foreground">اضغط لرفع صورة</span>
                          <span className="text-xs text-muted-foreground/70">PNG, JPG (حد أقصى 5MB)</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) { setError("حجم الصورة يتجاوز 5MB"); return; }
                              const reader = new FileReader();
                              reader.onload = (ev) => setIdImage(ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </>
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
                  <Link href="/auth/forgot-password" className="font-semibold text-accent">
                    نسيت كلمة المرور؟
                  </Link>
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
