import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-utils";
import { sendEmail, generateResetToken, buildResetEmail } from "@/lib/email-service";
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/api-auth";

/**
 * POST /api/auth/reset-password
 * Request a password reset email.
 * Body: { email: string }
 */
export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = checkRateLimit(`reset:${ip}`, RATE_LIMITS.auth);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "تم تجاوز حد الطلبات. يرجى الانتظار قليلاً." },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مطلوب" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      // Always respond with success to avoid email enumeration
      return NextResponse.json({
        message: "إذا كان البريد الإلكتروني مسجلاً لدينا، سيتم إرسال رابط إعادة التعيين",
      });
    }

    // Generate reset token (valid for 1 hour)
    const token = generateResetToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    // Build reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email
    await sendEmail({
      to: email,
      subject: "إعادة تعيين كلمة المرور — قانوني",
      html: buildResetEmail(user.name, resetLink),
    });

    return NextResponse.json({
      message: "إذا كان البريد الإلكتروني مسجلاً لدينا، سيتم إرسال رابط إعادة التعيين",
    });
  } catch (error) {
    console.error("[reset-password] POST error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/reset-password
 * Reset password using a valid token.
 * Body: { token: string, email: string, password: string }
 */
export async function PUT(request: Request) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: "الرمز والبريد الإلكتروني وكلمة المرور الجديدة مطلوبون" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      );
    }

    // Find user with matching token and email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.resetToken !== token) {
      return NextResponse.json(
        { error: "الرابط غير صالح أو منتهي الصلاحية" },
        { status: 400 }
      );
    }

    // Check expiry
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "انتهت صلاحية الرابط. يرجى طلب رابط جديد" },
        { status: 400 }
      );
    }

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(password),
        resetToken: "", // Clear the token
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: "تم إعادة تعيين كلمة المرور بنجاح",
    });
  } catch (error) {
    console.error("[reset-password] PUT error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إعادة تعيين كلمة المرور" },
      { status: 500 }
    );
  }
}
