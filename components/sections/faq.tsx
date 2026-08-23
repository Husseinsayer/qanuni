"use client";

import { MessageSquare } from "lucide-react";
import { SectionTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";

import { Reveal } from "@/components/reveal";
import { useSiteData } from "@/lib/use-site-data";

const defaultFaqs = [
  { q: "كيف يمكنني البحث عن مادة قانونية محددة؟", a: "استخدم صندوق البحث في الصفحة الرئيسية أو صفحة القوانين، ويمكنك البحث برقم القانون أو اسمه أو نص المادة. النتائج تظهر فوراً مع رابط المادة الكامل." },
  { q: "هل المحامون المعروضون موثقون؟", a: "نعم، كل محامٍ يظهر على المنصة يحمل شارة (موثق) بعد التحقق من رخصة مزاولة المهنة وهويته من نقابة المحامين العراقيين." },
  { q: "هل الاستشارة الأولى مدفوعة؟", a: "يحدد كل محامٍ سعر الاستشارة المعروض على ملفه بوضوح قبل الحجز، وتوجد خيارات استشارات أولية بأسعار رمزية." },
  { q: "هل النصوص القانونية محدثة؟", a: "نعم، نعتمد المصادر الرسمية لقرارات مجلس النواب والجريدة الوقائع العراقية، ونحدّث المحتوى فور صدور أي تعديل." },
  { q: "هل يمكنني حفظ القوانين والمحامين المفضلين؟", a: "بالتأكيد، يمكنك إضافة المواد القانونية والمحامين إلى المفضلة ومتابعة ما استعرضته مؤخراً من حسابك." },
  { q: "كيف أتواصل مع الدعم الفني؟", a: "عبر نموذج التواصل في الصفحة أو قنوات التواصل الاجتماعي المدرجة في التذييل، ويُردّ فريقنا خلال ساعات." },
];

export function FaqSection() {
  const { faqs: dbFaqs } = useSiteData();
  const items = dbFaqs.length > 0 ? dbFaqs : defaultFaqs;
  return (
    <section id="faq" className="scroll-mt-20 bg-muted/30 py-16 md:py-24">
      <div className="container">
        <SectionTitle
          eyebrow="الأسئلة الشائعة"
          title="أسئلة شائعة"
          subtitle="إجابات سريعة عن استخدام المنصة"
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
          <Reveal>
            <Accordion items={items} />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col justify-center rounded-2xl gradient-primary p-8 text-white shadow-premium">
              <MessageSquare className="size-10 text-gold" />
              <h3 className="mt-4 text-xl font-bold">استشارتك تهمنا</h3>
              <p className="mt-2 text-sm text-white/80">
                يمكنك تصفّح دليل المحامين المتميزين مباشرة والوصول إلى مكاتبهم وأرقام التواصل من صفحة المكاتب.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
