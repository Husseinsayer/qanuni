import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            specialization: true,
            city: true,
            initials: true,
            hue: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("[client/reviews] GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { lawyerId, rating, content } = body;

    if (!lawyerId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const lawyer = await prisma.lawyer.findUnique({ where: { id: lawyerId } });
    if (!lawyer) {
      return NextResponse.json({ error: "Lawyer not found" }, { status: 404 });
    }

    const existingReview = await prisma.review.findFirst({
      where: { userId: session.user.id, lawyerId },
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this lawyer" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        lawyerId,
        rating,
        content: content || "",
      },
    });

    const allReviews = await prisma.review.findMany({
      where: { lawyerId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.lawyer.update({
      where: { id: lawyerId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("[client/reviews] POST error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review || review.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    const allReviews = await prisma.review.findMany({
      where: { lawyerId: review.lawyerId },
      select: { rating: true },
    });

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await prisma.lawyer.update({
        where: { id: review.lawyerId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: allReviews.length,
        },
      });
    } else {
      await prisma.lawyer.update({
        where: { id: review.lawyerId },
        data: { rating: 0, reviewCount: 0 },
      });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("[client/reviews] DELETE error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
