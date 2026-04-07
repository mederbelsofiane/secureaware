import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, orgOrGlobalWhere, unauthorized, forbidden, badRequest, notFound, noOrganization, serverError, success } from "@/lib/server-auth";
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

    // Verify module exists, is published, and belongs to user's org or is global
    const where: Record<string, unknown> = { id: moduleId };
    if (user.organizationId) {
      where.AND = [orgOrGlobalWhere(user)];
    }

    const trainingModule = await prisma.module.findFirst({
      where,
      include: {
        lessons: { select: { id: true }, orderBy: { order: "asc" } },
      },
    });

    if (!trainingModule || !trainingModule.isPublished) {
      return notFound("Module not found");
    }

    if (lessonId) {
      const lesson = trainingModule.lessons.find((l) => l.id === lessonId);
      if (!lesson) {
        return notFound("Lesson not found in this training module");
      }

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
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError(message);
  }
}
