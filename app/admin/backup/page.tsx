"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Database,
  Download,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  FileJson,
  RefreshCw,
  HardDrive,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminContext } from "@/app/admin/admin-context";

type BackupEntry = {
  id: string;
  name: string;
  date: string;
  size: string;
  keys: string[];
};

const BACKUP_HISTORY_KEY = "admin_backup_history";
const ALL_STORAGE_KEYS = [
  "admin_site_data",
  "user_accounts",
  "user_session",
  "lawyer_profiles",
  "lawyer_extended_data",
  "admin_session",
  "analytics_page_views",
  "favorites",
  "saved_articles",
  // Articles & Laws
  "admin_articles",
  "admin_laws",
  // Knowledge Center
  "kc_procedures",
  "kc_templates",
  "kc_services",
  "kc_qa",
  "kc_terms",
  "kc_governments",
  "kc_documents",
  "kc_keywords",
  // AI Assistant
  "ai_settings",
  "ai_faqs",
  "ai_conversations",
  "ai_analytics",
  // Ads & Banners
  "admin_ads",
  "admin_banners",
  "admin_html_codes",
  // Law Firms
  "admin_law_firms",
  // SEO
  "admin_seo",
  // Theme & Settings
  "admin_theme",
  "admin_settings",
  // Activity Log
  "admin_activity_log",
] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getBackupHistory(): BackupEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BACKUP_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveBackupHistory(history: BackupEntry[]): void {
  localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history));
}

function collectAllData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const key of ALL_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      data[key] = raw ? JSON.parse(raw) : null;
    } catch { data[key] = null; }
  }
  // Also include all dynamic keys from localStorage (reviews, chat, messages, knowledge center items, etc.)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !(ALL_STORAGE_KEYS as readonly string[]).includes(key)) {
      try {
        // Include all remaining keys that aren't in the static list
        const raw = localStorage.getItem(key);
        if (raw) {
          data[key] = JSON.parse(raw);
        }
      } catch { /* skip non-JSON keys */ }
    }
  }
  return data;
}

function restoreAllData(data: Record<string, unknown>): { success: number; failed: number } {
  let success = 0;
  let failed = 0;
  // First restore the static keys
  for (const key of ALL_STORAGE_KEYS) {
    try {
      if (data[key] !== null && data[key] !== undefined) {
        localStorage.setItem(key, JSON.stringify(data[key]));
        success++;
      }
    } catch { failed++; }
  }
  // Then restore all dynamic keys from the backup
  for (const key of Object.keys(data)) {
    if (!(ALL_STORAGE_KEYS as readonly string[]).includes(key)) {
      try {
        if (data[key] !== null && data[key] !== undefined) {
          localStorage.setItem(key, JSON.stringify(data[key]));
          success++;
        }
      } catch { failed++; }
    }
  }
  return { success, failed };
}

