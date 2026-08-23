import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    const consultation = await prisma.legalConsultation.update({
      where: { id },
      data: {
        status: body.status,
        lawyerId: body.lawyerId,
        lawyerName: body.lawyerName,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
        response: body.response,
        isPaid: body.isPaid,
        paymentMethod: body.paymentMethod,
        rating: body.rating,
        feedback: body.feedback,
        notes: body.notes,
      },
      include: { consultationType: true },
    });
    return NextResponse.json(consultation);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    await prisma.legalConsultation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
