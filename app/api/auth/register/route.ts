import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-utils";
import { sendEmail, generateActivationCode, buildActivationEmail } from "@/lib/email-service";
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit";
import { isValidEmail, isValidPassword, sanitizeInput } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    // Check if registration is enabled
    const regSetting = await prisma.siteConfig.findUnique({ where: { key: "registrationEnabled" } }).catch(() => null);
    if (regSetting && regSetting.value === "false") {
      return NextResponse.json(
        { error: "التسجيل معطّل حالياً. يرجى المحاولة لاحقاً." },
        { status: 403 }
      );
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = checkRateLimit(`register:${ip}`, RATE_LIMITS.auth);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "تم تجاوز حد الطلبات. يرجى الانتظار قليلاً." },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body = await request.json();
    const { name, email, phone, password, role } = body;

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبون" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "البريد الإلكتروني غير صحيح" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون بين 6 و 128 حرف" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const safeName = sanitizeInput(name);
    const safeEmail = email.toLowerCase().trim();
    const safePhone = sanitizeInput(phone || "");

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email: safeEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مسجل بالفعل" },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const activationCode = generateActivationCode();

    // Determine role and status
    const isLawyer = role === "lawyer";
    const userRole = ["user", "lawyer"].includes(role) ? role : "user";
    const userStatus = "pending"; // Both users and lawyers require admin approval
    const emailVerified = false;

    // Use transaction for lawyer registration to prevent orphaned users
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: safeName,
          email: safeEmail,
          phone: safePhone,
          passwordHash,
          role: userRole,
          status: userStatus,
          emailVerified,
          activationToken: activationCode,
        },
      });

      // If lawyer, create their Lawyer profile with empty fields
      if (isLawyer) {
        const slug = safeEmail.split("@")[0] + "-" + Date.now().toString(36);
        await tx.lawyer.create({
          data: {
            name: safeName,
            slug,
            city: "",
            specialization: "",
            experience: 0,
            rating: 0,
            reviewCount: 0,
            verified: false,
            online: false,
            price: 0,
            gender: "male",
            languages: JSON.stringify(["العربية"]),
            bio: "",
            initials: safeName.slice(0, 2),
            userId: newUser.id,
          },
        });
      }

      return newUser;
    });

    // Send activation email (in dev mode, just logs to console)
    await sendEmail({
      to: safeEmail,
      subject: isLawyer
        ? "تم تسجيل طلبك — قانوني"
        : "تفعيل حسابك في قانوني",
      html: buildActivationEmail(
        safeName,
        isLawyer
          ? "سيتم مراجعة طلبك من قبل الإدارة والموافقة عليه خلال 24 ساعة"
          : activationCode
      ),
    });

    return NextResponse.json(
      {
        message: isLawyer
          ? "تم إنشاء الحساب بنجاح. الطلب قيد المراجعة من قبل الإدارة."
          : "تم إنشاء الحساب بنجاح",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الحساب";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
