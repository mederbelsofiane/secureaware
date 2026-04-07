import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, orgWhere, unauthorized, noOrganization, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const where: Record<string, unknown> = { status: "ACTIVE" };
    if (user.organizationId) {
      where.organizationId = user.organizationId;
    }

    const users = await prisma.user.findMany({
      where,
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
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
