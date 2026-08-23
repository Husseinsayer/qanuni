import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, category, excerpt, content, authorId, date, readingTime, hue, status } = body;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  let authorName = existing.author;
  if (authorId && authorId !== existing.authorId) {
    const lawyer = await prisma.lawyer.findUnique({ where: { id: authorId } });
    authorName = lawyer?.name || authorName;
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: title !== undefined ? title.trim() : existing.title,
      category: category !== undefined ? category : existing.category,
      excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
      content: content !== undefined ? content : existing.content,
      author: authorName,
      authorId: authorId !== undefined ? authorId : existing.authorId,
      date: date !== undefined ? date : existing.date,
      readingTime: readingTime !== undefined ? readingTime : existing.readingTime,
      hue: hue !== undefined ? hue : existing.hue,
      status: status !== undefined ? status : existing.status,
    },
  });

  return NextResponse.json({ article });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  await prisma.article.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
