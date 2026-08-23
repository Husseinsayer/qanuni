import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET() {
  const templates = await prisma.legalTemplate.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const template = await prisma.legalTemplate.create({
    data: {
      name: sanitizeInput(body.name),
      category: sanitizeInput(body.category || ""),
      description: sanitizeInput(body.description || ""),
      content: body.content || "", // Content may contain HTML, sanitize on render
      variables: body.variables || "[]",
      keywords: body.keywords || "[]",
      notes: sanitizeInput(body.notes || ""),
      isActive: body.isActive !== false,
    },
  });
  return NextResponse.json(template, { status: 201 });
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (updates.name !== undefined) data.name = sanitizeInput(updates.name);
  if (updates.category !== undefined) data.category = sanitizeInput(updates.category);
  if (updates.description !== undefined) data.description = sanitizeInput(updates.description);
  if (updates.content !== undefined) data.content = updates.content;
  if (updates.variables !== undefined) data.variables = updates.variables;
  if (updates.keywords !== undefined) data.keywords = updates.keywords;
  if (updates.notes !== undefined) data.notes = sanitizeInput(updates.notes);
  if (updates.isActive !== undefined) data.isActive = updates.isActive;
  if (updates.deletedAt !== undefined) data.deletedAt = updates.deletedAt;

  const template = await prisma.legalTemplate.update({
    where: { id },
    data,
  });
  return NextResponse.json(template);
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }

  // Soft delete
  const template = await prisma.legalTemplate.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  return NextResponse.json(template);
}
