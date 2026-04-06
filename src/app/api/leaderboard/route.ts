import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Return all active users with limited data for leaderboard
    const users = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            quizResults: true,
            badges: true,
            certificates: true,
            moduleProgress: true,
          },
        },
        badges: {
          select: {
            id: true,
            badge: { select: { name: true, icon: true } },
          },
        },
      },
      orderBy: { riskScore: "asc" },
    });

    return success(users);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    return serverError();
  }
}
