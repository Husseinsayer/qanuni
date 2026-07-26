"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarList, MiniBars, Donut } from "@/components/charts";
import {
  Users,
  MousePointerClick,
  Globe,
  MonitorSmartphone,
  Eye,
  CalendarDays,
  BarChart3,
  Database,
  Trash2,
  Download,
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  Timer,
  DoorOpen,
} from "lucide-react";
import {
  loadEvents,
  summarize,
  summarizeRange,
  comparePeriods,
  eventsToCsv,
  downloadCsv,
  clearEvents,
  recordVisit,
  analyticsDefaults,
  type VisitEvent,
  type AnalyticsSummary,
  type DateRange,
} from "@/lib/analytics";
import { useAdminContext } from "../admin-context";
import { pushActivityLog } from "@/lib/admin-data";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-extrabold">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function seedDemoData() {
  const paths = [
    "/",
    "/lawyers",
    "/lawyers/%D9%85%D8%AD%D9%85%D8%AF",
    "/articles",
    "/laws/civil",
    "/law-firms",
    "/blog/seo-tips",
  ];
  const devices: VisitEvent["device"][] = ["desktop", "mobile", "mobile", "tablet", "desktop"];
  const browsers = ["chrome", "safari", "firefox", "edge", "samsung", "chrome"];
  const countries = ["IQ", "IQ", "IQ", "SA", "AE", "JO", "EG"];
  const sources = [
    { src: "google", medium: "organic" },
    { src: "facebook", medium: "social" },
    { src: "direct", medium: "direct" },
    { src: "bing", medium: "organic" },
    { src: "instagram", medium: "social" },
  ];
  const now = Date.now();
  const events: VisitEvent[] = [];
  for (let i = 0; i < 320; i++) {
    const d = new Date(now - Math.floor(Math.random() * 30) * 86400000 - Math.floor(Math.random() * 86400000));
    events.push({
      t: d.getTime(),
      path: paths[Math.floor(Math.random() * paths.length)],
      ref: "",
      src: sources[Math.floor(Math.random() * sources.length)].src,
      medium: sources[Math.floor(Math.random() * sources.length)].medium,
      campaign: "",
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: "windows",
      country: countries[Math.floor(Math.random() * countries.length)],
      lang: "ar-IQ",
      vid: "demo-" + Math.floor(Math.random() * 80),
    });
  }
  try {
    window.localStorage.setItem("site_analytics_v1", JSON.stringify(events));
  } catch {
    /* ignore */
  }
}

