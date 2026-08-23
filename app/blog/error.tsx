"use client";

import { PageError } from "@/components/page-error";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="خطأ في تحميل المدونة" description="عذراً، حدث خطأ أثناء تحميل المقالات. يرجى المحاولة مرة أخرى." />;
}
