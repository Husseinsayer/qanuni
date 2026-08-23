import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/messages/conversation?userId=xxx — get all messages between current user and the specified user.
 * Marks unread messages as read.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const otherUserId = searchParams.get("userId");

  if (!otherUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, email: true, avatar: true } },
      receiver: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  // Mark unread messages from other user as read
  const unreadIds = messages
    .filter((m) => m.senderId === otherUserId && m.receiverId === userId && !m.read)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unreadIds } },
      data: { read: true },
    });
  }

  return NextResponse.json({ messages, markedRead: unreadIds.length });
}
