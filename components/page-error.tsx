"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageError({
  error,
  reset,
  title = "حدث خطأ",
  description = "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">{title}</h2>
      <p className="mb-6 max-w-md text-muted-foreground">{description}</p>
      {error?.digest && (
        <p className="mb-4 text-xs text-muted-foreground/60">
          Error ID: {error.digest}
        </p>
      )}
      {reset && (
        <Button variant="primary" onClick={reset}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
