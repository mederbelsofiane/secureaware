import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const returnAll = req.nextUrl.searchParams.get("all") === "true";

    const badges = await prisma.badge.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { userBadges: true },
        },
      },
    });

    // If employee, also attach which badges the current user has earned
    if (user.role !== "ADMIN") {
      const earnedBadges = await prisma.userBadge.findMany({
        where: { userId: user.id },
        select: { badgeId: true, earnedAt: true },
      });
      const earnedMap = new Map(earnedBadges.map((eb) => [eb.badgeId, eb.earnedAt]));

      const badgesWithEarned = badges.map((badge) => ({
        ...badge,
        earned: earnedMap.has(badge.id),
        earnedAt: earnedMap.get(badge.id) || null,
      }));

      return success(badgesWithEarned);
    }

    // Admin view - returnAll is implicit (badges are always a flat list)
    return success(badges);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    return serverError();
  }
}
