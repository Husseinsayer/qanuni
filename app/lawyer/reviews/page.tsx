"use client";

import { useEffect, useState } from "react";
import { Star, Check, MessageCircle, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMyReviews, addReply, seedLawyerDemoData, type Review,
} from "@/lib/lawyer-profiles";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    seedLawyerDemoData();
    setReviews(getMyReviews());
  }, []);

  const handleReply = (id: string) => {
    if (!replyText.trim()) return;
    addReply(id, replyText.trim());
    setReviews(getMyReviews());
    setReplyingId(null);
    setReplyText("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">التقييمات</h1>
          <p className="mt-1 text-muted-foreground">({reviews.length}) تقييم من العملاء — يمكنك الرد على التقييمات فقط</p>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success flex items-center gap-2">
          <Check className="size-4" /> تم حفظ الرد ✓
        </div>
      )}

      {/* Average Rating */}
      <Card className="border-0 shadow-soft bg-gradient-to-br from-accent/5 to-accent/10">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-extrabold text-accent">{avgRating}</p>
            <div className="flex items-center gap-0.5 mt-1 justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("size-4", i < Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} تقييم</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-left font-semibold">{star}</span>
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-xs text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 && (
          <Card className="border-0 shadow-soft">
            <CardContent className="py-10 text-center">
              <MessageCircle className="mx-auto mb-3 size-10 text-muted-foreground/30" />
              <p className="text-lg font-semibold">لا توجد تقييمات بعد</p>
              <p className="text-sm text-muted-foreground">عندما يقوم العملاء بتقييمك ستظهر هنا</p>
            </CardContent>
          </Card>
        )}
        {reviews.map((r) => (
          <Card key={r.id} className="border-0 shadow-soft">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-sm">
                    {r.clientName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{r.clientName}</p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <div className="flex items-center gap-0.5 mr-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("size-3.5", i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{r.text}</p>
              {r.service && (
                <span className="inline-block rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                  {r.service}
                </span>
              )}

              {/* Reply Section */}
              {r.reply ? (
                <div className="mr-6 mt-3 rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Send className="size-3" />
                    <span>رد المحامي{r.replyDate ? ` · ${r.replyDate}` : ""}</span>
                  </div>
                  <p className="text-sm">{r.reply}</p>
                </div>
              ) : replyingId === r.id ? (
                <div className="mr-6 mt-3 space-y-3">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3}
                    className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-accent resize-y"
                    placeholder="اكتب ردك على هذا التقييم..." />
                  <div className="flex gap-2">
                    <Button onClick={() => handleReply(r.id)} variant="accent" size="sm" className="gap-2">
                      <Send className="size-4" /> إرسال الرد
                    </Button>
                    <Button onClick={() => { setReplyingId(null); setReplyText(""); }} variant="ghost" size="sm">
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setReplyingId(r.id)}
                  className="mt-2 flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                  <MessageCircle className="size-4" />
                  رد على التقييم
                </button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
