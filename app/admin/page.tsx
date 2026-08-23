"use client";

import { useAdminContext } from "./admin-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import {
  Users,
  FileText,
  Eye,
  Star,
  UserPlus,
  FilePlus,
  Landmark,
  Clock,
  ArrowLeft,
  AlertCircle,
  Building2,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <Card className="relative overflow-hidden card-hover cursor-pointer transition-transform hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-soft`}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {value}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
      <div
        className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${gradient}`}
      />
    </Card>
  );
}

function PendingCard({
  icon: Icon,
  label,
  value,
  href,
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <Card className="relative overflow-hidden card-hover cursor-pointer transition-transform hover:scale-[1.02]">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-soft`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-extrabold tracking-tight text-foreground">
                {value}
              </p>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">{label}</p>
            </div>
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
        <div
          className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${gradient}`}
        />
      </Card>
    </Link>
  );
}

export default function AdminDashboard() {
  const { data } = useAdminContext();

  const totalViews = data.articles.reduce((sum, a) => sum + a.views, 0);
  const avgRating =
    data.lawyers.length > 0
      ? (
          data.lawyers.reduce((sum, l) => sum + l.rating, 0) /
          data.lawyers.length
        ).toFixed(1)
      : "0";

  const recentArticles = [...data.articles]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const recentLawyers = data.lawyers.slice(0, 3);

  const pendingLawyers = data.users.filter((u) => u.role === "lawyer" && u.status === "pending").length;
  const pendingUsers = data.users.filter((u) => u.role === "user" && u.status === "pending").length;
  const pendingArticles = data.articles.filter((a: any) => a.status === "pending" || !a.status).length;
  const pendingFirms = data.lawFirms.filter((f: any) => f.status === "pending" || !f.status).length;
  const hasPending = pendingLawyers > 0 || pendingUsers > 0 || pendingArticles > 0 || pendingFirms > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              لوحة التحكم
            </h1>
            <p className="mt-1 text-muted-foreground">
              مرحباً بك في لوحة إدارة منصة قانوني
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="primary" size="sm">
              <Link href="/admin/lawyers">
                <UserPlus className="h-4 w-4" />
                إضافة محامٍ
              </Link>
            </Button>
            <Button asChild variant="accent" size="sm">
              <Link href="/admin/articles">
                <FilePlus className="h-4 w-4" />
                إضافة مقال
              </Link>
            </Button>
            <Button asChild variant="gold" size="sm">
              <Link href="/admin/laws">
                <Landmark className="h-4 w-4" />
                إضافة قانون
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>

      {hasPending && (
        <Reveal delay={0.05}>
          <div>
            <h2 className="mb-3 text-lg font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              قيد الانتظار
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <PendingCard
                icon={Users}
                label="محامون قيد المراجعة"
                value={pendingLawyers}
                href="/admin/lawyers"
                gradient="from-blue-500 to-indigo-600"
              />
              <PendingCard
                icon={UserCheck}
                label="مستخدمون قيد المراجعة"
                value={pendingUsers}
                href="/admin/users"
                gradient="from-emerald-500 to-teal-600"
              />
              <PendingCard
                icon={FileText}
                label="مقالات قيد المراجعة"
                value={pendingArticles}
                href="/admin/articles"
                gradient="from-purple-500 to-fuchsia-600"
              />
              <PendingCard
                icon={Building2}
                label="مكاتب قيد المراجعة"
                value={pendingFirms}
                href="/admin/law-firms"
                gradient="from-amber-500 to-orange-600"
              />
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link href="/admin/lawyers">
            <StatCard
              icon={Users}
              label="عدد المحامين"
              value={data.lawyers.length}
              gradient="from-blue-500 to-indigo-600"
            />
          </Link>
          <Link href="/admin/articles">
            <StatCard
              icon={FileText}
              label="عدد المقالات"
              value={data.articles.length}
              gradient="from-emerald-500 to-teal-600"
            />
          </Link>
          <Link href="/admin/articles">
            <StatCard
              icon={Eye}
              label="إجمالي المشاهدات"
              value={totalViews.toLocaleString("en-US")}
              gradient="from-amber-500 to-orange-600"
            />
          </Link>
          <Link href="/admin/lawyers">
            <StatCard
              icon={Star}
              label="متوسط التقييمات"
              value={avgRating}
              gradient="from-purple-500 to-fuchsia-600"
            />
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                آخر المقالات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {article.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {article.author} — {article.date}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {article.views}
                      </span>
                    </div>
                  </div>
                ))}
                <Link
                  href="/admin/articles"
                  className="flex items-center gap-1 pt-2 text-sm font-medium text-accent hover:underline"
                >
                  عرض الكل
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                آخر المحامين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLawyers.map((lawyer) => (
                  <div
                    key={lawyer.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      {lawyer.photoUrl ? (
                        <img
                          src={lawyer.photoUrl}
                          alt={lawyer.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${lawyer.hue} text-sm font-bold text-white`}
                        >
                          {lawyer.initials}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {lawyer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lawyer.specialization} — {lawyer.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <span className="font-semibold">{lawyer.rating}</span>
                    </div>
                  </div>
                ))}
                <Link
                  href="/admin/lawyers"
                  className="flex items-center gap-1 pt-2 text-sm font-medium text-accent hover:underline"
                >
                  عرض الكل
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Reveal>
    </div>
  );
}