function DeltaBadge({ value, label }: { value: number; label: string }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {label}: 0%
      </span>
    );
  }
  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        up ? "bg-emerald-500/10 text-emerald-600" : "bg-danger/10 text-danger"
      }`}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {label}: {up ? "+" : ""}
      {value}%
    </span>
  );
}

function toDayInput(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDuration(ms: number): string {
  if (!ms || ms < 1000) return "—";
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m <= 0) return `${s} ث`;
  return `${m} د ${s} ث`;
}

export default function AnalyticsDashboard() {
  const { data, update } = useAdminContext();
  const [events, setEvents] = useState<VisitEvent[]>([]);
  const [range, setRange] = useState(30);
  const [custom, setCustom] = useState(false);
  const [fromDate, setFromDate] = useState(toDayInput(Date.now() - 30 * 86400000));
  const [toDate, setToDate] = useState(toDayInput(Date.now()));
  const [compare, setCompare] = useState(false);

  const reload = () => setEvents(loadEvents());

  useEffect(() => {
    reload();
  }, []);

  const currentRange: DateRange = useMemo(() => {
    if (custom) {
      const from = new Date(fromDate + "T00:00:00").getTime();
      const to = new Date(toDate + "T23:59:59").getTime();
      return { from: Number.isNaN(from) ? Date.now() - range * 86400000 : from, to: Number.isNaN(to) ? Date.now() : to };
    }
    const to = Date.now();
    return { from: to - range * 86400000, to };
  }, [custom, fromDate, toDate, range]);

  const summary: AnalyticsSummary = useMemo(() => summarizeRange(events, currentRange), [events, currentRange]);

  const comparison = useMemo(() => {
    if (!compare) return null;
    const span = currentRange.to - currentRange.from;
    const prev: DateRange = { from: currentRange.from - span, to: currentRange.from - 1 };
    return comparePeriods(events, currentRange, prev);
  }, [compare, events, currentRange]);

  const displaySummary = comparison ? comparison.current : summary;

  const handleClear = () => {
    clearEvents();
    reload();
    const e = pushActivityLog({ entity: "analytics", entityId: "events", actor: "مدير النظام", action: "delete", newValues: {} });
    update("activityLog", [e, ...data.activityLog]);
  };

  const handleSeed = () => {
    seedDemoData();
    reload();
  };

  const handleExport = () => {
    const filtered = events.filter((e) => e.t >= currentRange.from && e.t <= currentRange.to);
    const csv = eventsToCsv(filtered);
    const name = `analytics_${toDayInput(currentRange.from)}_${toDayInput(currentRange.to)}.csv`;
    downloadCsv(name, csv);
  };

  const rangeLabel = custom ? `${fromDate} → ${toDate}` : `آخر ${range} يوم`;
  const deviceLabel: Record<string, string> = { desktop: "سطح المكتب", mobile: "جوال", tablet: "لوحي" };

  return (
    <div className="mx-auto max-w-6xl space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">لوحة تحليلات الموقع</h1>
            <p className="text-sm text-muted-foreground">إحصائيات الزيارات والمصادر والأجهزة والدول</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!custom && (
            <div className="flex rounded-xl border border-border p-1">
              {[7, 30, 90].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    range === r ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r} يوم
                </button>
              ))}
            </div>
          )}
          <Button
            variant={custom ? "accent" : "outline"}
            size="sm"
            onClick={() => setCustom((v) => !v)}
          >
            <CalendarDays className="h-4 w-4" />
            نطاق مخصص
          </Button>
          <Button
            variant={compare ? "accent" : "outline"}
            size="sm"
            onClick={() => setCompare((v) => !v)}
          >
            <ArrowDownUp className="h-4 w-4" />
            مقارنة
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            تصدير CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleSeed}>
            <Database className="h-4 w-4" />
            بيانات تجريبية
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-danger hover:bg-danger/10">
            <Trash2 className="h-4 w-4" />
            مسح
          </Button>
        </div>
      </div>

      {custom && (
        <Card>
          <CardContent className="flex flex-wrap items-end gap-3 p-4">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              من تاريخ
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              إلى تاريخ
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <span className="pb-2 text-xs text-muted-foreground">
              النطاق المحدد: {rangeLabel}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Eye} label="مشاهدات الصفحات" value={displaySummary.pageviews} sub={rangeLabel} />
        <StatCard icon={Users} label="زوار فريدون" value={displaySummary.visitors} />
        <StatCard icon={MousePointerClick} label="إجمالي الزيارات" value={displaySummary.total} />
        <StatCard icon={Globe} label="دول" value={displaySummary.byCountry.length} />
        <StatCard
          icon={Timer}
          label="متوسط مدة الجلسة"
          value={formatDuration(displaySummary.avgDuration)}
          sub={displaySummary.avgDuration ? "للجلسات المكتملة" : "لا توجد بيانات كافية"}
        />
        <StatCard icon={DoorOpen} label="نسبة الارتداد" value={`${displaySummary.bounceRate}%`} />
      </div>

      {comparison && (
        <div className="flex flex-wrap gap-2">
          <DeltaBadge value={comparison.delta.pageviews} label="المشاهدات" />
          <DeltaBadge value={comparison.delta.visitors} label="الزوار" />
          <DeltaBadge value={comparison.delta.total} label="الزيارات" />
          <span className="pb-1 text-[11px] text-muted-foreground">
            مقارنة بالفترة السابقة بنفس المدة
          </span>
        </div>
      )}

      {/* Visits over time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-accent" />
            الزيارات اليومية ({rangeLabel})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MiniBars data={displaySummary.byDay.map((d) => ({ date: d.date, visits: d.visits }))} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sources */}
        <Card>
          <CardHeader>
            <CardTitle>مصادر الزيارات</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={displaySummary.bySource.map((s) => ({ name: s.name, value: s.value }))} />
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5 text-accent" />
              الأجهزة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Donut data={displaySummary.byDevice.map((d) => ({ name: deviceLabel[d.name] || d.name, value: d.value }))} />
          </CardContent>
        </Card>

        {/* Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              الدول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={displaySummary.byCountry.map((c) => ({ name: c.name, value: c.value }))} />
          </CardContent>
        </Card>

        {/* Browsers */}
        <Card>
          <CardHeader>
            <CardTitle>المتصفحات</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={displaySummary.byBrowser.map((b) => ({ name: b.name, value: b.value }))} />
          </CardContent>
        </Card>
      </div>

      {/* Top pages + hours */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الصفحات الأكثر زيارة</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={displaySummary.topPages} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الزيارات حسب الساعة</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBars data={displaySummary.byHour.map((h) => ({ hour: h.hour, visits: h.visits }))} />
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>12 ص</span>
              <span>6 م</span>
              <span>12 م</span>
              <span>6 ص</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اللغات</CardTitle>
        </CardHeader>
        <CardContent>
          <BarList data={displaySummary.byLang.map((l) => ({ name: l.name, value: l.value }))} />
        </CardContent>
      </Card>
    </div>
  );
}
