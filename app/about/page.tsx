import { PageHeader } from "@/components/page-header";
import { AboutIntro } from "@/components/sections/about-intro";
import { WhyUs } from "@/components/sections/why-us";

export const metadata = {
  title: "من نحن",
  description: "تعرف على منصة قانوني والقيم التي تجعلها الخيار الأوثق للمواطن العراقي.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="من نحن"
        title="منصة قانوني"
        subtitle="نجمع بين الموثوقية والتقنية لخدمة العدالة في العراق وجعل القانون في متناول الجميع."
        crumbs={[{ label: "الرئيسية", href: "/" }, { label: "من نحن" }]}
      />
      <AboutIntro />
      <WhyUs />
    </>
  );
}
