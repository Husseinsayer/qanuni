import { Hero } from "@/components/hero";
import { LawsSection } from "@/components/sections/laws";
import { FeaturedLawyers } from "@/components/sections/featured-lawyers";
import { LawFirms } from "@/components/sections/law-firms";
import { ServicesSection } from "@/components/sections/services";
import { WhyUs } from "@/components/sections/why-us";
import { Testimonials } from "@/components/sections/testimonials";
import { FaqSection } from "@/components/sections/faq";
import { AdBanner } from "@/components/ad-banner";

export default function HomePage() {
  return (
    <>
      <span id="home" />
      <Hero />

      {/* Ad: أعلى الموقع */}
      <AdBanner size="leaderboard" placementKey="top-site" />

      <LawsSection />
      <FeaturedLawyers />
      <LawFirms />

      {/* Ad: أسفل الهيدر */}
      <AdBanner size="leaderboard" placementKey="below-header" />

      <ServicesSection />
      <WhyUs />
      <Testimonials />
      <FaqSection />
    </>
  );
}
