import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lawyer = await prisma.lawyer.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, status: true } } },
    });

    if (!lawyer) {
      return NextResponse.json({ error: "Lawyer not found" }, { status: 404 });
    }

    return NextResponse.json(lawyer);
  } catch (error) {
    console.error("[lawyer/[id]] GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}