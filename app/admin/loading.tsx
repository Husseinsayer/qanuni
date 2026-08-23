export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6" dir="rtl">
      <div className="h-10 w-48 rounded-xl bg-muted/50 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-muted/50" />
              <div>
                <div className="h-8 w-16 rounded-lg bg-muted/50 mb-2" />
                <div className="h-3 w-24 rounded-lg bg-muted/50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
