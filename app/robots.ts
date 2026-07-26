import type { MetadataRoute } from "next";
import { getSeoDefaults } from "@/lib/seo-defaults";

export default function robots(): MetadataRoute.Robots {
  const seo = getSeoDefaults();
  const base = seo.meta.metadataBase.replace(/\/$/, "");
  const r = seo.robots;

  const allow: string[] = [];
  const disallow: string[] = [];

  // Parse global directive
  const isNoindex = /noindex/i.test(r.global);

  if (isNoindex) {
    disallow.push("/");
  } else {
    allow.push("/");
    // Common disallows
    disallow.push("/admin");
    disallow.push("/api");
  }

  return {
    rules: {
      userAgent: "*",
      allow,
      disallow,
    },
    sitemap: base + "/sitemap.xml",
    host: base,
  };
}
