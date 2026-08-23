import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    const lawyer = await prisma.lawyer.findUnique({ where: { id } });
    if (!lawyer) {
      return NextResponse.json({ error: "Lawyer not found" }, { status: 404 });
    }

    // Update lawyer profile
    const updated = await prisma.lawyer.update({
      where: { id },
      data: {
        name: body.name || lawyer.name,
        slug: body.slug || lawyer.slug,
        city: body.city || lawyer.city,
        specialization: body.specialization || lawyer.specialization,
        experience: body.experience ?? lawyer.experience,
        price: body.price ?? lawyer.price,
        online: body.online ?? lawyer.online,
        verified: body.verified ?? lawyer.verified,
        gender: body.gender || lawyer.gender,
        initials: body.initials || lawyer.initials,
        hue: body.hue || lawyer.hue,
        bio: body.bio ?? lawyer.bio,
        languages: body.languages ? JSON.stringify(body.languages) : lawyer.languages,
        whatsapp: body.whatsapp ?? lawyer.whatsapp,
        telegram: body.telegram ?? lawyer.telegram,
        facebook: body.facebook ?? lawyer.facebook,
        instagram: body.instagram ?? lawyer.instagram,
        photoUrl: body.photoUrl ?? lawyer.photoUrl,
        points: body.points ?? lawyer.points,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/lawyers/[id]] PUT error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}