import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const cases = await prisma.inheritanceStopCase.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(cases);
  } catch (error) {
    console.error("Stop cases fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    }
    const stopCase = await prisma.inheritanceStopCase.create({
      data: {
        name: body.name,
        description: body.description || "",
        condition: body.condition || "",
        message: body.message || "",
        action: body.action || "stop",
        isActive: body.isActive ?? true,
        priority: body.priority || 0,
      },
    });
    return NextResponse.json(stopCase, { status: 201 });
  } catch (error) {
    console.error("Stop case create error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
