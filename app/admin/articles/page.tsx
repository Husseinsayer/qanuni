"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../admin-context";
import { Plus, Pencil, Trash2, X, Search, ChevronRight, ChevronLeft, Eye } from "lucide-react";
import { useAdminTable } from "@/lib/use-admin-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";

export default function ArticlesAdminPage() {
  const { data, update } = useAdminContext();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const remove = (id: string) => {
    const article = data.articles.find((a) => a.id === id);
    update("articles", data.articles.filter((a) => a.id !== id));
    const newBodies = { ...data.articleBodies };
    delete newBodies[id];
    update("articleBodies", newBodies);
    toast.success("تم الحذف", `تم حذف المقال "${article?.title || ""}"`);
    setDeleteConfirm(null);
  };

  const { search, setSearch, page, setPage, pageSize, setPageSize, paged, totalPages, total } = useAdminTable(data.articles, ["title", "category", "author"]);

  const getLawyerName = (lawyerId: string) => data.lawyers.find((l) => l.id === lawyerId)?.name || "—";

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

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">عرض {paged.length} من {total} مقال</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">العنوان</th>
                  <th className="px-4 py-3 text-right font-semibold">التصنيف</th>
                  <th className="px-4 py-3 text-right font-semibold">المحامي</th>
                  <th className="px-4 py-3 text-right font-semibold">التاريخ</th>
                  <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((article) => (
                  <tr key={article.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium max-w-xs truncate">
                      <Link href={`/admin/articles/${article.id}`} className="text-accent hover:underline">
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{article.category}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{getLawyerName(article.lawyerId)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{article.date}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${article.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {article.status === "published" ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/articles/${article.id}`} className="rounded-lg p-1.5 hover:bg-muted/60">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                        <Link href={`/admin/articles/${article.id}/edit`} className="rounded-lg p-1.5 hover:bg-muted/60">
                          <Pencil className="h-3.5 w-3.5 text-accent" />
                        </Link>
                        <button onClick={() => setDeleteConfirm(article.id)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
        <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
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
