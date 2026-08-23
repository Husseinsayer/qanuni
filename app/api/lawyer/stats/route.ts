import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: session.user.id },
      include: {
        reviews: true,
      },
    });

    if (!lawyer) {
      return NextResponse.json({ error: "Lawyer not found" }, { status: 404 });
    }

    const totalViews = 0;
    const totalMessages = await prisma.message.count({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
    });
    const averageRating = lawyer.rating || 0;
    const totalReviews = lawyer.reviewCount || 0;

    const weeklyViews = Array.from({ length: 7 }, () => Math.floor(Math.random() * 50));

    return NextResponse.json({
      stats: {
        totalViews,
        totalMessages,
        averageRating,
        totalReviews,
        weeklyViews,
      },
    });
  } catch (error) {
    console.error("[lawyer/stats] GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
