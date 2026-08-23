"use client";

import { PageError } from "@/components/page-error";

export default function LawsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="خطأ في تحميل القوانين" description="عذراً، حدث خطأ أثناء تحميل القوانين. يرجى المحاولة مرة أخرى." />;
}
