export default function BlogLoading() {
  return (
    <div className="container py-16">
      <div className="mb-8 h-10 w-48 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
