export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-8" dir="rtl">
      {/* Hero skeleton */}
      <div className="rounded-3xl bg-muted/30 p-8 animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-muted/50 mb-4" />
        <div className="h-4 w-96 rounded-lg bg-muted/50 mb-2" />
        <div className="h-4 w-80 rounded-lg bg-muted/50" />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse">
            <div className="h-12 w-12 rounded-xl bg-muted/50 mb-4" />
            <div className="h-5 w-3/4 rounded-lg bg-muted/50 mb-2" />
            <div className="h-3 w-full rounded-lg bg-muted/50 mb-1" />
            <div className="h-3 w-2/3 rounded-lg bg-muted/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
