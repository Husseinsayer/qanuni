import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { awardPoints, getRewardsConfig } from "@/lib/rewards";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, category, excerpt, content, authorId, date, readingTime, hue, status } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const authorName = authorId
    ? (await prisma.lawyer.findUnique({ where: { id: authorId } }))?.name || ""
    : session.user?.name || "";

  const article = await prisma.article.create({
    data: {
      title: title.trim(),
      category: category || "",
      excerpt: excerpt || "",
      content: content || "",
      author: authorName,
      authorId: authorId || "",
      date: date || new Date().toISOString().split("T")[0],
      readingTime: readingTime || 5,
      hue: hue || "from-blue-400 to-indigo-500",
      status: status || "draft",
    },
  });

  // Award points if article is created directly as published
  if (authorId && (status || "draft") === "published") {
    const config = await getRewardsConfig();
    await awardPoints(authorId, config.pointsPerArticle, `نشر المقال: ${title.trim()}`);
  }

  return NextResponse.json({ article }, { status: 201 });
}
