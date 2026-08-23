import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/api-auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/lawyer-avatar
 * Upload a profile picture. Expects: multipart/form-data with "file" field.
 * Returns: { url: "/uploads/avatars/<filename>" }
 */
export async function POST(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const rateLimitResult = checkRateLimit(`avatar:${ip}`, RATE_LIMITS.api);
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: "تم تجاوز حد الطلبات" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم رفع أي ملف" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "حجم الملف كبير جداً. الحد الأقصى 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    const filePath = path.join(uploadDir, filename);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = `/uploads/avatars/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[lawyer-avatar] Upload error:", error);
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
  }
}
