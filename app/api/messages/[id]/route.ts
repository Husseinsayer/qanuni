import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/messages/[id] — get a single message with conversation history.
 */
export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const message = await prisma.message.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, name: true, email: true, avatar: true } },
      receiver: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only sender or receiver can view
  if (message.senderId !== session.user.id && message.receiverId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ message });
}

/**
 * PUT /api/messages/[id] — update message (mark read, archive, etc.)
 * Body: { read?: boolean, archived?: boolean }
 */
export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const userId = session.user.id;

  let body: { read?: boolean; archived?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only receiver can mark as read/archive (sender can also archive)
  if (message.receiverId !== userId && message.senderId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.message.update({
    where: { id },
    data: {
      ...(typeof body.read === "boolean" ? { read: body.read } : {}),
      ...(typeof body.archived === "boolean" ? { archived: body.archived } : {}),
    },
  });

  return NextResponse.json({ message: updated });
}

/**
 * DELETE /api/messages/[id] — delete a message.
 */
export async function DELETE(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const userId = session.user.id;

  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only sender or receiver can delete
  if (message.senderId !== userId && message.receiverId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.message.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
