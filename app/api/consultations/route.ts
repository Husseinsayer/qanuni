import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const consultations = await prisma.legalConsultation.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { consultationType: true },
    });
    return NextResponse.json(consultations);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    if (!body.typeId || !body.clientName?.trim()) {
      return NextResponse.json({ error: "النوع واسم العميل مطلوبان" }, { status: 400 });
    }
    const consultation = await prisma.legalConsultation.create({
      data: {
        typeId: body.typeId,
        clientName: body.clientName,
        clientEmail: body.clientEmail || "",
        clientPhone: body.clientPhone || "",
        subject: body.subject || "",
        description: body.description || "",
        status: body.status || "pending",
        lawyerId: body.lawyerId || null,
        lawyerName: body.lawyerName || "",
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        response: body.response || "",
        price: body.price || 0,
        isPaid: body.isPaid || false,
        paymentMethod: body.paymentMethod || "",
        notes: body.notes || "",
      },
      include: { consultationType: true },
    });
    return NextResponse.json(consultation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
