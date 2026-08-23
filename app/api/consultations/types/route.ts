import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const types = await prisma.legalConsultationType.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(types);
  } catch {
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
    const type = await prisma.legalConsultationType.create({
      data: {
        name: body.name,
        description: body.description || "",
        category: body.category || "",
        price: body.price || 0,
        durationMinutes: body.durationMinutes || 30,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json(type, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
