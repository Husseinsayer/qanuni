"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText, Search, Download, Trash2, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Clock, AlertTriangle, Filter,
} from "lucide-react";
import { getEmailLogs, clearEmailLogs, type EmailLog } from "@/lib/email-settings";
import { toast } from "@/lib/admin-toast";
import { cn } from "@/lib/utils";

const statusMap: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  sent: { label: "تم الإرسال", cls: "bg-green-100 text-green-700", icon: CheckCircle2 },
  failed: { label: "فشل", cls: "bg-red-100 text-red-700", icon: XCircle },
  queued: { label: "في القائمة", cls: "bg-yellow-100 text-yellow-700", icon: Clock },
  bounced: { label: "مرتد", cls: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  pending: { label: "قيد الانتظار", cls: "bg-blue-100 text-blue-700", icon: Clock },
};

export default function EmailLogsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ logs: EmailLog[]; total: number; page: number; totalPages: number }>({
    logs: [], total: 0, page: 1, totalPages: 1,
  });
  const [selected, setSelected] = useState<EmailLog | null>(null);

  useEffect(() => {
    setData(getEmailLogs({ search, status, page, perPage: 15 }));
  }, [search, status, page]);

  const handleExport = () => {
    const allLogs = getEmailLogs({ search, status, perPage: 9999 });
    const csv = [
      "التاريخ,المستلم,المُرسل,العنوان,الحالة,الخطأ,رد SMTP,وقت التسليم",
      ...allLogs.logs.map((l) =>
        `"${l.timestamp}","${l.recipient}","${l.sender}","${l.subject}","${l.status}","${l.error}","${l.smtpResponse}","${l.deliveryTime}ms"`
      ),
    ].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم", "تم تصدير السجلات");
  };

  const handleClearAll = () => {
    clearEmailLogs();
    setData(getEmailLogs({ search, status, page, perPage: 15 }));
    toast.warning("تم", "تم حذف جميع السجلات");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">سجلات البريد الإلكتروني</h1>
            <p className="text-sm text-muted-foreground">{data.total} سجل</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-1.5">
            <Download className="size-4" /> تصدير
          </Button>
          <Button onClick={handleClearAll} variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="size-4" /> حذف الكل
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="بحث في المستلم، العنوان، المُرسل..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-accent" />
        </div>
        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[
          { value: "all", label: "جميع الحالات" },
          { value: "sent", label: "تم الإرسال" },
          { value: "failed", label: "فشل" },
          { value: "queued", label: "في القائمة" },
          { value: "bounced", label: "مرتد" },
          { value: "pending", label: "قيد الانتظار" },
        ]} />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-right text-muted-foreground">
                <th className="p-3">التاريخ</th>
                <th className="p-3">المستلم</th>
                <th className="p-3">العنوان</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الوقت</th>
                <th className="p-3">عرض</th>
              </tr>
            </thead>
            <tbody>
              {data.logs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد سجلات</td></tr>
              ) : data.logs.map((log) => {
                const st = statusMap[log.status] ?? statusMap.pending;
                return (
                  <tr key={log.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString("ar-IQ")} {new Date(log.timestamp).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-3">{log.recipient}</td>
                    <td className="p-3 max-w-[200px] truncate">{log.subject}</td>
                    <td className="p-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", st.cls)}>
                        <st.icon className="size-3" /> {st.label}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{log.deliveryTime}ms</td>
                    <td className="p-3">
                      <button onClick={() => setSelected(selected?.id === log.id ? null : log)} className="text-accent hover:underline text-xs">
                        تفاصيل
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-3">
            <p className="text-xs text-muted-foreground">صفحة {data.page} من {data.totalPages}</p>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronRight className="size-4" />
              </Button>
              <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Panel */}
      {selected && (
        <Card className="border-accent">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>تفاصيل الرسالة</span>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <p><span className="text-muted-foreground">المستلم:</span> {selected.recipient}</p>
              <p><span className="text-muted-foreground">المُرسل:</span> {selected.sender}</p>
              <p><span className="text-muted-foreground">العنوان:</span> {selected.subject}</p>
              <p><span className="text-muted-foreground">التاريخ:</span> {new Date(selected.timestamp).toLocaleString("ar-IQ")}</p>
              <p><span className="text-muted-foreground">الحالة:</span> {statusMap[selected.status]?.label ?? selected.status}</p>
              <p><span className="text-muted-foreground">وقت التسليم:</span> {selected.deliveryTime}ms</p>
            </div>
            {selected.error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3">
                <p className="text-xs font-semibold text-red-600 mb-1">الخطأ:</p>
                <p className="text-xs text-red-600 font-mono">{selected.error}</p>
              </div>
            )}
            {selected.smtpResponse && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3">
                <p className="text-xs font-semibold text-green-600 mb-1">رد SMTP:</p>
                <p className="text-xs text-green-600 font-mono">{selected.smtpResponse}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}
    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>;
}
