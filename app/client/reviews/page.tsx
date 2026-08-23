"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2, ExternalLink, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  lawyer: {
    id: string;
    name: string;
    specialization: string;
    city: string;
    initials: string;
    hue: string;
  };
}

export default function ClientReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/client/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    } catch {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
    setDeleting(reviewId);
    try {
      const res = await fetch(`/api/client/reviews?id=${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } catch {
      console.error("Failed to delete review");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">تقييماتي</h1>
        <p className="mt-1 text-muted-foreground">
          جميع التقييمات التي قمت بها للمحامين
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-bold text-muted-foreground">لا توجد تقييمات بعد</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              يمكنك تقييم المحامين من صفحة ملفهم الشخصي
            </p>
            <Link href="/lawyers" className="mt-4">
              <Button variant="accent" className="gap-2">
                <ExternalLink className="size-4" />
                تصفح المحامين
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white font-bold", review.lawyer.hue)}>
                      {review.lawyer.initials}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/lawyers/${review.lawyer.id}`} className="font-bold hover:text-accent transition-colors">
                        {review.lawyer.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {review.lawyer.specialization} — {review.lawyer.city}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={cn("size-4", n <= review.rating ? "fill-gold text-gold" : "text-muted-foreground/30")}
                          />
                        ))}
                        <span className="mr-2 text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("ar-IQ")}
                        </span>
                      </div>
                      {review.content && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {review.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deleting === review.id}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
