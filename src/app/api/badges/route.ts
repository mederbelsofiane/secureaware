import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, orgOrGlobalWhere, unauthorized, noOrganization, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const where: Record<string, unknown> = {};
    if (user.organizationId) {
      Object.assign(where, orgOrGlobalWhere(user));
    }

    const badges = await prisma.badge.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { userBadges: true },
        },
      },
    });

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

    return success(badges);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
