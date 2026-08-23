import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const rules = await prisma.inheritanceRule.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Rules fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "اسم القاعدة مطلوب" }, { status: 400 });
    }
    const rule = await prisma.inheritanceRule.create({
      data: {
        name: body.name,
        description: body.description || "",
        category: body.category || "general",
        priority: body.priority || 0,
        isActive: body.isActive ?? true,
        status: body.status || "draft",
        version: body.version || 1,
        effectiveFrom: body.effectiveFrom || "",
        effectiveTo: body.effectiveTo || "",
        conditions: body.conditions || "[]",
        calculation: body.calculation || "{}",
        notes: body.notes || "",
      },
    });
    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Rule create error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
