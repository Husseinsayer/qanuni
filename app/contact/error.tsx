"use client";

import { PageError } from "@/components/page-error";

export default function ContactError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="خطأ في صفحة التواصل" description="عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." />;
}
