"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus, Pencil, Trash2, Eye,
  Search, ChevronRight, ChevronLeft,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  pending: { label: "قيد المراجعة", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  published: { label: "منشور", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  date: string;
  readingTime: number;
  hue: string;
  views: number;
  status: string;
  createdAt: string;
}

export default function LawyerArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState<"all" | "draft" | "pending" | "published" | "rejected">("all");
  const pageSize = 10;

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/lawyer/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch {
      console.error("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const tabCounts = {
    all: articles.length,
    draft: articles.filter((a) => a.status === "draft").length,
    pending: articles.filter((a) => a.status === "pending").length,
    published: articles.filter((a) => a.status === "published").length,
    rejected: articles.filter((a) => a.status === "rejected").length,
  };

  let filtered = articles;
  if (statusTab !== "all") {
    filtered = filtered.filter((a) => a.status === statusTab);
  }
  if (search) {
    filtered = filtered.filter(
      (a) => a.title.includes(search) || a.category.includes(search)
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * pageSize, current * pageSize);

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/lawyer/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id));
      }
    } catch {
      console.error("Failed to delete article");
    }
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مقالاتي</h1>
        <Link href="/lawyer/dashboard/articles/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            مقال جديد
          </Button>
        </Link>
      </div>

      <div className="flex gap-1 rounded-xl bg-muted/40 p-1 overflow-x-auto">
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

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-4 py-2.5 text-sm outline-none focus:border-accent"
          placeholder="بحث في مقالاتي..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {paged.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {articles.length === 0
                ? "لم تقم بكتابة أي مقالات بعد"
                : "لا توجد مقالات تطابق البحث"}
            </p>
            {articles.length === 0 && (
              <Link href="/lawyer/dashboard/articles/new" className="mt-4 inline-block">
                <Button variant="accent" size="sm">اكتب أول مقال</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paged.map((article) => {
            const cfg = statusConfig[article.status] || statusConfig.draft;
            return (
              <Card key={article.id} className="border-0 shadow-soft hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                          {article.category}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <h3 className="font-bold line-clamp-1">{article.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{article.date}</span>
                        <span>{article.readingTime} دقائق قراءة</span>
                        {article.views > 0 && <span>{article.views} مشاهدة</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/lawyer/dashboard/articles/${article.id}`} className="rounded-lg p-2 hover:bg-muted/60">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <Link href={`/lawyer/dashboard/articles/${article.id}/edit`} className="rounded-lg p-2 hover:bg-muted/60">
                        <Pencil className="h-4 w-4 text-accent" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(article.id)}
                        className="rounded-lg p-2 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30"
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
            className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

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
