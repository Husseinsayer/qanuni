"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus, Pencil, Trash2, X, Search, ChevronRight, ChevronLeft,
  Eye, ArrowUpDown, ArrowUp, ArrowDown, Download,
  CheckCircle, XCircle, Clock,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";

interface ArticleRow {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readingTime: number;
  hue: string;
  views: number;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Pencil },
  pending: { label: "قيد المراجعة", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  published: { label: "منشور", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<"all" | "pending" | "published" | "rejected" | "draft">("all");

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const handleSort = (col: string) => {
    if (sortColumn === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortColumn(col); setSortDir("asc"); }
  };

  const [filterCategory, setFilterCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((res) => res.json())
      .then((data) => setArticles(data.articles || []))
      .catch(() => toast.error("خطأ", "فشل تحميل المقالات"))
      .finally(() => setLoading(false));
  }, []);

  const getEffectiveStatus = (a: ArticleRow): string => a.status || "draft";

  let filteredArticles = articles;
  if (statusTab !== "all") {
    filteredArticles = filteredArticles.filter((a) => getEffectiveStatus(a) === statusTab);
  }
  if (filterCategory) {
    filteredArticles = filteredArticles.filter((a) => a.category === filterCategory);
  }

  const tabCounts = {
    all: articles.length,
    pending: articles.filter((a) => getEffectiveStatus(a) === "pending").length,
    published: articles.filter((a) => getEffectiveStatus(a) === "published").length,
    rejected: articles.filter((a) => getEffectiveStatus(a) === "rejected").length,
    draft: articles.filter((a) => getEffectiveStatus(a) === "draft").length,
  };

  if (sortColumn) {
    filteredArticles = [...filteredArticles].sort((a, b) => {
      const aVal = String((a as unknown as Record<string, unknown>)[sortColumn] ?? "");
      const bVal = String((b as unknown as Record<string, unknown>)[sortColumn] ?? "");
      const cmp = aVal.localeCompare(bVal, "ar", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  const searchFiltered = search
    ? filteredArticles.filter((a) =>
        a.title.includes(search) || a.category.includes(search) || a.author.includes(search)
      )
    : filteredArticles;

  const totalPages = Math.max(1, Math.ceil(searchFiltered.length / pageSize));
  const current = Math.min(page, totalPages);
  const paged = searchFiltered.slice((current - 1) * pageSize, current * pageSize);

  const exportCSV = () => {
    const headers = ["العنوان", "التصنيف", "المؤلف", "التاريخ", "الحالة", "المشاهدات"];
    const rows = filteredArticles.map((a) => [
      a.title, a.category, a.author, a.date,
      statusConfig[getEffectiveStatus(a)]?.label || getEffectiveStatus(a),
      String(a.views),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = "articles-" + new Date().toISOString().slice(0, 10) + ".csv";
    el.click();
    URL.revokeObjectURL(url);
  };

  const categories = [...new Set(articles.map((a) => a.category))];

  const changeStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/articles/" + id + "/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
      if (newStatus === "published") {
        toast.success("تمت الموافقة", "تم نشر المقال");
      } else if (newStatus === "rejected") {
        toast.warning("تم الرفض", "تم رفض المقال");
      } else if (newStatus === "pending") {
        toast.success("قيد المراجعة", "تم إرسال المقال للمراجعة");
      }
    } catch {
      toast.error("خطأ", "فشل تغيير الحالة");
    }
  };

  const remove = async (id: string) => {
    const article = articles.find((a) => a.id === id);
    try {
      const res = await fetch("/api/admin/articles/" + id, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success("تم الحذف", "تم حذف المقال \"" + (article?.title || "") + "\"");
    } catch {
      toast.error("خطأ", "فشل حذف المقال");
    }
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المقالات</h1>
        <Link href="/admin/articles/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            إضافة جديد
          </Button>
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-muted/40 p-1 overflow-x-auto">
        {([
          { key: "all" as const, label: "الجميع" },
          { key: "pending" as const, label: "قيد المراجعة" },
          { key: "published" as const, label: "منشور" },
          { key: "rejected" as const, label: "مرفوض" },
          { key: "draft" as const, label: "مسودة" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusTab(tab.key); setPage(1); }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              statusTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
              statusTab === tab.key ? "bg-accent text-white" : "bg-muted text-muted-foreground"
            }`}>
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">عرض {paged.length} من {searchFiltered.length} مقال</p>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4" />
          تصدير CSV
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
            placeholder="بحث..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="min-w-[130px] rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-accent">
          <option value="">كل التصنيفات</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {[
                    { key: "title", label: "العنوان" },
                    { key: "category", label: "التصنيف" },
                    { key: "author", label: "المؤلف" },
                    { key: "date", label: "التاريخ" },
                  ].map(({ key, label }) => (
                    <th key={key} className="px-4 py-3 text-right font-semibold">
                      <button onClick={() => handleSort(key)} className="flex items-center gap-1 hover:text-accent transition-colors">
                        {label}
                        {sortColumn === key ? (
                          sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold">المشاهدات</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((article) => {
                  const status = getEffectiveStatus(article);
                  const cfg = statusConfig[status] || statusConfig.draft;
                  return (
                    <tr key={article.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium max-w-xs truncate">
                        <Link href={"/admin/articles/" + article.id} className="text-accent hover:underline">
                          {article.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{article.category}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{article.author}</td>
                      <td className="px-4 py-3 text-muted-foreground">{article.date}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{article.views.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {status === "pending" && (
                            <>
                              <button
                                onClick={() => changeStatus(article.id, "published")}
                                className="rounded-lg p-1.5 hover:bg-green-50 dark:hover:bg-green-950/20"
                                title="موافقة"
                              >
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                              </button>
                              <button
                                onClick={() => changeStatus(article.id, "rejected")}
                                className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="رفض"
                              >
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                              </button>
                            </>
                          )}
                          {status === "draft" && (
                            <button
                              onClick={() => changeStatus(article.id, "pending")}
                              className="rounded-lg p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                              title="إرسال للمراجعة"
                            >
                              <Clock className="h-3.5 w-3.5 text-amber-500" />
                            </button>
                          )}
                          {status === "rejected" && (
                            <button
                              onClick={() => changeStatus(article.id, "draft")}
                              className="rounded-lg p-1.5 hover:bg-muted/60"
                              title="إعادة كمسودة"
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          )}
                          <Link href={"/admin/articles/" + article.id} className="rounded-lg p-1.5 hover:bg-muted/60">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </Link>
                          <Link href={"/admin/articles/" + article.id + "/edit"} className="rounded-lg p-1.5 hover:bg-muted/60">
                            <Pencil className="h-3.5 w-3.5 text-accent" />
                          </Link>
                          <button onClick={() => setDeleteConfirm(article.id)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      لا توجد مقالات في هذا القسم
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${p === page ? "bg-accent text-white" : "hover:bg-muted/60"}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <span className="text-sm text-muted-foreground">صفحة {current} من {totalPages}</span>
        <select
          className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none"
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
        >
          {[5, 10, 25, 50].map((s) => <option key={s} value={s}>{s} / صفحة</option>)}
        </select>
      </div>

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => remove(deleteConfirm!)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
