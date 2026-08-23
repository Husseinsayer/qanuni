import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[admin/users] GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "approve") {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "approved", isActive: true, emailVerified: true },
      });

      if (user.role === "lawyer") {
        await prisma.lawyer.updateMany({
          where: { userId },
          data: { verified: true },
        });
      }

      return NextResponse.json({ message: "تمت الموافقة على المستخدم" });
    }

    if (action === "reject") {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "rejected", isActive: false },
      });

      return NextResponse.json({ message: "تم رفض المستخدم" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[admin/users] PATCH error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
