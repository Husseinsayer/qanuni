"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../../admin-context";
import { ArrowRight, Clock, Eye, Calendar, User, Pencil } from "lucide-react";

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useAdminContext();
  const article = data.articles.find((a) => a.id === id);
  const bodies = data.articleBodies[id] || [];
  const lawyer = data.lawyers.find((l) => l.id === article?.lawyerId);

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
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${article.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {article.status === "published" ? "منشور" : "مسودة"}
            </span>
          </div>

          <h1 className="mb-4 text-2xl font-bold">{article.title}</h1>

          <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {lawyer && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {lawyer.name}
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
              {article.views.toLocaleString()} مشاهدة
            </span>
          </div>

          {article.excerpt && (
            <p className="mb-6 rounded-xl bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
          )}

          <div className="space-y-5">
            {bodies.map((block, idx) => (
              <div key={idx}>
                {block.h && <h2 className="mb-2 text-lg font-bold">{block.h}</h2>}
                <p className="leading-relaxed text-muted-foreground">{block.p}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