export default function BackupPage() {
  const { data: adminData, update } = useAdminContext();
  const [history, setHistory] = useState<BackupEntry[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setHistory(getBackupHistory()); }, []);

  const showStatus = useCallback((type: "success" | "error", msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 4000);
  }, []);

  const handleCreateBackup = () => {
    setLoading(true);
    try {
      const allData = collectAllData();
      const json = JSON.stringify(allData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      const now = new Date();
      const filename = `backup-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}.json`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      // Record in history
      const entry: BackupEntry = {
        id: `bkp-${Date.now()}`,
        name: filename,
        date: new Date().toISOString(),
        size: formatBytes(blob.size),
        keys: Object.keys(allData),
      };
      const updated = [entry, ...history].slice(0, 20);
      saveBackupHistory(updated);
      setHistory(updated);
      showStatus("success", `✅ تم إنشاء النسخة الاحتياطية بنجاح (${entry.size})`);
    } catch (e) {
      showStatus("error", "❌ فشل إنشاء النسخة الاحتياطية");
    }
    setLoading(false);
  };

  const handleRestore = (file: File) => {
    setRestoring(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as Record<string, unknown>;
        const result = restoreAllData(data);
        showStatus("success", `✅ تمت استعادة ${result.success} عنصر بنجاح (فشل ${result.failed}) — سيتم إعادة تحميل الصفحة`);
        setTimeout(() => window.location.reload(), 2000);
      } catch {
        showStatus("error", "❌ الملف غير صالح — تأكد من اختيار ملف نسخة احتياطية صحيح");
      }
      setRestoring(false);
    };
    reader.onerror = () => { showStatus("error", "❌ فشل قراءة الملف"); setRestoring(false); };
    reader.readAsText(file);
  };

  const handleDeleteBackup = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveBackupHistory(updated);
    setHistory(updated);
    showStatus("success", "🗑️ تم حذف النسخة من السجل");
  };

  const handleDownloadBackup = (entry: BackupEntry) => {
    // Re-create from stored data or just download the stored reference
    const allData = collectAllData();
    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = entry.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Database className="size-8 text-accent" />
            النسخ الاحتياطي والاستعادة
          </h1>
          <p className="mt-1 text-muted-foreground">
            احفظ نسخة احتياطية كاملة من جميع بيانات الموقع واستعدها عند الحاجة
          </p>
        </div>
      </div>

      {status && (
        <div className={cn(
          "rounded-2xl border px-5 py-4 text-sm font-medium flex items-center gap-3 shadow-soft transition-all",
          status.type === "success" ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"
        )}>
          {status.type === "success" ? <Check className="size-5" /> : <AlertTriangle className="size-5" />}
          {status.msg}
        </div>
      )}

      {/* Backup / Restore Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* إنشاء نسخة احتياطية */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <div className="h-1.5 bg-gradient-to-l from-accent to-accent/50" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Download className="size-5 text-accent" />
              إنشاء نسخة احتياطية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              إنشاء نسخة احتياطية كاملة تشمل جميع بيانات الموقع: الإعدادات، المحامين، الحسابات، المقالات، الإعلانات، التحليلات، والمزيد.
            </p>
            <div className="rounded-xl bg-muted/30 border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <HardDrive className="size-3.5" /> سيتم نسخ البيانات التالية:
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {["إعدادات الموقع", "المحامين", "المستخدمين", "الحسابات", "الإعلانات", "التحليلات", "التفضيلات", "التقييمات"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="size-3 text-success" /> {item}
                  </span>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateBackup} disabled={loading} variant="accent" size="lg" className="w-full gap-2 shadow-soft">
              {loading ? <RefreshCw className="size-4 animate-spin" /> : <Download className="size-4" />}
              {loading ? "جارٍ الإنشاء..." : "إنشاء نسخة احتياطية"}
            </Button>
          </CardContent>
        </Card>

        {/* استعادة نسخة احتياطية */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <div className="h-1.5 bg-gradient-to-l from-amber-500 to-orange-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Upload className="size-5 text-amber-500" />
              استعادة نسخة احتياطية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              استعادة البيانات من ملف النسخة الاحتياطية. سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف.
            </p>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">تنبيه مهم</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    الاستعادة ستستبدل جميع البيانات الحالية. يُفضل إنشاء نسخة احتياطية قبل الاستعادة.
                  </p>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleRestore(file);
                e.target.value = "";
              }}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={restoring}
              variant="gold"
              size="lg"
              className="w-full gap-2 shadow-soft"
            >
              {restoring ? <RefreshCw className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {restoring ? "جارٍ الاستعادة..." : "اختيار ملف واستعادة"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="size-5 text-accent" />
            سجل النسخ الاحتياطي
            {history.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({history.length})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <Database className="mx-auto mb-3 size-12 text-muted-foreground/20" />
              <p className="text-lg font-semibold">لا توجد نسخ احتياطية</p>
              <p className="text-sm text-muted-foreground">قم بإنشاء أول نسخة احتياطية الآن</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-accent/30 hover:bg-accent/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                      <FileJson className="size-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleString("ar-IQ")} · {entry.size} · {entry.keys.length} عنصر
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDownloadBackup(entry)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-accent/10 hover:text-accent transition"
                      title="تحميل النسخة"
                    >
                      <Download className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(entry.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger transition"
                      title="حذف من السجل"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Admin Settings */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="size-5 text-accent" />
            تصدير إعدادات الإدارة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            تصدير إعدادات لوحة التحكم فقط (بدون بيانات المستخدمين والمحامين) لمشاركتها بين بيئات مختلفة.
          </p>
          <Button
            onClick={() => {
              const json = JSON.stringify(adminData, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `admin-settings-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              showStatus("success", "✅ تم تصدير إعدادات الإدارة بنجاح");
            }}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileJson className="size-4" />
            تصدير إعدادات الإدارة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
