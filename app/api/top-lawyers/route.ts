import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lawyers as sampleLawyers, type Lawyer } from "@/lib/data";

export const dynamic = "force-dynamic";

interface TopLawyer extends Lawyer {
  rank: number;
  cityRank: number;
  plan: string;
  planAr: string;
  planColor: string;
}

const POINT_BASED_PLANS = [
  { minPoints: 0, id: "free", nameAr: "مجاني", color: "#6B7280" },
  { minPoints: 10, id: "starter", nameAr: "مبتدئ", color: "#3B82F6" },
  { minPoints: 30, id: "basic", nameAr: "أساسي", color: "#8B5CF6" },
  { minPoints: 60, id: "professional", nameAr: "محترف", color: "#F59E0B" },
  { minPoints: 100, id: "elite", nameAr: "متميز", color: "#EF4444" },
  { minPoints: 200, id: "expert", nameAr: "خبير", color: "#10B981" },
];

function getPlanForPoints(points: number) {
  const sorted = [...POINT_BASED_PLANS].sort((a, b) => b.minPoints - a.minPoints);
  return sorted.find((p) => points >= p.minPoints) || sorted[sorted.length - 1];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 100);

    // 1. Get lawyers from adminData blob (sample data) and auto-calculate points
    const sampleWithPoints: TopLawyer[] = sampleLawyers.map((l) => {
      // Auto-calculate points for sample lawyers who don't have points set
      let points = l.points || 0;
      if (points === 0) {
        points += 10; // Base profile points
        points += Math.min(l.experience || 0, 20); // Experience points
        if (l.verified) points += 15;
        if (l.bio && l.bio.length > 10) points += 5;
        if (l.whatsapp) points += 3;
        if (l.telegram) points += 3;
        if (l.facebook) points += 3;
        if (l.instagram) points += 3;
        if (l.online) points += 5;
        if (l.rating >= 4.5) points += 10;
        else if (l.rating >= 4.0) points += 5;
        if ((l.reviews || 0) >= 100) points += 15;
        else if ((l.reviews || 0) >= 50) points += 10;
        else if ((l.reviews || 0) >= 10) points += 5;
      }
      const plan = getPlanForPoints(points);
      return { ...l, points, rank: 0, cityRank: 0, plan: plan.id, planAr: plan.nameAr, planColor: plan.color };
    });

    // 2. Get lawyers from Prisma database
    const dbLawyers = await prisma.lawyer.findMany({
      include: { user: { select: { name: true, email: true } } },
    });

    const dbWithPoints: TopLawyer[] = dbLawyers.map((l) => {
      const points = l.points || 0;
      const plan = getPlanForPoints(points);
      const languages = (() => { try { return JSON.parse(l.languages || "[]"); } catch { return ["العربية"]; } })();
      return {
        id: l.id || `db-${l.id}`,
        name: l.name || l.user?.name || "",
        slug: l.slug || "",
        city: l.city || "",
        specialization: l.specialization || "",
        experience: l.experience || 0,
        rating: l.rating || 0,
        reviews: l.reviewCount || 0,
        verified: l.verified || false,
        price: l.price || 0,
        online: l.online || false,
        gender: (l.gender as "male" | "female") || "male",
        languages,
        bio: l.bio || "",
        initials: l.initials || "",
        hue: l.hue || "from-blue-600 to-indigo-700",
        whatsapp: l.whatsapp || "",
        telegram: l.telegram || "",
        facebook: l.facebook || "",
        instagram: l.instagram || "",
        photoUrl: l.photoUrl || "",
        email: l.user?.email || "",
        points,
        rank: 0,
        cityRank: 0,
        plan: plan.id,
        planAr: plan.nameAr,
        planColor: plan.color,
      };
    });

    // 3. Merge and deduplicate (prefer DB lawyers over sample data)
    const mergedMap = new Map<string, TopLawyer>();
    for (const l of sampleWithPoints) {
      mergedMap.set(l.id, l);
    }
    for (const l of dbWithPoints) {
      mergedMap.set(l.id, l); // DB overrides sample
    }

    let allLawyers = Array.from(mergedMap.values());

    // 4. Filter by city if requested
    if (city && city !== "all") {
      allLawyers = allLawyers.filter((l) => l.city === city);
    }

    // 5. Sort by points (descending), then rating (descending), then reviews (descending)
    allLawyers.sort((a, b) => {
      if (b.points !== a.points) return (b.points || 0) - (a.points || 0);
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

    // 6. Assign ranks
    allLawyers = allLawyers.slice(0, limit).map((l, i) => ({ ...l, rank: i + 1 }));

    return NextResponse.json({
      lawyers: allLawyers,
      total: allLawyers.length,
    });
  } catch (error) {
    console.error("Error fetching top lawyers:", error);
    return NextResponse.json({ lawyers: [], cityStats: {}, total: 0 });
  }
}