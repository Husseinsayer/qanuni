import { BlogSection } from "@/components/sections/blog";
import { AdBanner } from "@/components/ad-banner";

export const metadata = {
  title: "المدونة القانونية",
  description: "أحدث المقالات والمستجدات القانونية في العراق.",
};

export default function BlogPage() {
  return (
    <>
      {/* Ad: أعلى المدونة */}
      <AdBanner placementKey="blog-top" />
      <BlogSection />
    </>
  );
}
