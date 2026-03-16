import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, notFound, badRequest, serverError, success } from "@/lib/server-auth";

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

    const trainingModule = await prisma.module.findUnique({
      where: { id },
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
                    // Only show isCorrect to admins
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

    // Employees cannot see unpublished modules
    if (user.role !== "ADMIN" && !trainingModule.isPublished) {
      return notFound("Module not found");
    }

    // Attach user progress if not admin
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

    return success({
      ...trainingModule,
      userProgress,
      lessonProgress,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    return serverError();
  }
}
