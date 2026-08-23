import { InheritanceWizard } from "@/components/inheritance/wizard";
import { JsonLd } from "@/components/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حاسبة الميراث العراقية — حساب أنصبة الورثة بالقانون العراقي",
  description: "حاسبة ميراث احترافية ومجانية لحساب أنصبة الورثة وفق قانون الأحوال الشخصية العراقي رقم 188 لسنة 1959. تشمل الزوج والزوجة والأبناء والأب والأم وال siblings وال أقارب.",
  keywords: ["حاسبة ميراث", "ميراث عراقي", "قانون الأحوال الشخصية", "أنصبة الورثة", "تقسيم التركة", "المذهب الجعفري", "حساب الميراث أونلاين"],
  openGraph: {
    title: "حاسبة الميراث العراقية — منصة قانوني",
    description: "احسب أنصبة الورثة وفق القواعد القانونية المرتبطة بالتشريعات العراقية. حاسبة مجانية ودقيقة.",
    type: "website",
    locale: "ar_IQ",
    siteName: "منصة قانوني",
    url: "https://qanuni.iq/inheritance",
  },
  alternates: {
    canonical: "https://qanuni.iq/inheritance",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function InheritancePage() {
  return (
    <>
      <JsonLd page="services" />
      <section className="bg-gradient-to-b from-blue-50 to-background py-10 md:py-16 dark:from-blue-950/20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-8">
            <h1 className="text-3xl font-extrabold md:text-4xl">حاسبة الميراث العراقية</h1>
            <p className="mt-3 text-muted-foreground">
              حاسبة مجانية ودقيقة لحساب أنصبة الورثة وفق قانون الأحوال الشخصية العراقي
            </p>
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              تنبيه: هذه الحاسبة أداة إرشادية仅供参考. يُنصح بمراجعة محامٍ متخصص في الحالات المعقدة.
            </div>
          </div>
          <InheritanceWizard />
        </div>
      </section>
    </>
  );
}
