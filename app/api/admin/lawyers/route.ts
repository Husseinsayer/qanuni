import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildApprovalEmail } from "@/lib/email-service";
import { requireAdmin } from "@/lib/api-auth";

/**
 * GET /api/admin/lawyers
 * Returns pending lawyer applications (from DB User model).
 */
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const pendingUsers = await prisma.user.findMany({
      where: { role: "lawyer" },
      include: { lawyer: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error("[admin/lawyers] GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/lawyers
 * Approve or reject a lawyer application.
 */
export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { userId, action } = await request.json(); // action: "approve" | "reject"

    if (!userId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { lawyer: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "approve") {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "approved", isActive: true, emailVerified: true },
      });

      // Also mark the lawyer profile as verified
      if (user.lawyer) {
        await prisma.lawyer.update({
          where: { userId: userId },
          data: { verified: true },
        });
      }

      // Send approval email
      await sendEmail({
        to: user.email,
        subject: "تم الموافقة على طلب تسجيلك في قانوني",
        html: buildApprovalEmail(
          user.name,
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`
        ),
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "rejected", isActive: false },
      });
    }

    return NextResponse.json({
      message:
        action === "approve"
          ? "تم الموافقة على المحامي بنجاح"
          : "تم رفض طلب المحامي",
    });
  } catch (error) {
    console.error("[admin/lawyers] PATCH error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
