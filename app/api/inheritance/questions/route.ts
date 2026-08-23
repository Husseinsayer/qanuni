import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const questions = await prisma.inheritanceQuestion.findMany({
      orderBy: [{ step: "asc" }, { order: "asc" }],
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Questions fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    if (!body.field?.trim() || !body.question?.trim()) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }
    const question = await prisma.inheritanceQuestion.create({
      data: {
        step: body.step || 1,
        field: body.field,
        question: body.question,
        type: body.type || "boolean",
        options: body.options || "[]",
        condition: body.condition || "",
        isRequired: body.isRequired ?? false,
        order: body.order || 0,
      },
    });
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Question create error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
