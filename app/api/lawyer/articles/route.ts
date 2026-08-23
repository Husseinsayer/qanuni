import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

async function getLawyerId(session: any): Promise<string | null> {
  if (!session?.user?.id) return null;
  const lawyer = await prisma.lawyer.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  return lawyer?.id || null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lawyerId = await getLawyerId(session);
  if (!lawyerId) {
    return NextResponse.json({ articles: [] });
  }

  const articles = await prisma.article.findMany({
    where: { authorId: lawyerId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lawyerId = await getLawyerId(session);
  if (!lawyerId) {
    return NextResponse.json({ error: "Lawyer profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, category, excerpt, content, date, readingTime, hue } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const lawyer = await prisma.lawyer.findUnique({ where: { id: lawyerId } });

  const article = await prisma.article.create({
    data: {
      title: title.trim(),
      category: category || "",
      excerpt: excerpt || "",
      content: content || "",
      author: lawyer?.name || "",
      authorId: lawyerId,
      date: date || new Date().toISOString().split("T")[0],
      readingTime: readingTime || 5,
      hue: hue || "from-blue-400 to-indigo-500",
      status: "pending",
    },
  });

  return NextResponse.json({ article }, { status: 201 });
}
