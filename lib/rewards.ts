// ===== Lawyer Rewards & Points System =====
// Configurable thresholds and badges to motivate lawyers to publish content.

import { prisma } from "@/lib/prisma";

export interface RewardTier {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  minPoints: number;
  description: string;
}

export interface RewardsConfig {
  /** Points awarded per published article */
  pointsPerArticle: number;
  /** Points awarded when a lawyer's profile is completed */
  pointsPerProfileComplete: number;
  /** Points awarded per client review received */
  pointsPerReview: number;
  /** Badge tiers sorted by minPoints ascending */
  tiers: RewardTier[];
}

const SITE_CONFIG_KEY = "rewardsConfig";

const DEFAULT_TIERS: RewardTier[] = [
  {
    id: "newcomer",
    name: "Newcomer",
    nameAr: "مبتدئ",
    icon: "Sprout",
    color: "#6B7280",
    minPoints: 0,
    description: "المحامي المسجل حديثاً",
  },
  {
    id: "publisher",
    name: "Publisher",
    nameAr: "ناشر",
    icon: "PenLine",
    color: "#3B82F6",
    minPoints: 10,
    description: "نشر أولى مقالاته القانونية",
  },
  {
    id: "active-publisher",
    name: "Active Publisher",
    nameAr: "ناشر نشط",
    icon: "FileText",
    color: "#8B5CF6",
    minPoints: 30,
    description: "نشر عدة مقالات بانتظام",
  },
  {
    id: "professional-publisher",
    name: "Professional Publisher",
    nameAr: "ناشر محترف",
    icon: "Award",
    color: "#F59E0B",
    minPoints: 60,
    description: "ناشر مقالات بارز ومحترف",
  },
  {
    id: "elite-publisher",
    name: "Elite Publisher",
    nameAr: "ناشر متميز",
    icon: "Crown",
    color: "#EF4444",
    minPoints: 100,
    description: "من أبرز الناشرين على المنصة",
  },
  {
    id: "legal-expert",
    name: "Legal Expert",
    nameAr: "خبير قانوني",
    icon: "Gem",
    color: "#10B981",
    minPoints: 200,
    description: "خبير قانوني بمرجعية عالية",
  },
];

export const DEFAULT_REWARDS_CONFIG: RewardsConfig = {
  pointsPerArticle: 10,
  pointsPerProfileComplete: 5,
  pointsPerReview: 3,
  tiers: DEFAULT_TIERS,
};

/** Load rewards config from the database (SiteConfig). Falls back to defaults. */
export async function getRewardsConfig(): Promise<RewardsConfig> {
  try {
    const row = await prisma.siteConfig.findUnique({
      where: { key: SITE_CONFIG_KEY },
    });
    if (row?.value) {
      const parsed = JSON.parse(row.value) as Partial<RewardsConfig>;
      return {
        ...DEFAULT_REWARDS_CONFIG,
        ...parsed,
        tiers: parsed.tiers && parsed.tiers.length > 0 ? parsed.tiers : DEFAULT_TIERS,
      };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_REWARDS_CONFIG;
}

/** Save rewards config to the database. */
export async function saveRewardsConfig(config: RewardsConfig): Promise<void> {
  const json = JSON.stringify(config);
  const existing = await prisma.siteConfig.findUnique({
    where: { key: SITE_CONFIG_KEY },
  });
  if (existing) {
    await prisma.siteConfig.update({
      where: { key: SITE_CONFIG_KEY },
      data: { value: json },
    });
  } else {
    await prisma.siteConfig.create({
      data: { key: SITE_CONFIG_KEY, value: json },
    });
  }
}

/** Get the reward tier for a given point total. */
export function getTierForPoints(
  points: number,
  tiers: RewardTier[]
): RewardTier {
  const sorted = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
  return sorted.find((t) => points >= t.minPoints) || sorted[sorted.length - 1];
}

/** Award points to a lawyer. Returns the new total. */
export async function awardPoints(
  lawyerId: string,
  points: number,
  _reason: string
): Promise<number> {
  const lawyer = await prisma.lawyer.findUnique({
    where: { id: lawyerId },
    select: { id: true, points: true },
  });
  if (!lawyer) return 0;

  const newTotal = lawyer.points + points;
  await prisma.lawyer.update({
    where: { id: lawyerId },
    data: { points: newTotal },
  });

  return newTotal;
}

/** Deduct points from a lawyer (e.g., on article deletion). Returns the new total. */
export async function deductPoints(
  lawyerId: string,
  points: number,
  _reason: string
): Promise<number> {
  const lawyer = await prisma.lawyer.findUnique({
    where: { id: lawyerId },
    select: { id: true, points: true },
  });
  if (!lawyer) return 0;

  const newTotal = Math.max(0, lawyer.points - points);
  await prisma.lawyer.update({
    where: { id: lawyerId },
    data: { points: newTotal },
  });

  return newTotal;
}
