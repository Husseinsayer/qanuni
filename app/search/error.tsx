"use client";

import { PageError } from "@/components/page-error";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="خطأ في البحث" description="عذراً، حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى." />;
}
