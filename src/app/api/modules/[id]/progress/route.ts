import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, forbidden, badRequest, notFound, serverError, success } from "@/lib/server-auth";
import { z } from "zod";

const progressSchema = z.object({
  lessonId: z.string().min(1).optional(),
  completed: z.boolean().default(true),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: moduleId } = await params;
    if (!moduleId || typeof moduleId !== "string" || moduleId.length < 1) {
      return badRequest("Invalid module ID");
    }

    const user = await requireAuth();

    const body = await req.json();
    const parsed = progressSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { lessonId, completed } = parsed.data;

    // Verify module exists and is published
    const trainingModule = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: { select: { id: true }, orderBy: { order: "asc" } },
      },
    });

    if (!trainingModule || !trainingModule.isPublished) {
      return notFound("Module not found");
    }

    // If a specific lesson is being marked
    if (lessonId) {
      const lesson = trainingModule.lessons.find((l) => l.id === lessonId);
      if (!lesson) {
        return notFound("Lesson not found in this training module");
      }

      // Upsert lesson progress
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: { userId: user.id, lessonId },
        },
        create: {
          userId: user.id,
          lessonId,
          isCompleted: completed,
          completedAt: completed ? new Date() : null,
        },
        update: {
          isCompleted: completed,
          completedAt: completed ? new Date() : null,
        },
      });
    }

    // Calculate overall module progress based on completed lessons
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        lessonId: { in: trainingModule.lessons.map((l) => l.id) },
        isCompleted: true,
      },
    });

    const totalLessons = trainingModule.lessons.length;
    const progressPercent = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 10000) / 100
      : 0;
    const isModuleCompleted = progressPercent >= 100;

    // Upsert module progress
    const moduleProgress = await prisma.moduleProgress.upsert({
      where: {
        userId_moduleId: { userId: user.id, moduleId },
      },
      create: {
        userId: user.id,
        moduleId,
        progress: progressPercent,
        isCompleted: isModuleCompleted,
        completedAt: isModuleCompleted ? new Date() : null,
      },
      update: {
        progress: progressPercent,
        isCompleted: isModuleCompleted,
        completedAt: isModuleCompleted ? new Date() : null,
      },
    });

    // Log activity if module just completed
    if (isModuleCompleted) {
      const existingActivity = await prisma.activity.findFirst({
        where: {
          userId: user.id,
          type: "MODULE_COMPLETED",
          target: trainingModule.title,
        },
      });

      if (!existingActivity) {
        await prisma.activity.create({
          data: {
            userId: user.id,
            type: "MODULE_COMPLETED",
            target: trainingModule.title,
            details: `Completed module: ${trainingModule.title}`,
          },
        });
      }
    } else if (progressPercent > 0) {
      const existingStart = await prisma.activity.findFirst({
        where: {
          userId: user.id,
          type: "MODULE_STARTED",
          target: trainingModule.title,
        },
      });

      if (!existingStart) {
        await prisma.activity.create({
          data: {
            userId: user.id,
            type: "MODULE_STARTED",
            target: trainingModule.title,
            details: `Started module: ${trainingModule.title}`,
          },
        });
      }
    }

    return success({
      moduleProgress,
      completedLessons,
      totalLessons,
      progressPercent,
    });
  } catch (error: unknown) {
    console.error("Progress API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError(message);
  }
}
