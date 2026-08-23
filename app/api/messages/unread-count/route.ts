import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/messages/unread-count — get count of unread messages for the current user.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.message.count({
    where: {
      receiverId: session.user.id,
      read: false,
      archived: false,
    },
  });

  return NextResponse.json({ count });
}
