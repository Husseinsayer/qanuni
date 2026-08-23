import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.payerIncome || body.payerIncome <= 0) {
      return NextResponse.json({ error: "الدخل يجب أن يكون أكبر من صفر" }, { status: 400 });
    }
    const calc = await prisma.alimonyCalculation.create({
      data: {
        sessionId: body.sessionId || `alimony_${Date.now()}`,
        payerName: body.payerName || "",
        payerIncome: body.payerIncome,
        payerIncomeSource: body.payerIncomeSource || "",
        recipientType: body.recipientType || "wife",
        recipientCount: body.recipientCount || 1,
        maritalStatus: body.maritalStatus || "married",
        hasHousing: body.hasHousing || false,
        housingCost: body.housingCost || 0,
        hasEducation: body.hasEducation || false,
        educationCost: body.educationCost || 0,
        hasHealthcare: body.hasHealthcare || false,
        healthcareCost: body.healthcareCost || 0,
        specialCircumstances: JSON.stringify(body.specialCircumstances || []),
        result: JSON.stringify(body.result || {}),
        totalAlimony: body.totalAlimony || 0,
        status: body.status || "completed",
        notes: body.notes || "",
      },
    });
    return NextResponse.json(calc, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const calcs = await prisma.alimonyCalculation.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(calcs);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
