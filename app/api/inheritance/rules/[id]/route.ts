import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const rule = await prisma.inheritanceRule.findUnique({
      where: { id },
      include: { ruleArticles: true },
    });
    if (!rule) return NextResponse.json({ error: " غير موجود" }, { status: 404 });
    return NextResponse.json(rule);
  } catch (error) {
    console.error("Rule fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    const rule = await prisma.inheritanceRule.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        priority: body.priority,
        isActive: body.isActive,
        status: body.status,
        version: body.version,
        effectiveFrom: body.effectiveFrom,
        effectiveTo: body.effectiveTo,
        conditions: body.conditions,
        calculation: body.calculation,
        notes: body.notes,
      },
    });
    return NextResponse.json(rule);
  } catch (error) {
    console.error("Rule update error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    await prisma.inheritanceRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rule delete error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
