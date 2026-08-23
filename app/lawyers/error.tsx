"use client";

import { PageError } from "@/components/page-error";

export default function LawyersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="خطأ في تحميل المحامين" description="عذراً، حدث خطأ أثناء تحميل دليل المحامين. يرجى المحاولة مرة أخرى." />;
}
