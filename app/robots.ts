import type { MetadataRoute } from "next";
import { getSeoDefaults } from "@/lib/seo-defaults";

export default function robots(): MetadataRoute.Robots {
  const seo = getSeoDefaults();
  const base = seo.meta.metadataBase.replace(/\/$/, "");
  const r = seo.robots;

  const isNoindex = /noindex/i.test(r.global);

  if (isNoindex) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: base + "/sitemap.xml",
      host: base,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/_next/static/", "/api/upload"],
      disallow: [
        "/admin",
        "/api",
        "/auth/",
        "/client/",
        "/lawyer/",
        "/chat",
        "/_next/webpack-hmr",
      ],
    },
    sitemap: base + "/sitemap.xml",
    host: base,
  };
}
