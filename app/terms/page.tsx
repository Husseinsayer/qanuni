import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export const metadata = { title: "الشروط والأحكام" };

const sections = [
  {
    title: "القبول بالشروط",
    body: "باستخدامك لمنصة قانوني فإنك توافق على هذه الشروط والأحكام وجميع السياسات المرتبطة بها.",
  },
  {
    title: "طبيعة الخدمات",
    body: "توفر المنصة محتوى قانونياً ومعلوماتيًا وأدوات للوصول للمحامين، ولا تُعد بديلاً عن المشورة القانونية الملزمة من محامٍ مختص.",
  },
  {
    title: "مسؤولية المستخدم",
    body: "أنت مسؤول عن صحة البيانات التي تقدمها، وعن استخدام المنصة بما لا يخالف القوانين النافذة في العراق.",
  },
  {
    title: "الملكية الفكرية",
    body: "جميع النصوص والتصاميم والمحتويات على المنصة محمية بملكية منصة قانوني، ولا يجوز نسخها أو إعادة نشرها دون إذن.",
  },
  {
    title: "التعديلات",
    body: "نحتفظ بحق تعديل هذه الشروط متى لزم الأمر، وسيتم نشر أي تعديل على هذه الصفحة.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="قانوني"
        title="الشروط والأحكام"
        subtitle="يرجى قراءة هذه الشروط بعناية قبل استخدام المنصة."
        crumbs={[{ label: "الرئيسية", href: "/" }, { label: "الشروط والأحكام" }]}
      />
      <div className="container max-w-3xl space-y-4 pb-20">
        {sections.map((s) => (
          <Card key={s.title} className="p-6">
            <h2 className="mb-2 text-lg font-bold">{s.title}</h2>
            <p className="leading-relaxed text-muted-foreground">{s.body}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
