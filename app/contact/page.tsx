import { PageHeader } from "@/components/page-header";
import { ContactSection } from "@/components/sections/contact";

export const metadata = {
  title: "تواصل معنا",
  description: "تواصل مع فريق منصة قانوني لاستفساراتك وملاحظاتك.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="تواصل معنا"
        title="تواصل معنا"
        subtitle="نحن هنا لخدمتك. أرسل استفسارك وسيتواصل معك فريقنا المختص."
        crumbs={[{ label: "الرئيسية", href: "/" }, { label: "تواصل معنا" }]}
      />
      <ContactSection />
    </>
  );
}
