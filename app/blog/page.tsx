import { BlogSection } from "@/components/sections/blog";

export const metadata = {
  title: "المدونة القانونية",
  description: "أحدث المقالات والمستجدات القانونية في العراق.",
};

export default function BlogPage() {
  return (
    <>
      <BlogSection />
    </>
  );
}
