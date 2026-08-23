"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "@/lib/admin-toast";
import { Trash2, Eye, Clock, CheckCircle, XCircle, Loader2, Filter } from "lucide-react";

interface Consultation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  subject: string;
  description: string;
  status: string;
  lawyerName: string;
  scheduledDate: string | null;
  response: string;
  price: number;
  isPaid: boolean;
  createdAt: string;
  consultationType?: { name: string; category: string };
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="size-3" /> },
  accepted: { label: "مقبول", color: "bg-blue-100 text-blue-700", icon: <CheckCircle className="size-3" /> },
  in_progress: { label: "قيد التنفيذ", color: "bg-purple-100 text-purple-700", icon: <Clock className="size-3" /> },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-700", icon: <CheckCircle className="size-3" /> },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-700", icon: <XCircle className="size-3" /> },
};

export default function ConsultationsDashboardPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/consultations");
      if (res.ok) setConsultations(await res.json());
    } catch { toast.error("فشل التحميل"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { toast.success("تم التحديث"); fetchData(); }
    } catch { toast.error("فشل التحديث"); }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("تم الحذف"); fetchData(); }
    } catch { toast.error("فشل الحذف"); }
  };

  const filtered = consultations.filter((c) => !filterStatus || c.status === filterStatus);
  const stats = {
    total: consultations.length,
    pending: consultations.filter((c) => c.status === "pending").length,
    completed: consultations.filter((c) => c.status === "completed").length,
    revenue: consultations.filter((c) => c.isPaid).reduce((sum, c) => sum + c.price, 0),
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الاستشارات القانونية</h1>
          <p className="text-sm text-muted-foreground">إدارة طلبات الاستشارات القانونية</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">إجمالي</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p><p className="text-xs text-muted-foreground">قيد الانتظار</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.completed}</p><p className="text-xs text-muted-foreground">مكتملة</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{stats.revenue} د.ع</p><p className="text-xs text-muted-foreground">الإيرادات</p></Card>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <Filter className="size-4 text-muted-foreground" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="">كل الحالات</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
          </select>
          <span className="text-sm text-muted-foreground">{filtered.length} نتيجة</span>
        </div>
      </Card>

      {/* Consultations Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-xs text-muted-foreground">
                <th className="p-3">العميل</th>
                <th className="p-3">الموضوع</th>
                <th className="p-3">النوع</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">السعر</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-3">
                    <p className="font-medium">{c.clientName}</p>
                    <p className="text-xs text-muted-foreground">{c.clientPhone || c.clientEmail}</p>
                  </td>
                  <td className="max-w-[200px] truncate p-3">{c.subject}</td>
                  <td className="p-3"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{c.consultationType?.name || "—"}</span></td>
                  <td className="p-3"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${STATUS_MAP[c.status]?.color || ""}`}>{STATUS_MAP[c.status]?.icon} {STATUS_MAP[c.status]?.label || c.status}</span></td>
                  <td className="p-3 font-bold">{c.price > 0 ? `${c.price} د.ع` : "مجاني"}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("ar-IQ")}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedConsult(c)} className="rounded p-1 hover:bg-muted"><Eye className="size-4" /></button>
                      {c.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(c.id, "accepted")} className="rounded p-1 text-green-500 hover:bg-green-50 text-xs">قبول</button>
                          <button onClick={() => updateStatus(c.id, "cancelled")} className="rounded p-1 text-red-500 hover:bg-red-50 text-xs">إلغاء</button>
                        </>
                      )}
                      {c.status === "accepted" && <button onClick={() => updateStatus(c.id, "completed")} className="rounded p-1 text-blue-500 hover:bg-blue-50 text-xs">إنجاز</button>}
                      <button onClick={() => remove(c.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">لا توجد استشارات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedConsult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedConsult(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-background shadow-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">تفاصيل الاستشارة</h2>
              <button onClick={() => setSelectedConsult(null)} className="rounded-lg p-2 hover:bg-muted">✕</button>
            </div>
            <div className="space-y-3 p-6 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">العميل:</span> <span className="font-medium">{selectedConsult.clientName}</span></div>
                <div><span className="text-muted-foreground">الهاتف:</span> <span className="font-medium">{selectedConsult.clientPhone || "—"}</span></div>
                <div><span className="text-muted-foreground">البريد:</span> <span className="font-medium">{selectedConsult.clientEmail || "—"}</span></div>
                <div><span className="text-muted-foreground">النوع:</span> <span className="font-medium">{selectedConsult.consultationType?.name || "—"}</span></div>
                <div><span className="text-muted-foreground">السعر:</span> <span className="font-bold">{selectedConsult.price > 0 ? `${selectedConsult.price} د.ع` : "مجاني"}</span></div>
                <div><span className="text-muted-foreground">الحالة:</span> <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_MAP[selectedConsult.status]?.color || ""}`}>{STATUS_MAP[selectedConsult.status]?.label || selectedConsult.status}</span></div>
              </div>
              <div><span className="text-muted-foreground">الموضوع:</span><p className="mt-1 font-medium">{selectedConsult.subject}</p></div>
              <div><span className="text-muted-foreground">الوصف:</span><p className="mt-1">{selectedConsult.description}</p></div>
              {selectedConsult.response && <div><span className="text-muted-foreground">الرد:</span><p className="mt-1">{selectedConsult.response}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
