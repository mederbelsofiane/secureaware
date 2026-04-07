import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, notFound, serverError, success } from "@/lib/server-auth";

export async function GET() {
  try {
    const sessionUser = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        jobTitle: true,
        riskScore: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        organizationId: true,
        organization: { select: { id: true, name: true, slug: true, plan: true } },
        lastLoginAt: true,
        createdAt: true,
        certificates: {
          orderBy: { issuedAt: "desc" },
        },
        badges: {
          include: {
            badge: true,
          },
          orderBy: { earnedAt: "desc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: {
            quizResults: true,
            moduleProgress: true,
            certificates: true,
            badges: true,
          },
        },
      },
    });

    if (!user) {
      return notFound("User not found");
    }

    return success(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    return serverError();
  }
}
