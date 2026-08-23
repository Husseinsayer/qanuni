import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    const stopCase = await prisma.inheritanceStopCase.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        condition: body.condition,
        message: body.message,
        action: body.action,
        isActive: body.isActive,
        priority: body.priority,
      },
    });
    return NextResponse.json(stopCase);
  } catch (error) {
    console.error("Stop case update error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    await prisma.inheritanceStopCase.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Stop case delete error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
