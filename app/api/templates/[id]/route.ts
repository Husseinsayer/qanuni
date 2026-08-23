import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = await prisma.legalTemplate.findUnique({ where: { id } });
  if (!template) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
  return NextResponse.json(template);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();
  const template = await prisma.legalTemplate.update({
    where: { id },
    data: {
      name: sanitizeInput(body.name),
      category: sanitizeInput(body.category),
      description: sanitizeInput(body.description),
      content: body.content || "",
      variables: body.variables || "[]",
      keywords: body.keywords || "[]",
      notes: sanitizeInput(body.notes),
      isActive: body.isActive,
    },
  });
  return NextResponse.json(template);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  // Soft delete
  await prisma.legalTemplate.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ message: "تم الحذف" });
}
