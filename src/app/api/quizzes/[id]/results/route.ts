import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, forbidden, badRequest, notFound, serverError, success } from "@/lib/server-auth";
import { paginationSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: quizId } = await params;
    if (!quizId || typeof quizId !== "string" || quizId.length < 1) {
      return badRequest("Invalid quiz ID");
    }

    const user = await requireAuth();

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, title: true, passingScore: true },
    });

    if (!quiz) {
      return notFound("Quiz not found");
    }

    const returnAll = req.nextUrl.searchParams.get("all") === "true";
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = paginationSchema.safeParse(searchParams);
    const { page = 1, limit = 20 } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20 };
    const skip = returnAll ? 0 : (page - 1) * limit;
    const take = returnAll ? 10000 : limit;

    if (user.role === "ADMIN") {
      // Admin: see all results for this quiz
      const [items, total] = await Promise.all([
        prisma.quizResult.findMany({
          where: { quizId },
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: { select: { id: true, name: true } },
              },
            },
          },
        }),
        prisma.quizResult.count({ where: { quizId } }),
      ]);

      // Aggregate stats
      const stats = await prisma.quizResult.aggregate({
        where: { quizId },
        _avg: { score: true },
        _min: { score: true },
        _max: { score: true },
        _count: true,
      });

      const passedCount = await prisma.quizResult.count({
        where: { quizId, passed: true },
      });

      const statsData = {
        averageScore: Math.round((stats._avg.score ?? 0) * 100) / 100,
        minScore: stats._min.score ?? 0,
        maxScore: stats._max.score ?? 0,
        totalAttempts: stats._count,
        passedCount,
        passRate: stats._count > 0
          ? Math.round((passedCount / stats._count) * 10000) / 100
          : 0,
      };

      if (returnAll) return success({ quiz, items, stats: statsData });

      return success({
        quiz,
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: statsData,
      });
    } else {
      // Employee: own results only
      const [items, total] = await Promise.all([
        prisma.quizResult.findMany({
          where: { quizId, userId: user.id },
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.quizResult.count({ where: { quizId, userId: user.id } }),
      ]);

      if (returnAll) return success({ quiz, items });

      return success({
        quiz,
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
