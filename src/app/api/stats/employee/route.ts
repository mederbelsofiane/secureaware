import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const [moduleProgress, quizResults, badges, certificates, recentActivities] =
      await Promise.all([
        prisma.moduleProgress.findMany({
          where: { userId: user.id },
          include: {
            module: {
              select: { id: true, title: true, category: true },
            },
          },
        }),
        prisma.quizResult.findMany({
          where: { userId: user.id },
          include: {
            quiz: {
              select: { id: true, title: true, passingScore: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.userBadge.findMany({
          where: { userId: user.id },
          include: { badge: true },
          orderBy: { earnedAt: "desc" },
        }),
        prisma.certificate.findMany({
          where: { userId: user.id },
          orderBy: { issuedAt: "desc" },
        }),
        prisma.activity.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    // Fetch user risk score
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { riskScore: true },
    });

    const totalModules = await prisma.module.count({ where: { isPublished: true } });
    const completedModules = moduleProgress.filter((mp) => mp.isCompleted).length;

    // Average quiz score
    const avgScore =
      quizResults.length > 0
        ? Math.round(
            (quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length) * 100
          ) / 100
        : 0;

    const passedQuizzes = quizResults.filter((r) => r.passed).length;

    // Assigned quizzes count
    const totalAssignedQuizzes = await prisma.quizAssignment.count({
      where: { userId: user.id },
    });

    return success({
      totalModules,
      completedModules,
      moduleProgress,
      averageScore: avgScore,
      riskScore: userData?.riskScore ?? 50,
      totalQuizzes: totalAssignedQuizzes,
      passedQuizzes,
      quizResults,
      badges,
      certificates,
      recentActivities,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    return serverError();
  }
}
