import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET() {
  const items = await prisma.cassationDecision.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const item = await prisma.cassationDecision.create({
    data: {
      number: sanitizeInput(body.number),
      year: sanitizeInput(body.year),
      date: sanitizeInput(body.date),
      subject: sanitizeInput(body.subject),
      judgmentType: sanitizeInput(body.judgmentType),
      fullText: body.fullText || "",
      source: sanitizeInput(body.source),
      category: sanitizeInput(body.category) || "civil",
      isActive: body.isActive !== false,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
