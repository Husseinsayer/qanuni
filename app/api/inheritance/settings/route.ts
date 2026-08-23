import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

const SETTINGS_KEY = "inheritance_settings";

const DEFAULT_SETTINGS = {
  enabled: true,
  defaultLegalSystem: "islamic",
  willLimitPercent: 33.33,
  enableDynamicQuestions: true,
  enableLawyerReferral: true,
  showLegalBasis: true,
  requireDeathDate: true,
  requireEstateValue: true,
  maxSpouses: 4,
  maxGenerations: 3,
};

export async function GET() {
  try {
    const config = await prisma.siteConfig.findUnique({ where: { key: SETTINGS_KEY } });
    if (config) {
      return NextResponse.json(JSON.parse(config.value));
    }
    return NextResponse.json(DEFAULT_SETTINGS);
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    const value = JSON.stringify(body);

    const existing = await prisma.siteConfig.findUnique({ where: { key: SETTINGS_KEY } });
    if (existing) {
      await prisma.siteConfig.update({ where: { key: SETTINGS_KEY }, data: { value } });
    } else {
      await prisma.siteConfig.create({ data: { key: SETTINGS_KEY, value } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
