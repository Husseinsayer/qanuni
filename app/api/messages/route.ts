import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/messages — list conversations for the current user.
 * Returns conversations grouped by the other party with the last message.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Fetch all messages where user is sender or receiver
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, email: true, avatar: true } },
      receiver: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  // Group messages into conversations by the OTHER party
  const conversationMap = new Map<
    string,
    {
      participantId: string;
      participantName: string;
      participantEmail: string;
      participantImage: string | null;
      messages: typeof messages;
      lastMessage: (typeof messages)[0];
      unreadCount: number;
    }
  >();

  for (const msg of messages) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const other = msg.senderId === userId ? msg.receiver : msg.sender;

    if (!conversationMap.has(otherId)) {
      conversationMap.set(otherId, {
        participantId: otherId,
        participantName: other.name || "مستخدم",
        participantEmail: other.email || "",
        participantImage: other.avatar,
        messages: [],
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    const conv = conversationMap.get(otherId)!;
    conv.messages.push(msg);
    if (msg.receiverId === userId && !msg.read) {
      conv.unreadCount++;
    }
  }

  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );

  return NextResponse.json({ conversations });
}

/**
 * POST /api/messages — send a new message.
 * Body: { receiverId: string, subject?: string, content: string }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { receiverId?: string; subject?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { receiverId, subject, content } = body;
  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ error: "receiverId and content are required" }, { status: 400 });
  }

  // Verify receiver exists
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
  }

  // Prevent sending to yourself
  if (receiverId === userId) {
    return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId,
      subject: subject?.trim() || "",
      content: content.trim(),
    },
    include: {
      sender: { select: { id: true, name: true, email: true, avatar: true } },
      receiver: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
