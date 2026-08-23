"use client";

import { PageError } from "@/components/page-error";

export default function ServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="خطأ في تحميل الخدمات" description="عذراً، حدث خطأ أثناء تحميل الخدمات. يرجى المحاولة مرة أخرى." />;
}
