import { PageHeader } from "@/components/page-header";
import { FaqSection } from "@/components/sections/faq";

export const metadata = {
  title: "الأسئلة الشائعة",
  description: "إجابات على الأسئلة الأكثر شيوعاً حول استخدام منصة قانوني.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="الأسئلة الشائعة"
        title="الأسئلة الشائعة"
        subtitle="إجابات سريعة وواضحة عن استخدام المنصة وخدماتها."
        crumbs={[{ label: "الرئيسية", href: "/" }, { label: "الأسئلة الشائعة" }]}
      />
      <FaqSection />
    </>
  );
}
