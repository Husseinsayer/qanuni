"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Eye, Calendar, User, Pencil } from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  pending: "قيد المراجعة",
  published: "منشور",
  rejected: "مرفوض",
};

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then((r) => r.json())
      .then((d) => { setArticle(d.article || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-lg text-muted-foreground">لم يتم العثور على المقال</p>
        <Link href="/admin/articles">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4" />
            العودة إلى المقالات
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/articles" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4" />
          العودة إلى المقالات
        </Link>
        <Link href={`/admin/articles/${article.id}/edit`}>
          <Button size="sm">
            <Pencil className="h-4 w-4" />
            تعديل المقال
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{article.category}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              article.status === "published" ? "bg-green-100 text-green-700" :
              article.status === "pending" ? "bg-amber-100 text-amber-700" :
              article.status === "rejected" ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {statusLabels[article.status] || article.status}
            </span>
          </div>

          <h1 className="mb-4 text-2xl font-bold">{article.title}</h1>

          <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {article.author && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readingTime} دقيقة قراءة
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {(article.views || 0).toLocaleString()} مشاهدة
            </span>
          </div>

          {article.excerpt && (
            <p className="mb-6 rounded-xl bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
          )}

          {article.content && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:border-r-4 [&_h2]:border-accent [&_h2]:pr-3 [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
