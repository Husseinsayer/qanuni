"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-700" },
  pending: { label: "قيد المراجعة", color: "bg-amber-100 text-amber-700" },
  published: { label: "منشور", color: "bg-green-100 text-green-700" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-700" },
};

export default function LawyerArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/lawyer/articles/${params.id}`)
      .then((r) => r.json())
      .then((d) => { setArticle(d.article); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const remove = async () => {
    const res = await fetch(`/api/lawyer/articles/${params.id}`, { method: "DELETE" });
    if (res.ok) router.push("/lawyer/dashboard/articles");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!article) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <p className="text-muted-foreground">المقال غير موجود</p>
          <Link href="/lawyer/dashboard/articles" className="mt-4 inline-block">
            <Button variant="accent" size="sm">العودة</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const cfg = statusConfig[article.status] || statusConfig.draft;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/lawyer/dashboard/articles" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Link>
          <h1 className="text-2xl font-bold">تفاصيل المقال</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/lawyer/dashboard/articles/${params.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-4 w-4" />
              تعديل
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-1.5 text-red-500 hover:bg-red-50" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-soft">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{article.category}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
          </div>
          <h2 className="text-xl font-bold">{article.title}</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{article.author}</span>
            <span>{article.date}</span>
            <span>{article.readingTime} دقائق قراءة</span>
          </div>
          {article.excerpt && (
            <p className="text-muted-foreground leading-relaxed">{article.excerpt}</p>
          )}
          {article.content && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none mt-4 border-t border-border pt-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا المقال؟"
        onConfirm={remove}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
