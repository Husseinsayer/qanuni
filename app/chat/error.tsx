"use client";

import { PageError } from "@/components/page-error";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="خطأ في المساعد القانوني" description="عذراً، حدث خطأ في المساعد الذكي. يرجى المحاولة مرة أخرى." />;
}
