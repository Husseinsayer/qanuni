"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, Scale, FileText, ArrowLeft, Search, Calendar, Star, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClientDashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({ lawyerCount: 0, reviewCount: 0, favoriteCount: 0 });
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/client/profile");
        if (res.ok) {
          const data = await res.json();
          setStats({
            lawyerCount: data.lawyerCount || 0,
            reviewCount: data.reviewCount || 0,
            favoriteCount: data.favoriteCount || 0,
          });
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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const quickLinks = [
    { label: "البحث عن محامي", desc: "ابحث في دليل المحامين المتخصصين", href: "/lawyers", icon: Search, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "القوانين العراقية", desc: "تصفح أحدث القوانين والمواد القانونية", href: "/laws", icon: Scale, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { label: "المقالات القانونية", desc: "اقرأ مقالات قانونية مفيدة", href: "/blog", icon: FileText, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { label: "تقييماتي", desc: "عرض التقييمات التي قمت بها", href: "/client/reviews", icon: Star, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { label: "الملف الشخصي", desc: "عرض وتعديل معلومات حسابك", href: "/client/profile", icon: User, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-extrabold">مرحباً، {session?.user?.name}</h1>
        <p className="mt-1 text-muted-foreground">
          مرحباً بك في حسابك على منصة قانوني
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد المحامين</p>
                <p className="text-lg font-extrabold">{stats.lawyerCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تقييماتي</p>
                <p className="text-lg font-extrabold">{stats.reviewCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                <Heart className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المفضلة</p>
                <p className="text-lg font-extrabold">{stats.favoriteCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                <p className="text-sm font-extrabold">{createdAt || "غير محدد"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <h2 className="text-xl font-bold">روابط سريعة</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
