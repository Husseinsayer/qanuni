import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const category = await prisma.category.create({
    data: {
      name: sanitizeInput(body.name),
      icon: sanitizeInput(body.icon) || "FileText",
    },
  });
  return NextResponse.json(category, { status: 201 });
}
