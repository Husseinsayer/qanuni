import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { awardPoints, deductPoints, getRewardsConfig } from "@/lib/rewards";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;

  if (!status || !["draft", "pending", "published", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const article = await prisma.article.update({
    where: { id },
    data: { status },
  });

  // Award/deduct points when status changes involving "published"
  if (existing.authorId) {
    const config = await getRewardsConfig();
    const wasPublished = existing.status === "published";
    const isPublished = status === "published";

    if (!wasPublished && isPublished) {
      // Article just got published → award points
      await awardPoints(existing.authorId, config.pointsPerArticle, `نشر المقال: ${existing.title}`);
    } else if (wasPublished && !isPublished) {
      // Article unpublished → deduct points
      await deductPoints(existing.authorId, config.pointsPerArticle, `إلغاء نشر المقال: ${existing.title}`);
    }
  }

  return NextResponse.json({ article });
}
