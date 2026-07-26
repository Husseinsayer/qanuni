"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Scale, FileText, ArrowLeft, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserSession } from "@/lib/user-auth";
import { getAllLawyerProfiles } from "@/lib/lawyer-profiles";

export default function ClientDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(getUserSession());
  const [lawyerCount, setLawyerCount] = useState(0);

  useEffect(() => {
    const s = getUserSession();
    if (!s || s.role === "lawyer") {
      router.push("/auth/login");
      return;
    }
    setSession(s);
    setLawyerCount(getAllLawyerProfiles().length);
  }, [router]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const quickLinks = [
    {
      label: "البحث عن محامي",
      desc: "ابحث في دليل المحامين المتخصصين",
      href: "/lawyers",
      icon: Search,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "القوانين العراقية",
      desc: "تصفح أحدث القوانين والمواد القانونية",
      href: "/laws",
      icon: Scale,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "المقالات القانونية",
      desc: "اقرأ مقالات قانونية مفيدة",
      href: "/blog",
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "الملف الشخصي",
      desc: "عرض وتعديل معلومات حسابك",
      href: "/client/profile",
      icon: User,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-extrabold">مرحباً، {session.name}</h1>
        <p className="mt-1 text-muted-foreground">
          مرحباً بك في حسابك على منصة قانوني
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">نوع الحساب</p>
            <p className="mt-1 text-lg font-extrabold">
              {session.role === "visitor" ? "زائر" : "مستخدم"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
            <p className="mt-1 truncate text-lg font-extrabold" dir="ltr">{session.email}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">عدد المحامين</p>
            <p className="mt-1 text-lg font-extrabold">{lawyerCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
            <p className="mt-1 text-lg font-extrabold">اليوم</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <h2 className="text-xl font-bold">روابط سريعة</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="cursor-pointer border-0 shadow-soft transition-all hover:shadow-premium hover:-translate-y-0.5">
              <CardContent className="flex items-start gap-4 p-5">
                <div className={`rounded-2xl p-3 ${link.bg}`}>
                  <link.icon className={`size-6 ${link.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{link.label}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{link.desc}</p>
                </div>
                <ArrowLeft className="mt-1 size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Card */}
      <Card className="border-0 bg-gradient-to-br from-accent/5 to-accent/10 shadow-soft">
        <CardContent className="p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Scale className="size-5 text-accent" />
            منصة قانوني — دليلك القانوني الشامل
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            نوفر لك أحدث القوانين العراقية، وأفضل المحامين المتخصصين، ومقالات قانونية
            موثوقة. يمكنك البحث عن محامٍ حسب التخصص والمدينة، وتصفح المواد القانونية
            بسهولة، وقراءة المقالات القانونية المفيدة.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/lawyers">
              <Button variant="accent" className="gap-2">
                <Search className="size-4" />
                ابحث عن محامي
              </Button>
            </Link>
            <Link href="/laws">
              <Button variant="outline" className="gap-2">
                <Scale className="size-4" />
                تصفح القوانين
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
