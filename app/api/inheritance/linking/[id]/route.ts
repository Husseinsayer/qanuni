import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    await prisma.inheritanceRuleArticle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Link delete error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
