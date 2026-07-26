"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Scale, Eye, EyeOff, Loader2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminLogin } from "@/lib/admin-data";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await adminLogin(username, password);
      setLoading(false);

      if (success) {
        router.push("/admin");
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch {
      setLoading(false);
      setError("حدث خطأ في المصادقة. تأكد من استخدام HTTPS أو localhost.");
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center gradient-primary p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-md rounded-2xl shadow-premium backdrop-blur-xl bg-card/80 border border-white/20">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-foreground">
                تسجيل الدخول
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                لوحة إدارة منصة قانوني
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="أدخل كلمة المرور"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3">
                <p className="text-sm font-semibold text-danger">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                "دخول"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              للدخول الإداري تواصل مع الإدارة
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
