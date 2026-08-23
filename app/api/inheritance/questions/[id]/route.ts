import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    const question = await prisma.inheritanceQuestion.update({
      where: { id },
      data: {
        step: body.step,
        field: body.field,
        question: body.question,
        type: body.type,
        options: body.options,
        condition: body.condition,
        isRequired: body.isRequired,
        order: body.order,
      },
    });
    return NextResponse.json(question);
  } catch (error) {
    console.error("Question update error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    await prisma.inheritanceQuestion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Question delete error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
