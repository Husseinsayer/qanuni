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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lawyerId = await getLawyerId(session);
  if (!lawyerId) {
    return NextResponse.json({ error: "Lawyer profile not found" }, { status: 404 });
  }

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.authorId !== lawyerId) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lawyerId = await getLawyerId(session);
  if (!lawyerId) {
    return NextResponse.json({ error: "Lawyer profile not found" }, { status: 404 });
  }

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing || existing.authorId !== lawyerId) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, category, excerpt, content, date, readingTime, hue } = body;

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: title !== undefined ? title.trim() : existing.title,
      category: category !== undefined ? category : existing.category,
      excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
      content: content !== undefined ? content : existing.content,
      date: date !== undefined ? date : existing.date,
      readingTime: readingTime !== undefined ? readingTime : existing.readingTime,
      hue: hue !== undefined ? hue : existing.hue,
      status: "pending",
    },
  });

  return NextResponse.json({ article });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lawyerId = await getLawyerId(session);
  if (!lawyerId) {
    return NextResponse.json({ error: "Lawyer profile not found" }, { status: 404 });
  }

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing || existing.authorId !== lawyerId) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  await prisma.article.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
