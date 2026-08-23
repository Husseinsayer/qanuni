import { AboutIntro } from "@/components/sections/about-intro";
import { WhyUs } from "@/components/sections/why-us";

export const metadata = {
  title: "من نحن",
  description: "تعرف على منصة قانوني والقيم التي تجعلها الخيار الأوثق للمواطن العراقي.",
};

export default function AboutPage() {
  return (
    <>
      <AboutIntro />
      <WhyUs />
    </>
  );
}
