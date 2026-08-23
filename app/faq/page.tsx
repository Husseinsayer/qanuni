import { FaqSection } from "@/components/sections/faq";

export const metadata = {
  title: "الأسئلة الشائعة",
  description: "إجابات على الأسئلة الأكثر شيوعاً حول استخدام منصة قانوني.",
};

export default function FaqPage() {
  return (
    <>
      <FaqSection />
    </>
  );
}
