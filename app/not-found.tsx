import { Scale, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-16 text-center">
      <div>
        <span className="mx-auto grid size-16 place-items-center rounded-2xl gradient-primary text-white shadow-soft">
          <Scale className="size-8" />
        </span>
        <h1 className="mt-6 text-5xl font-extrabold">404</h1>
        <p className="mt-2 text-lg font-semibold">الصفحة غير موجودة</p>
        <p className="mt-1 text-sm text-muted-foreground">
          عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
        >
          <ArrowLeft className="size-4" /> العودة إلى الرئيسية
        </a>
      </div>
    </div>
  );
}
