import { LawsPageContent } from "./laws-content";
import { JsonLd } from "@/components/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "القوانين العراقية",
  description: "تصفح جميع القوانين العراقية النافذة — القوانين المدنية، الجنائية، الأحوال الشخصية، والأنظمة. بحث سريع في نصوص المواد القانونية.",
  openGraph: {
    title: "القوانين العراقية — منصة قانوني",
    description: "تصفح جميع القوانين العراقية النافذة والتشريعات والأنظمة.",
    type: "website",
    locale: "ar_IQ",
    siteName: "منصة قانوني",
  },
  alternates: {
    canonical: "https://qanuni.iq/laws",
  },
};

export default function LawsPage() {
  return (
    <>
      <JsonLd page="laws" />
      <LawsPageContent />
    </>
  );
}
