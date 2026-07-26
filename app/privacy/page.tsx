import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export const metadata = { title: "سياسة الخصوصية" };

const sections = [
  {
    title: "جمع المعلومات",
    body: "نجمع المعلومات التي تقدمها طوعياً عند التسجيل أو التواصل معنا، بما في ذلك الاسم ووسائل التواصل، بهدف تقديم الخدمات القانونية ودعمها.",
  },
  {
    title: "استخدام المعلومات",
    body: "تُستخدم بياناتك لتحسين تجربتك، مطابقة المحامين المناسبين، وإرسال التحديثات القانونية التي اشتركت بها فقط.",
  },
  {
    title: "حماية البيانات",
    body: "نتعهد باتخاذ إجراءات تقنية وإدارية لحماية بياناتك من الوصول غير المصرح به، ولا تُشارك مع أطراف ثالثة دون موافقتك.",
  },
  {
    title: "ملفات تعريف الارتباط",
    body: "نستخدم ملفات تعريف الارتباط لتحسين الأداء وتخصيص المحتوى. يمكنك التحكم بها عبر إعدادات المتصفح.",
  },
  {
    title: "حقوقك",
    body: "يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت عبر التواصل معنا.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="قانوني"
        title="سياسة الخصوصية"
        subtitle="نلتزم بحماية خصوصيتك وبياناتك وفق أعلى معايير الأمان."
        crumbs={[{ label: "الرئيسية", href: "/" }, { label: "سياسة الخصوصية" }]}
      />
      <div className="container max-w-3xl space-y-4 pb-20">
        {sections.map((s) => (
          <Card key={s.title} className="p-6">
            <h2 className="mb-2 text-lg font-bold">{s.title}</h2>
            <p className="leading-relaxed text-muted-foreground">{s.body}</p>
          </Card>
        ))}
        <p className="pt-4 text-center text-xs text-muted-foreground">
          آخر تحديث: ديسمبر 2025 · منصة قانوني
        </p>
      </div>
    </>
  );
}
