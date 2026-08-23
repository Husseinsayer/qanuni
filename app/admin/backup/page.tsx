"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Shield,
  Clock,
  HardDrive,
  CheckCircle,
  Loader2,
  FileJson,
  Eye,
  X,
} from "lucide-react";
import { toast } from "@/lib/admin-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface BackupMeta {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  modelCounts: Record<string, number>;
  totalRecords: number;
  checksum: string;
}

interface DbStats {
  [modelName: string]: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-IQ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BackupAdminPage() {
  const [backups, setBackups] = useState<BackupMeta[]>([]);
  const [stats, setStats] = useState<DbStats>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [viewingBackup, setViewingBackup] = useState<BackupMeta | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [backupsRes, statsRes] = await Promise.all([
        fetch("/api/admin/backup"),
        fetch("/api/admin/backup?action=stats"),
      ]);
      if (backupsRes.ok) {
        const { backups: b } = await backupsRes.json();
        setBackups(b);
      }
      if (statsRes.ok) {
        const { stats: s } = await statsRes.json();
        setStats(s);
      }
    } catch {
      toast.error("خطأ", "تعذر تحميل البيانات");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      if (res.ok) {
        const { meta } = await res.json();
        toast.success("تم النسخ الاحتياطي", `تم إنشاء نسخة احتياطية: ${meta.id}`);
        await fetchData();
      } else {
        const err = await res.json();
        toast.error("فشل", err.error || "حدث خطأ");
      }
    } catch {
      toast.error("خطأ", "تعذر الاتصال بالخادم");
    }
    setCreating(false);
  };

  const handleRestore = async (filename: string) => {
    setRestoring(filename);
    setConfirmRestore(null);
    try {
      const res = await fetch("/api/admin/backup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      if (res.ok) {
        const { counts } = await res.json();
        const total = Object.values(counts as Record<string, number>).reduce((a, b) => a + b, 0);
        toast.success("تمت الاستعادة", `تم استعادة ${total} سجل من النسخة الاحتياطية`);
        await fetchData();
      } else {
        const err = await res.json();
        toast.error("فشل", err.error || "حدث خطأ");
      }
    } catch {
      toast.error("خطأ", "تعذر الاتصال بالخادم");
    }
    setRestoring(null);
  };

  const handleDelete = async (filename: string) => {
    setDeleting(filename);
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/admin/backup?file=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("تم الحذف", "تم حذف النسخة الاحتياطية");
        await fetchData();
      } else {
        toast.error("فشل", "تعذر الحذف");
      }
    } catch {
      toast.error("خطأ", "تعذر الاتصال بالخادم");
    }
    setDeleting(null);
  };

  const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);
  const activeModels = Object.entries(stats).filter(([, v]) => v > 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">النسخ الاحتياطي والاستعادة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            نسخ احتياطي لجميع بيانات الموقع واستعادتها
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button size="sm" onClick={handleCreate} disabled={creating}>
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            إنشاء نسخة احتياطية
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-blue-200/50 bg-blue-50/50 dark:border-blue-800/30 dark:bg-blue-950/20">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
              <p className="mt-0.5 text-2xl font-bold">{totalRecords.toLocaleString("ar-IQ")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200/50 bg-green-50/50 dark:border-green-800/30 dark:bg-green-950/20">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <HardDrive className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">النسخ الاحتياطية</p>
              <p className="mt-0.5 text-2xl font-bold">{backups.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الجداول النشطة</p>
              <p className="mt-0.5 text-2xl font-bold">{activeModels.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Structure */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            هيكل قاعدة البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {activeModels.map(([model, count]) => (
                <div
                  key={model}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2"
                >
                  <span className="text-xs font-medium text-muted-foreground">{model}</span>
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                    {count.toLocaleString("ar-IQ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            النسخ الاحتياطية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HardDrive className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">لا توجد نسخ احتياطية بعد</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                أنشئ نسخة احتياطية للحفاظ على بياناتك
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-right font-semibold">التاريخ</th>
                    <th className="px-4 py-3 text-right font-semibold">المعرف</th>
                    <th className="px-4 py-3 text-right font-semibold">الحجم</th>
                    <th className="px-4 py-3 text-right font-semibold">السجلات</th>
                    <th className="px-4 py-3 text-right font-semibold">التحقق</th>
                    <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => (
                    <tr key={backup.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatDate(backup.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {backup.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <FileJson className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatBytes(backup.sizeBytes)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                          {backup.totalRecords.toLocaleString("ar-IQ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewingBackup(backup)}
                            className="rounded-lg p-1.5 hover:bg-muted/60"
                            title="عرض التفاصيل"
                          >
                            <Eye className="h-3.5 w-3.5 text-accent" />
                          </button>
                          <button
                            onClick={() => setConfirmRestore(backup.filename)}
                            disabled={restoring === backup.filename}
                            className="rounded-lg p-1.5 hover:bg-green-50 dark:hover:bg-green-950/20 disabled:opacity-50"
                            title="استعادة"
                          >
                            {restoring === backup.filename ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-green-500" />
                            ) : (
                              <Upload className="h-3.5 w-3.5 text-green-500" />
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(backup.filename)}
                            disabled={deleting === backup.filename}
                            className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                            title="حذف"
                          >
                            {deleting === backup.filename ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        open={confirmRestore !== null}
        title="تأكيد الاستعادة"
        message="هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم حذف جميع البيانات الحالية واستعادتها من النسخة الاحتياطية. هذا الإجراء لا يمكن التراجع عنه."
        onConfirm={() => confirmRestore && handleRestore(confirmRestore)}
        onCancel={() => setConfirmRestore(null)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذه النسخة الاحتياطية؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* View Backup Details Modal */}
      {viewingBackup && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setViewingBackup(null)}>
          <Card className="my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-accent" />
                تفاصيل النسخة الاحتياطية
              </CardTitle>
              <button onClick={() => setViewingBackup(null)} className="rounded-lg p-1 hover:bg-muted/60">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">المعرف: </span>
                  <span className="font-mono font-medium">{viewingBackup.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">التاريخ: </span>
                  <span className="font-medium">{formatDate(viewingBackup.createdAt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">الحجم: </span>
                  <span className="font-medium">{formatBytes(viewingBackup.sizeBytes)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">إجمالي السجلات: </span>
                  <span className="font-bold text-accent">{viewingBackup.totalRecords.toLocaleString("ar-IQ")}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <h4 className="mb-3 text-sm font-bold text-accent">عدد السجلات حسب الجدول</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(viewingBackup.modelCounts)
                    .filter(([, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([model, count]) => (
                      <div key={model} className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-1.5">
                        <span className="text-xs text-muted-foreground">{model}</span>
                        <span className="text-xs font-bold">{count.toLocaleString("ar-IQ")}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <h4 className="mb-2 text-sm font-bold text-accent">Checksum</h4>
                <p className="break-all font-mono text-xs text-muted-foreground">{viewingBackup.checksum}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
