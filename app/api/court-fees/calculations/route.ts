import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.claimAmount || body.claimAmount <= 0) {
      return NextResponse.json({ error: "مبلغ الدعوى يجب أن يكون أكبر من صفر" }, { status: 400 });
    }
    const calc = await prisma.courtFeeCalculation.create({
      data: {
        sessionId: body.sessionId || `fee_${Date.now()}`,
        caseType: body.caseType || "civil",
        claimAmount: body.claimAmount,
        courtLevel: body.courtLevel || "first",
        hasExemption: body.hasExemption || false,
        exemptionType: body.exemptionType || "",
        reductionApplied: body.reductionApplied || false,
        result: JSON.stringify(body.result || {}),
        totalFee: body.totalFee || 0,
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
    const calcs = await prisma.courtFeeCalculation.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(calcs);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
