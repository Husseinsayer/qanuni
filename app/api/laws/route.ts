import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET() {
  try {
    const laws = await prisma.law.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(laws);
  } catch (error) {
    console.error("[laws] GET error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const law = await prisma.law.create({
      data: {
        name: sanitizeInput(body.name),
        articles: Math.max(Number(body.articles) || 0, 0),
        updated: sanitizeInput(body.updated),
        icon: sanitizeInput(body.icon) || "Scale",
        color: sanitizeInput(body.color) || "#1E3A8A",
        category: sanitizeInput(body.category),
        source: sanitizeInput(body.source),
        status: sanitizeInput(body.status) || "نافذ",
      },
    });
    return NextResponse.json(law, { status: 201 });
  } catch (error) {
    console.error("[laws] POST error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
