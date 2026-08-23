"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Save, Check, Lock, Shield, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClientProfilePage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/client/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.user?.name || "");
          setPhone(data.user?.phone || "");
          if (data.user?.createdAt) {
            setCreatedAt(new Date(data.user.createdAt).toLocaleDateString("ar-IQ"));
          }
        }
      } catch {
        console.error("Failed to fetch profile");
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      console.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">الملف الشخصي</h1>
          <p className="mt-1 text-muted-foreground">معلومات حسابك على منصة قانوني</p>
        </div>
        <Button onClick={handleSave} variant="accent" className="gap-2" disabled={saving}>
          {saved ? <><Check className="size-4" /> تم الحفظ</> : <><Save className="size-4" /> {saving ? "جارٍ الحفظ..." : "حفظ"}</>}
        </Button>
      </div>

      {saved && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          تم حفظ التغييرات بنجاح
        </div>
      )}

      {/* Account Info */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="size-5 text-accent" />
            معلومات الحساب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">الاسم</label>
              <div className="relative">
                <User className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 pr-10 pl-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
                <input type="email" value={session?.user?.email || ""} disabled
                  className="h-11 w-full rounded-xl border border-border bg-muted/20 pr-10 pl-3 text-sm text-muted-foreground" />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">رقم الهاتف</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+964 7xx xxx xxxx"
                className="h-11 w-full rounded-xl border border-border bg-muted/40 pr-10 pl-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Type */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="size-5 text-accent" />
            نوع الحساب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Shield className="size-6 text-accent" />
            </div>
            <div>
              <p className="font-bold">مستخدم</p>
              <p className="text-sm text-muted-foreground">حساب مستخدم — يمكنك الاستفادة من جميع خدمات المنصة</p>
            </div>
          </div>
          {createdAt && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>تاريخ التسجيل: {createdAt}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-0 shadow-soft cursor-pointer transition-all hover:shadow-premium hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-blue-100 p-3">
              <Lock className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold">تغيير كلمة المرور</p>
              <p className="text-sm text-muted-foreground">قريباً...</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft cursor-pointer transition-all hover:shadow-premium hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-2xl bg-emerald-100 p-3">
              <Mail className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold">إشعارات البريد</p>
              <p className="text-sm text-muted-foreground">قريباً...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
