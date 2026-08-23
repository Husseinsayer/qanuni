import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lawyer = await prisma.lawyer.findUnique({ where: { id } });
    if (!lawyer) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }
    return NextResponse.json(lawyer);
  } catch (error) {
    console.error("[lawyers/[id]] GET error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    const lawyer = await prisma.lawyer.update({
      where: { id },
      data: {
        name: sanitizeInput(body.name),
        slug: sanitizeInput(body.slug),
        city: sanitizeInput(body.city),
        specialization: sanitizeInput(body.specialization),
        experience: Math.min(Math.max(Number(body.experience) || 0, 0), 100),
        rating: Math.min(Math.max(Number(body.rating) || 0, 0), 5),
        reviewCount: Math.max(Number(body.reviewCount) || 0, 0),
        verified: Boolean(body.verified),
        online: Boolean(body.online),
        price: Math.max(Number(body.price) || 0, 0),
        gender: ["male", "female"].includes(body.gender) ? body.gender : "male",
        languages: body.languages || "[]",
        bio: sanitizeInput(body.bio),
        initials: sanitizeInput(body.initials),
        hue: sanitizeInput(body.hue),
        whatsapp: sanitizeInput(body.whatsapp),
        telegram: sanitizeInput(body.telegram),
        facebook: sanitizeInput(body.facebook),
        instagram: sanitizeInput(body.instagram),
        promoted: Boolean(body.promoted),
      },
    });
    return NextResponse.json(lawyer);
  } catch (error) {
    console.error("[lawyers/[id]] PUT error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.lawyer.delete({ where: { id } });
    return NextResponse.json({ message: "تم الحذف" });
  } catch (error) {
    console.error("[lawyers/[id]] DELETE error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
