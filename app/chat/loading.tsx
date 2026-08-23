export default function ChatLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-muted border-t-accent" />
        <p className="text-sm text-muted-foreground">جاري تحميل المساعد القانوني...</p>
      </div>
    </div>
  );
}
