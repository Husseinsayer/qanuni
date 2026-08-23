// ===== Iraqi Legal Assistant - Rating Component =====
"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Flag } from "lucide-react";

type RatingProps = {
  messageId: string;
  onRate: (rating: number, feedback?: string) => void;
  initialRating?: number;
};

export function Rating({ onRate, initialRating }: RatingProps) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(!!initialRating);

  const handleRate = (value: number) => {
    if (submitted) return;
    setRating(value);
    setSubmitted(true);
    onRate(value);
  };

  const handleFeedback = () => {
    if (feedback.trim()) {
      onRate(rating, feedback);
      setShowFeedback(false);
    }
  };

  if (submitted && !showFeedback) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>شكراً لتقييمك</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= rating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        {rating <= 2 && (
          <button
            onClick={() => setShowFeedback(true)}
            className="text-accent hover:underline"
          >
            ملاحظات؟
          </button>
        )}
      </div>
    );
  }

  if (showFeedback) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="اكتب ملاحظاتك..."
          className="flex-1 max-w-xs rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleFeedback()}
        />
        <button
          onClick={handleFeedback}
          className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90"
        >
          إرسال
        </button>
        <button
          onClick={() => setShowFeedback(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          إلغاء
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">هل كانت الإجابة مفيدة؟</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => handleRate(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= (hoveredStar || rating)
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// === Quick Feedback Buttons ===
type QuickFeedbackProps = {
  messageId: string;
  onFeedback: (type: "helpful" | "not_helpful" | "report", details?: string) => void;
};

export function QuickFeedback({ onFeedback }: QuickFeedbackProps) {
  const [reported, setReported] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onFeedback("helpful")}
        className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-muted-foreground hover:text-green-600 transition-colors"
        title="مفيد"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFeedback("not_helpful")}
        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors"
        title="غير مفيد"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          setReported(true);
          onFeedback("report");
        }}
        className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 text-muted-foreground hover:text-orange-600 transition-colors"
        title="إبلاغ"
        disabled={reported}
      >
        <Flag className="w-4 h-4" />
      </button>
    </div>
  );
}
