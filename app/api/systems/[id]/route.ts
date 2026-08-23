import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.system.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();
  const item = await prisma.system.update({
    where: { id },
    data: {
      number: sanitizeInput(body.number),
      year: sanitizeInput(body.year),
      date: sanitizeInput(body.date),
      title: sanitizeInput(body.title),
      issuingAuthority: sanitizeInput(body.issuingAuthority),
      scope: sanitizeInput(body.scope),
      fullText: body.fullText || "",
      category: sanitizeInput(body.category),
      isActive: body.isActive,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  await prisma.system.delete({ where: { id } });
  return NextResponse.json({ message: "تم الحذف" });
}
