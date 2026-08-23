"use client";

export default function LawyerProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4" dir="rtl">
      <h2 className="text-2xl font-bold">تعذر تحميل ملف المحامي</h2>
      <p className="text-muted-foreground">حدث خطأ أثناء تحميل الملف. يرجى المحاولة مرة أخرى.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-accent px-4 py-2 text-white hover:bg-accent/90"
      >
        حاول مرة أخرى
      </button>
    </div>
  );
}
