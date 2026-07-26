import { FeaturedLawyers } from "@/components/sections/featured-lawyers";
import { LawyersDirectory } from "@/components/sections/lawyers-directory";

export const metadata = {
  title: "دليل المحامين",
  description: "ابحث عن محامٍ عراقي متخصص حسب المدينة والتخصص والخبرة.",
};

export default function LawyersPage() {
  return (
    <>
      <FeaturedLawyers />
      <LawyersDirectory />
    </>
  );
}
