import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);
    const orgId = user.organizationId!;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    const hasDateFilter = !!(from || to);

    const userWhere: any = { organizationId: orgId, status: "ACTIVE" };
    if (userId) userWhere.id = userId;

    const users = await prisma.user.findMany({
      where: userWhere,
      include: {
        department: { select: { name: true } },
        moduleProgress: {
          where: hasDateFilter ? { completedAt: dateFilter } : undefined,
          include: { module: { select: { title: true, category: true } } },
        },
        quizResults: {
          where: hasDateFilter ? { createdAt: dateFilter } : undefined,
          include: { quiz: { select: { title: true, passingScore: true } } },
        },
        phishingEvents: {
          where: hasDateFilter ? { createdAt: dateFilter } : undefined,
          include: { campaign: { select: { name: true } } },
        },
        certificates: {
          where: hasDateFilter ? { issuedAt: dateFilter } : undefined,
        },
      },
      orderBy: { name: "asc" },
    });

    const employees = users.map((u) => {
      const completedModules = u.moduleProgress.filter((m) => m.isCompleted);
      const passedQuizzes = u.quizResults.filter((q) => q.passed);
      const totalQuizzes = u.quizResults.length;
      const avgQuizScore = totalQuizzes > 0
        ? Math.round(u.quizResults.reduce((s, q) => s + q.score, 0) / totalQuizzes)
        : 0;
      const phishingClicked = u.phishingEvents.filter((e) => e.linkClickedAt).length;
      const phishingReported = u.phishingEvents.filter((e) => e.reportedAt).length;
      const moduleCompletionRate = u.moduleProgress.length > 0
        ? Math.round((completedModules.length / u.moduleProgress.length) * 100)
        : 0;
      const quizPassRate = totalQuizzes > 0
        ? Math.round((passedQuizzes.length / totalQuizzes) * 100)
        : 0;
      const phishingScore = u.phishingEvents.length > 0
        ? Math.round(((u.phishingEvents.length - phishingClicked) / u.phishingEvents.length) * 100)
        : 100;
      const overallScore = Math.round((moduleCompletionRate + quizPassRate + phishingScore) / 3);

      return {
          id: u.id,
        user: {
          name: u.name,
          email: u.email,
          department: u.department?.name || "N/A",
          role: u.role,
          joinDate: u.createdAt.toISOString(),
        },
        modulesCompleted: completedModules.map((m) => ({
          name: m.module.title,
          completionDate: m.completedAt?.toISOString() || null,
          progress: m.progress,
        })),
        quizResults: u.quizResults.map((q) => ({
          name: q.quiz.title,
          score: q.score,
          passed: q.passed,
          date: q.createdAt.toISOString(),
        })),
        phishingResults: {
          totalSimulations: u.phishingEvents.length,
          clicked: phishingClicked,
          reported: phishingReported,
          campaigns: Array.from(new Set(u.phishingEvents.map((e) => e.campaign.name))),
        },
        certificates: u.certificates.map((c) => ({
          moduleName: c.moduleName,
          score: c.quizScore,
          issuedAt: c.issuedAt.toISOString(),
        })),
        complianceScore: overallScore,
        moduleCompletionRate,
        quizPassRate,
        avgQuizScore,
      };
    });

    // Summary stats
    const totalEmployees = employees.length;
    const compliantCount = employees.filter((e) => e.complianceScore >= 70).length;
    const avgScore = totalEmployees > 0
      ? Math.round(employees.reduce((s, e) => s + e.complianceScore, 0) / totalEmployees)
      : 0;
    const avgQuiz = totalEmployees > 0
      ? Math.round(employees.reduce((s, e) => s + e.avgQuizScore, 0) / totalEmployees)
      : 0;
    const avgModuleRate = totalEmployees > 0
      ? Math.round(employees.reduce((s, e) => s + e.moduleCompletionRate, 0) / totalEmployees)
      : 0;

    return success({
      exportDate: new Date().toISOString(),
      organization: orgId,
      dateRange: { from: from || null, to: to || null },
      summary: {
        totalEmployees,
        compliantEmployees: compliantCount,
        complianceRate: totalEmployees > 0 ? Math.round((compliantCount / totalEmployees) * 100) : 0,
        avgComplianceScore: avgScore,
        avgQuizScore: avgQuiz,
        avgModuleCompletionRate: avgModuleRate,
      },
      employees,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}