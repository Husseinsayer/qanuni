import type { MetadataRoute } from "next";
import { lawyers, lawyerSlug, articles, laws, lawFirms } from "@/lib/data";
import { getSeoDefaults } from "@/lib/seo-defaults";

export default function sitemap(): MetadataRoute.Sitemap {
  const seo = getSeoDefaults();
  const base = seo.meta.metadataBase.replace(/\/$/, "");
  const inc = seo.sitemap.include;
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [];

  // Static pages
  if (inc.pages) {
    const staticPaths = [
      "/",
      "/lawyers",
      "/articles",
      "/laws",
      "/law-firms",
      "/services",
      "/faq",
      "/contact",
      "/about",
      "/privacy",
      "/terms",
    ];
    for (const p of staticPaths) {
      urls.push({
        url: base + p,
        lastModified: now,
        changeFrequency: "weekly",
        priority: p === "/" ? 1 : 0.7,
      });
    }
  }

  if (inc.lawyers) {
    for (const l of lawyers) {
      urls.push({
        url: base + "/lawyers/" + encodeURIComponent(lawyerSlug(l)),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  if (inc.articles) {
    for (const a of articles) {
      urls.push({
        url: base + "/blog/" + a.id,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  if (inc.courts) {
    for (const l of laws) {
      urls.push({
        url: base + "/laws/" + l.id,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  if (inc.lawFirms) {
    for (const f of lawFirms) {
      urls.push({
        url: base + "/law-firms/" + f.id,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return urls;
}
