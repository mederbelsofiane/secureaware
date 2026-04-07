import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, orgOrGlobalWhere, unauthorized, notFound, badRequest, noOrganization, serverError, success } from "@/lib/server-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.length < 1) {
      return badRequest("Invalid module ID");
    }

    const user = await requireAuth();

    // Build where clause: module must belong to user's org or be global
    const where: Record<string, unknown> = { id };
    if (user.organizationId) {
      where.AND = [orgOrGlobalWhere(user)];
    }

    const trainingModule = await prisma.module.findFirst({
      where,
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            content: true,
            durationMins: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
        quiz: {
          include: {
            questions: {
              include: {
                options: {
                  select: {
                    id: true,
                    text: true,
                    order: true,
                    ...(user.role === "ADMIN" ? { isCorrect: true } : {}),
                  },
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
        _count: {
          select: { lessons: true, moduleProgress: true },
        },
      },
    });

    if (!trainingModule) {
      return notFound("Module not found");
    }

    if (user.role !== "ADMIN" && !trainingModule.isPublished) {
      return notFound("Module not found");
    }

    let userProgress = null;
    let lessonProgress: { userId: string; lessonId: string; isCompleted: boolean; completedAt: Date | null }[] = [];
    if (user.role !== "ADMIN") {
      userProgress = await prisma.moduleProgress.findUnique({
        where: {
          userId_moduleId: { userId: user.id, moduleId: id },
        },
      });

      lessonProgress = await prisma.lessonProgress.findMany({
        where: {
          userId: user.id,
          lessonId: { in: trainingModule.lessons.map((l) => l.id) },
        },
      });
    }

    const completedLessonIds = new Set(lessonProgress.filter(lp => lp.isCompleted).map(lp => lp.lessonId));
    const lessonsWithProgress = trainingModule.lessons.map(lesson => ({
      ...lesson,
      completed: completedLessonIds.has(lesson.id),
    }));

    return success({
      ...trainingModule,
      lessons: lessonsWithProgress,
      progress: userProgress,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
