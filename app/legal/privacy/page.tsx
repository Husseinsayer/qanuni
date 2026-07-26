import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "سياسة الخصوصية | منصة قانوني",
  description: "سياسة الخصوصية لمنصة قانوني — كيف نجمع ونستخدم بياناتك.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="قانوني"
        title="سياسة الخصوصية"
        crumbs={[{ label: "الرئيسية", href: "/" }, { label: "سياسة الخصوصية" }]}
      />
      <section className="container max-w-3xl pb-20">
        <div className="prose prose-lg rtl:prose-right max-w-none text-foreground/90 leading-relaxed">
          <p className="text-lg text-muted-foreground">
            آخر تحديث: يوليو 2026
          </p>

          <h2 className="text-xl font-bold mt-8">١. المقدمة</h2>
          <p>
            تحترم منصة قانوني خصوصية زوارها ومستخدميها. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها عند استخدامك للمنصة.
          </p>

          <h2 className="text-xl font-bold mt-8">٢. المعلومات التي نجمعها</h2>
          <p>
            نقوم فقط بجمع المعلومات التي تقدمها لنا طوعاً، مثل اسمك وعنوان بريدك الإلكتروني عند الاشتراك في النشرة البريدية أو إرسال نموذج تواصل.
          </p>

          <h2 className="text-xl font-bold mt-8">٣. استخدام المعلومات</h2>
          <p>
            نستخدم معلوماتك فقط لتوفير الخدمات المطلوبة وتحسين تجربتك على المنصة، ولا نبيع أو نشارك بياناتك مع أطراف ثالثة.
          </p>

          <h2 className="text-xl font-bold mt-8">٤. ملفات تعريف الارتباط</h2>
          <p>
            تستخدم المنصة ملفات تعريف الارتباط الأساسية لتحسين أداء الموقع وتذكر تفضيلاتك. لا نستخدم ملفات تعريف الارتباط الإعلانية.
          </p>

          <h2 className="text-xl font-bold mt-8">٥. أمان البيانات</h2>
          <p>
            نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو الاستخدام غير المشروع.
          </p>

          <h2 className="text-xl font-bold mt-8">٦. حقوقك</h2>
          <p>
            لك الحق في طلب حذف بياناتك أو الاطلاع عليها في أي وقت عبر التواصل معنا عبر صفحة التواصل.
          </p>

          <h2 className="text-xl font-bold mt-8">٧. التواصل</h2>
          <p>
            لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر قنوات التواصل الموضحة في صفحة التواصل.
          </p>
        </div>
      </section>
    </>
  );
}
