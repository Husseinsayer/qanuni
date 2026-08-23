import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();

    if (!body.totalEstate || body.totalEstate <= 0) {
      return NextResponse.json({ error: "قيمة التركة يجب أن تكون أكبر من صفر" }, { status: 400 });
    }

    if (!body.deceasedGender || !["male", "female"].includes(body.deceasedGender)) {
      return NextResponse.json({ error: "جنس المتوفى مطلوب" }, { status: 400 });
    }

    if (!body.deathDate) {
      return NextResponse.json({ error: "تاريخ الوفاة مطلوب" }, { status: 400 });
    }

    const calculation = await prisma.inheritanceCalculation.create({
      data: {
        sessionId: body.sessionId || `calc_${Date.now()}`,
        deceasedGender: body.deceasedGender,
        deathDate: body.deathDate,
        legalSystem: body.legalSystem || "islamic",
        totalEstate: body.totalEstate,
        debts: body.debts || 0,
        wills: body.wills || 0,
        netEstate: body.netEstate || 0,
        answers: JSON.stringify(body.answers || {}),
        result: JSON.stringify(body.result || {}),
        status: body.status || "completed",
        notes: body.notes || "",
        heirs: {
          create: (body.heirs || []).map((h: Record<string, unknown>) => ({
            name: (h.name as string) || "",
            relationship: (h.relationship as string) || "",
            gender: (h.gender as string) || "",
            isAlive: (h.isAlive as boolean) ?? true,
            isDeceased: (h.isDeceased as boolean) ?? false,
            deceasedBefore: (h.deceasedBefore as boolean) ?? false,
            hasChildren: (h.hasChildren as boolean) ?? false,
            fraction: (h.fraction as string) || "",
            percentage: (h.percentage as number) || 0,
            amount: (h.amount as number) || 0,
            isExcluded: (h.isExcluded as boolean) ?? false,
            excludeReason: (h.excludeReason as string) || "",
            legalBasis: (h.legalBasis as string) || "",
          })),
        },
      },
      include: { heirs: true },
    });

    return NextResponse.json(calculation, { status: 201 });
  } catch (error) {
    console.error("Inheritance calculation save error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء حفظ الحساب" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const calculations = await prisma.inheritanceCalculation.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { heirs: true },
    });
    return NextResponse.json(calculations);
  } catch (error) {
    console.error("Inheritance calculations fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
