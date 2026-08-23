import { FeaturedLawyers } from "@/components/sections/featured-lawyers";
import { LawyersDirectory } from "@/components/sections/lawyers-directory";
import { AdBanner } from "@/components/ad-banner";

export const metadata = {
  title: "دليل المحامين",
  description: "ابحث عن محامٍ عراقي متخصص حسب المدينة والتخصص والخبرة.",
};

export default function LawyersPage() {
  return (
    <>
      {/* Ad: أعلى المحامين */}
      <AdBanner placementKey="lawyers-top" />
      <FeaturedLawyers />
      <LawyersDirectory />
    </>
  );
}
