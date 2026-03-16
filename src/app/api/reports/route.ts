import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, unauthorized, forbidden, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    // 1. Overview stats
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { status: "ACTIVE" } });
    const totalModules = await prisma.module.count({ where: { isPublished: true } });

    const scoreAgg = await prisma.quizResult.aggregate({ _avg: { score: true } });
    const averageScore = Math.round((scoreAgg._avg.score ?? 0) * 100) / 100;

    const totalEmployees = await prisma.user.count({ where: { role: "EMPLOYEE", status: "ACTIVE" } });
    const totalPublishedModules = await prisma.module.count({ where: { isPublished: true } });
    const completedProgress = await prisma.moduleProgress.count({ where: { isCompleted: true } });
    const totalPossible = totalPublishedModules * (totalEmployees || 1);
    const completionRate = totalPossible > 0
      ? Math.round((completedProgress / totalPossible) * 10000) / 100
      : 0;

    const highRiskUsers = await prisma.user.count({ where: { status: "ACTIVE", riskScore: { gte: 70 } } });

    const overview = {
      totalUsers,
      activeUsers,
      totalModules,
      averageScore,
      completionRate,
      highRiskUsers,
    };

    // 2. Department stats
    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const users = await prisma.user.findMany({
          where: { departmentId: dept.id, status: "ACTIVE" },
          select: { id: true },
        });
        const userIds = users.map((u) => u.id);
        const employeeCount = userIds.length;

        if (employeeCount === 0) {
          return { name: dept.name, employeeCount: 0, avgScore: 0, completionRate: 0, highRiskCount: 0 };
        }

        const deptScoreAgg = await prisma.quizResult.aggregate({
          where: { userId: { in: userIds } },
          _avg: { score: true },
        });
        const avgScore = Math.round((deptScoreAgg._avg.score ?? 0) * 100) / 100;

        const deptCompleted = await prisma.moduleProgress.count({
          where: { userId: { in: userIds }, isCompleted: true },
        });
        const deptTotal = totalPublishedModules * employeeCount;
        const deptCompletionRate = deptTotal > 0
          ? Math.round((deptCompleted / deptTotal) * 10000) / 100
          : 0;

        const deptHighRisk = await prisma.user.count({
          where: { id: { in: userIds }, riskScore: { gte: 70 } },
        });

        return { name: dept.name, employeeCount, avgScore, completionRate: deptCompletionRate, highRiskCount: deptHighRisk };
      })
    );

    // 3. Completion trends - last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const completions = await prisma.moduleProgress.findMany({
      where: { isCompleted: true, completedAt: { gte: sixMonthsAgo } },
      select: { completedAt: true },
      orderBy: { completedAt: "asc" },
    });

    const quizResults = await prisma.quizResult.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const newUsers = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Build monthly trend data
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleString("en-US", { month: "short", year: "2-digit" }));
    }

    const getMonthKey = (date: Date) =>
      date.toLocaleString("en-US", { month: "short", year: "2-digit" });

    const completionTrend = months.map((month) => ({
      month,
      completions: completions.filter((c) => c.completedAt && getMonthKey(c.completedAt) === month).length,
      quizzes: quizResults.filter((q) => getMonthKey(q.createdAt) === month).length,
      users: newUsers.filter((u) => getMonthKey(u.createdAt) === month).length,
    }));

    // 4. Risk distribution
    const lowRisk = await prisma.user.count({ where: { status: "ACTIVE", riskScore: { lt: 30 } } });
    const medRisk = await prisma.user.count({ where: { status: "ACTIVE", riskScore: { gte: 30, lt: 60 } } });
    const highRisk = await prisma.user.count({ where: { status: "ACTIVE", riskScore: { gte: 60, lt: 80 } } });
    const critRisk = await prisma.user.count({ where: { status: "ACTIVE", riskScore: { gte: 80 } } });

    const riskDistribution = [
      { level: "LOW", count: lowRisk },
      { level: "MEDIUM", count: medRisk },
      { level: "HIGH", count: highRisk },
      { level: "CRITICAL", count: critRisk },
    ];

    return success({
      overview,
      departmentStats,
      completionTrend,
      riskDistribution,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
