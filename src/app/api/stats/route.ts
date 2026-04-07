import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOrgRole(["ADMIN"]);
    const ow = orgWhere(user);

    const [totalUsers, activeUsers, totalModules, totalQuizzes, totalCampaigns, highRiskUsers] =
      await Promise.all([
        prisma.user.count({ where: ow }),
        prisma.user.count({ where: { ...ow, status: "ACTIVE" } }),
        prisma.module.count({ where: { isPublished: true, OR: [{ organizationId: user.organizationId }, { isGlobal: true }] } }),
        prisma.quiz.count({ where: ow }),
        prisma.campaign.count({ where: ow }),
        prisma.user.count({ where: { ...ow, riskScore: { gte: 75 } } }),
      ]);

    const scoreAgg = await prisma.quizResult.aggregate({
      where: { user: ow },
      _avg: { score: true },
    });
    const averageQuizScore = Math.round((scoreAgg._avg.score ?? 0) * 100) / 100;

    const [completedModules, totalModuleProgress] = await Promise.all([
      prisma.moduleProgress.count({ where: { user: ow, isCompleted: true } }),
      prisma.moduleProgress.count({ where: { user: ow } }),
    ]);
    const completionRate =
      totalModuleProgress > 0
        ? Math.round((completedModules / totalModuleProgress) * 10000) / 100
        : 0;

    const recentActivities = await prisma.activity.findMany({
      where: { user: ow },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
    });

    const departments = await prisma.department.findMany({
      where: ow,
      select: {
        id: true,
        name: true,
        employeeCount: true,
        averageScore: true,
        riskScore: true,
        completionRate: true,
      },
      orderBy: { name: "asc" },
    });

    const activeCampaigns = await prisma.campaign.count({
      where: { ...ow, status: "ACTIVE" },
    });

    return success({
      totalUsers,
      activeUsers,
      totalModules,
      totalQuizzes,
      totalCampaigns,
      activeCampaigns,
      averageQuizScore,
      completionRate,
      highRiskUsers,
      recentActivities,
      departments,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
