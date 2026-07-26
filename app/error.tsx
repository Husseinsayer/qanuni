"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">حدث خطأ ما</h2>
      <p className="text-muted-foreground">خطأ غير متوقع. يرجى المحاولة مرة أخرى.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-accent px-4 py-2 text-white hover:bg-accent/90"
      >
        حاول مرة أخرى
      </button>
    </div>
  );
}
