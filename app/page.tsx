import { Hero } from "@/components/hero";
import { LawsSection } from "@/components/sections/laws";
import { FeaturedLawyers } from "@/components/sections/featured-lawyers";
import { LawFirms } from "@/components/sections/law-firms";
import { ServicesContent } from "@/components/sections/services-content";
import { WhyUs } from "@/components/sections/why-us";
import { Testimonials } from "@/components/sections/testimonials";
import { FaqSection } from "@/components/sections/faq";
import { Partners } from "@/components/sections/partners";
import { LatestArticles } from "@/components/sections/latest-articles";
import { AdBanner } from "@/components/ad-banner";
import { SectionBoundary } from "@/components/section-boundary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دليلك الذكي للقوانين العراقية والمحامين | منصة قانوني",
  description:
    "ابحث في آلاف المواد القانونية العراقية، اعثر على أفضل المحامين، واقرأ أحدث المقالات القانونية في مكان واحد. منصة قانونية عراقية موثوقة وسريعة.",
  openGraph: {
    title: "دليلك الذكي للقوانين العراقية والمحامين",
    description:
      "ابحث في آلاف المواد القانونية العراقية، اعثر على أفضل المحامين، واقرأ أحدث المقالات القانونية.",
    url: "https://qanuni.iq",
    siteName: "منصة قانوني",
    type: "website",
    locale: "ar_IQ",
  },
  alternates: {
    canonical: "https://qanuni.iq",
  },
};

export default function HomePage() {
  return (
    <>
      <span id="home" />
      <SectionBoundary>
        <Hero />
      </SectionBoundary>

      {/* Ad: أعلى الموقع */}
      <AdBanner placementKey="top-banner" />

      <SectionBoundary>
        <LawsSection />
      </SectionBoundary>

      {/* Ad: أسفل البانر الرئيسي */}
      <AdBanner placementKey="below-hero" />

      <SectionBoundary>
        <FeaturedLawyers />
      </SectionBoundary>
      <SectionBoundary>
        <LawFirms />
      </SectionBoundary>
      <SectionBoundary>
        <ServicesContent />
      </SectionBoundary>

      {/* Ad: وسط المحتوى */}
      <AdBanner placementKey="mid-content" />

      <SectionBoundary>
        <WhyUs />
      </SectionBoundary>
      <SectionBoundary>
        <Partners />
      </SectionBoundary>
      <SectionBoundary>
        <LatestArticles />
      </SectionBoundary>
      <SectionBoundary>
        <Testimonials />
      </SectionBoundary>
      <SectionBoundary>
        <FaqSection />
      </SectionBoundary>
    </>
  );
}
