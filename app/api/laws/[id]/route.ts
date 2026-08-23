import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const law = await prisma.law.findUnique({ where: { id } });
    if (!law) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }
    return NextResponse.json(law);
  } catch (error) {
    console.error("[laws/[id]] GET error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    const law = await prisma.law.update({
      where: { id },
      data: {
        name: sanitizeInput(body.name),
        articles: Math.max(Number(body.articles) || 0, 0),
        updated: sanitizeInput(body.updated),
        icon: sanitizeInput(body.icon),
        color: sanitizeInput(body.color),
        category: sanitizeInput(body.category),
        source: sanitizeInput(body.source),
        status: sanitizeInput(body.status) || "نافذ",
        isActive: body.isActive,
      },
    });
    return NextResponse.json(law);
  } catch (error) {
    console.error("[laws/[id]] PUT error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.law.delete({ where: { id } });
    return NextResponse.json({ message: "تم الحذف" });
  } catch (error) {
    console.error("[laws/[id]] DELETE error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
