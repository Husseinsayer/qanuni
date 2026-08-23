import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { buildDefaults, type AdminData } from "@/lib/admin-data";
import { invalidateSiteDataCache } from "@/lib/site-data-cache";

export const dynamic = "force-dynamic";

const ADMIN_DATA_KEY = "adminData";

/** Single source of truth for all admin-entered content (laws, lawyers, services, seo, ads, …). */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const row = await prisma.siteConfig.findUnique({ where: { key: ADMIN_DATA_KEY } }).catch(() => null);
  if (!row || !row.value) {
    return NextResponse.json(buildDefaults());
  }
  try {
    const stored = JSON.parse(row.value) as Partial<AdminData>;
    // Merge over defaults so any missing field is always defined.
    return NextResponse.json({ ...buildDefaults(), ...stored });
  } catch {
    return NextResponse.json(buildDefaults());
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { field?: string; value?: unknown; fields?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { field, value, fields } = body;

  // Support batch updates: { fields: { laws: [...], sampleArticles: {...} } }
  const updates: [string, unknown][] = [];
  if (fields && typeof fields === "object") {
    for (const [k, v] of Object.entries(fields)) {
      updates.push([k, v]);
    }
  } else if (field) {
    updates.push([field, value]);
  } else {
    return NextResponse.json({ error: "field or fields required" }, { status: 400 });
  }

  // registrationEnabled is also consumed directly by /api/auth/register from a
  // dedicated SiteConfig row, so mirror it there to keep behaviour consistent.
  for (const [f, v] of updates) {
    if (f === "registrationEnabled") {
      const val = String(v === true);
      const existing = await prisma.siteConfig.findUnique({ where: { key: "registrationEnabled" } }).catch(() => null);
      if (existing) {
        await prisma.siteConfig.update({ where: { key: "registrationEnabled" }, data: { value: val } });
      } else {
        await prisma.siteConfig.create({ data: { key: "registrationEnabled", value: val } });
      }
    }
  }

  // Load current doc (or defaults), apply ALL fields atomically, persist.
  const row = await prisma.siteConfig.findUnique({ where: { key: ADMIN_DATA_KEY } }).catch(() => null);
  const current: Partial<AdminData> = row?.value ? safeParse(row.value) : (buildDefaults() as AdminData);
  for (const [f, v] of updates) {
    (current as any)[f] = v;
  }

  const value2 = JSON.stringify(current);
  try {
    if (row) {
      await prisma.siteConfig.update({ where: { key: ADMIN_DATA_KEY }, data: { value: value2 } });
    } else {
      await prisma.siteConfig.create({ data: { key: ADMIN_DATA_KEY, value: value2 } });
    }
  } catch (error) {
    console.error("[admin/data] PUT error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  // Invalidate site-data server cache so public pages see fresh data.
  invalidateSiteDataCache();

  return NextResponse.json({ ok: true, field });
}

function safeParse(value: string): Partial<AdminData> {
  try {
    return JSON.parse(value) as Partial<AdminData>;
  } catch {
    return {};
  }
}
