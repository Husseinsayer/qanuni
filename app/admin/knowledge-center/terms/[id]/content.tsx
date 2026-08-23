"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getItems } from "@/lib/knowledge-center/store";
import { type LegalTerm } from "@/lib/knowledge-center/types";
import { ChevronRight, Pencil, ArrowLeft } from "lucide-react";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<LegalTerm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = getItems("terms", true);
    const found = items.find((item) => item.id === id);
    setBook(found ?? null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-muted-foreground">لم يتم العثور على الكتاب</p>
        <Button onClick={() => router.push("/admin/knowledge-center/terms")}>
          <ArrowLeft className="ml-2 h-4 w-4" /> العودة
        </Button>
      </div>
    );
  }

  const title = book.documentTitle || book.name;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/knowledge-center" className="hover:text-accent">مركز المعرفة</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/knowledge-center/terms" className="hover:text-accent">الكتب والمؤلفات</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold truncate">{title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/knowledge-center/terms?id=${book.id}`)}>
            <Pencil className="ml-1 h-4 w-4" /> تعديل
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Book metadata */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">معلومات الكتاب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">المؤلف/الناشر</label>
              <p className="mt-0.5 text-sm">{book.author || "غير محدد"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">تاريخ الإصدار</label>
              <p className="mt-0.5 text-sm">{book.publicationDate || "غير محدد"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">التصنيف</label>
              <p className="mt-0.5 text-sm">{book.category || "عام"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">الحالة</label>
              <p className="mt-0.5">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${book.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {book.isActive ? "فعال" : "مخفي"}
                </span>
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">تاريخ الإضافة</label>
              <p className="mt-0.5 text-sm">{book.createdAt ? new Date(book.createdAt).toLocaleDateString("ar-IQ") : "-"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">آخر تحديث</label>
              <p className="mt-0.5 text-sm">{book.updatedAt ? new Date(book.updatedAt).toLocaleDateString("ar-IQ") : "-"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Book content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Full content */}
          {book.documentContent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">محتوى الكتاب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap rounded-lg bg-muted/30 p-4 text-sm leading-relaxed">
                  {book.documentContent}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Definitions */}
          {(book.simplifiedDefinition || book.legalDefinition) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">تعريفات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {book.simplifiedDefinition && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">تعريف مبسط</label>
                    <p className="mt-0.5 text-sm">{book.simplifiedDefinition}</p>
                  </div>
                )}
                {book.legalDefinition && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">تعريف قانوني</label>
                    <p className="mt-0.5 text-sm">{book.legalDefinition}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Examples */}
          {book.examples && book.examples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">أمثلة</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {book.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Keywords */}
          {book.keywords && book.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">كلمات مفتاحية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {book.keywords.map((kw, i) => (
                    <span key={i} className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      {kw}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {book.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{book.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Back button */}
      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push("/admin/knowledge-center/terms")}>
          <ArrowLeft className="ml-2 h-4 w-4" /> العودة إلى قائمة الكتب
        </Button>
      </div>
    </div>
  );
}
