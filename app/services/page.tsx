import { ServicesContent } from "@/components/sections/services-content";
import { JsonLd } from "@/components/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الخدمات القانونية",
  description: "استشارات قانونية وتوثيق عقود وتمثيل قضائي من أفضل المحامين العراقيين في جميع المحافظات.",
  openGraph: {
    title: "الخدمات القانونية — منصة قانوني",
    description: "استشارات قانونية وتوثيق عقود وتمثيل قضائي من أفضل المحامين العراقيين.",
    type: "website",
    locale: "ar_IQ",
    siteName: "منصة قانوني",
  },
  alternates: {
    canonical: "https://qanuni.iq/services",
  },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd page="services" />
      <ServicesContent />
    </>
  );
}
