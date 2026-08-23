import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET() {
  const items = await prisma.system.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const item = await prisma.system.create({
    data: {
      number: sanitizeInput(body.number),
      year: sanitizeInput(body.year),
      date: sanitizeInput(body.date),
      title: sanitizeInput(body.title),
      issuingAuthority: sanitizeInput(body.issuingAuthority),
      scope: sanitizeInput(body.scope),
      fullText: body.fullText || "",
      category: sanitizeInput(body.category) || "general",
      isActive: body.isActive !== false,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
