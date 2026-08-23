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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        lawyer: {
          include: {
            reviews: true,
            firmMembers: true,
          },
        },
      },
    });

    if (!user || !user.lawyer) {
      return NextResponse.json({ error: "Lawyer profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      lawyer: user.lawyer,
    });
  } catch (error) {
    console.error("[lawyer/profile] GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { lawyer: true },
    });

    if (!user || !user.lawyer) {
      return NextResponse.json({ error: "Lawyer profile not found" }, { status: 404 });
    }

    const allowedFields = ["name", "phone"];
    const userUpdates: Record<string, string> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) userUpdates[field] = body[field];
    }

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({ where: { id: session.user.id }, data: userUpdates });
    }

    const lawyerFields = ["city", "specialization", "experience", "price", "bio", "gender", "whatsapp", "telegram", "facebook", "instagram", "hue", "slug", "initials", "online", "verified", "avatar", "photoUrl"];
    const lawyerUpdates: Record<string, string | number | boolean> = {};
    for (const field of lawyerFields) {
      if (body[field] !== undefined) lawyerUpdates[field] = body[field];
    }
    if (body.languages !== undefined) {
      lawyerUpdates.languages = JSON.stringify(body.languages);
    }

    if (Object.keys(lawyerUpdates).length > 0) {
      await prisma.lawyer.update({ where: { userId: session.user.id }, data: lawyerUpdates });
    }

    return NextResponse.json({ message: "تم الحفظ بنجاح" });
  } catch (error) {
    console.error("[lawyer/profile] PATCH error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
