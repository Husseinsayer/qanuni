import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const links = await prisma.inheritanceRuleArticle.findMany({
      include: { rule: true },
    });
    return NextResponse.json(links);
  } catch (error) {
    console.error("Links fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    if (!body.ruleId) {
      return NextResponse.json({ error: "القاعدة مطلوبة" }, { status: 400 });
    }
    const link = await prisma.inheritanceRuleArticle.create({
      data: {
        ruleId: body.ruleId,
        lawId: body.lawId || "",
        articleId: body.articleId || "",
        articleNum: body.articleNum || 0,
        note: body.note || "",
      },
    });
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Link create error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
