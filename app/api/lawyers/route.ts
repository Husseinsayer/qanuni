import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeInput } from "@/lib/api-auth";

export async function GET() {
  try {
    const lawyers = await prisma.lawyer.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(lawyers);
  } catch (error) {
    console.error("[lawyers] GET error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const lawyer = await prisma.lawyer.create({
      data: {
        name: sanitizeInput(body.name),
        slug: sanitizeInput(body.slug || body.name?.replace(/\s+/g, "-").toLowerCase() || ""),
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
        hue: sanitizeInput(body.hue) || "from-blue-600 to-indigo-700",
        whatsapp: sanitizeInput(body.whatsapp),
        telegram: sanitizeInput(body.telegram),
        facebook: sanitizeInput(body.facebook),
        instagram: sanitizeInput(body.instagram),
        promoted: Boolean(body.promoted),
      },
    });
    return NextResponse.json(lawyer, { status: 201 });
  } catch (error) {
    console.error("[lawyers] POST error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
