import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, unauthorized, forbidden, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const [totalUsers, activeUsers, totalModules, totalQuizzes, totalCampaigns, highRiskUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.module.count({ where: { isPublished: true } }),
        prisma.quiz.count(),
        prisma.campaign.count(),
        prisma.user.count({ where: { riskScore: { gte: 75 } } }),
      ]);

    // Average quiz score
    const scoreAgg = await prisma.quizResult.aggregate({
      _avg: { score: true },
    });
    const averageQuizScore = Math.round((scoreAgg._avg.score ?? 0) * 100) / 100;

    // Overall completion rate
    const [completedModules, totalModuleProgress] = await Promise.all([
      prisma.moduleProgress.count({ where: { isCompleted: true } }),
      prisma.moduleProgress.count(),
    ]);
    const completionRate =
      totalModuleProgress > 0
        ? Math.round((completedModules / totalModuleProgress) * 10000) / 100
        : 0;

    // Recent activities
    const recentActivities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
    });

    // Department stats
    const departments = await prisma.department.findMany({
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

    // Active campaigns count
    const activeCampaigns = await prisma.campaign.count({
      where: { status: "ACTIVE" },
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
    return serverError();
  }
}
