import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET() {
  const items = await prisma.instruction.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const item = await prisma.instruction.create({
    data: {
      number: sanitizeInput(body.number),
      year: sanitizeInput(body.year),
      date: sanitizeInput(body.date),
      subject: sanitizeInput(body.subject),
      issuingAuthority: sanitizeInput(body.issuingAuthority),
      validityStatus: ["active", "suspended", "cancelled"].includes(body.validityStatus) ? body.validityStatus : "active",
      fullText: body.fullText || "",
      category: sanitizeInput(body.category) || "general",
      isActive: body.isActive !== false,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
