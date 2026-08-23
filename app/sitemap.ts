import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { lawyers, lawyerSlug, laws, lawFirms } from "@/lib/data";
import { getSeoDefaults } from "@/lib/seo-defaults";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = getSeoDefaults();
  const base = seo.meta.metadataBase.replace(/\/$/, "");
  const inc = seo.sitemap.include;

  const urls: MetadataRoute.Sitemap = [];

  // Static pages
  if (inc.pages) {
    const staticPaths = [
      { path: "/", freq: "weekly" as const, pri: 1 },
      { path: "/lawyers", freq: "weekly" as const, pri: 0.8 },
      { path: "/blog", freq: "weekly" as const, pri: 0.7 },
      { path: "/laws", freq: "weekly" as const, pri: 0.8 },
      { path: "/law-firms", freq: "monthly" as const, pri: 0.6 },
      { path: "/services", freq: "monthly" as const, pri: 0.7 },
      { path: "/faq", freq: "monthly" as const, pri: 0.6 },
      { path: "/contact", freq: "monthly" as const, pri: 0.6 },
      { path: "/about", freq: "monthly" as const, pri: 0.6 },
      { path: "/legal/privacy", freq: "yearly" as const, pri: 0.3 },
      { path: "/legal/terms", freq: "yearly" as const, pri: 0.3 },
      { path: "/search", freq: "monthly" as const, pri: 0.5 },
    ];
    for (const s of staticPaths) {
      urls.push({
        url: base + s.path,
        lastModified: new Date(),
        changeFrequency: s.freq,
        priority: s.pri,
      });
    }
  }

  // Static lawyers from data
  if (inc.lawyers) {
    for (const l of lawyers) {
      urls.push({
        url: base + "/lawyers/" + encodeURIComponent(lawyerSlug(l)),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // Dynamic lawyers from DB
  try {
    const dbLawyers = await prisma.lawyer.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { name: "asc" },
    });
    for (const l of dbLawyers) {
      if (l.slug) {
        urls.push({
          url: base + "/lawyers/" + encodeURIComponent(l.slug),
          lastModified: l.updatedAt || new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {}

  // Articles from DB
  if (inc.articles) {
    try {
      const dbArticles = await prisma.article.findMany({
        where: { status: "published" },
        select: { id: true, updatedAt: true, date: true },
        orderBy: { date: "desc" },
      });
      for (const a of dbArticles) {
        urls.push({
          url: base + "/blog/" + a.id,
          lastModified: a.updatedAt || a.date || new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    } catch {}
  }

  // Laws from DB
  if (inc.courts) {
    try {
      const dbLaws = await prisma.law.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true },
        orderBy: { name: "asc" },
      });
      for (const l of dbLaws) {
        urls.push({
          url: base + "/laws/" + l.id,
          lastModified: l.updatedAt || new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    } catch {
      // Fallback to static laws
      for (const l of laws) {
        urls.push({
          url: base + "/laws/" + l.id,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  // Law firms from DB
  if (inc.lawFirms) {
    try {
      const dbFirms = await prisma.lawFirm.findMany({
        select: { id: true, updatedAt: true },
        orderBy: { name: "asc" },
      });
      for (const f of dbFirms) {
        urls.push({
          url: base + "/law-firms/" + f.id,
          lastModified: f.updatedAt || new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    } catch {
      for (const f of lawFirms) {
        urls.push({
          url: base + "/law-firms/" + f.id,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  return urls;
}
