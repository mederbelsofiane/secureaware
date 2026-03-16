import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  requireAuth,
  requireRole,
  unauthorized,
  forbidden,
  badRequest,
  notFound,
  serverError,
  success,
} from "@/lib/server-auth";
import { createQuizSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.length < 1) {
      return badRequest("Invalid quiz ID");
    }

    const user = await requireAuth();

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        module: { select: { id: true, title: true, category: true } },
        questions: {
          include: {
            options: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { questions: true, results: true } },
      },
    });

    if (!quiz) {
      return notFound("Quiz not found");
    }

    if (user.role !== "ADMIN") {
      // Employee: can view any published quiz
      if (quiz.status !== "PUBLISHED") {
        return notFound("Quiz not found");
      }

      // Hide correct answers from employees
      const sanitizedQuiz = {
        ...quiz,
        questions: quiz.questions.map((q) => ({
          ...q,
          options: q.options.map(({ isCorrect, ...opt }) => opt),
          explanation: null, // Hide explanations until after submission
        })),
      };

      // Attach user results
      const userResults = await prisma.quizResult.findMany({
        where: { userId: user.id, quizId: id },
        orderBy: { createdAt: "desc" },
      });

      return success({ ...sanitizedQuiz, userResults });
    }

    return success(quiz);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.length < 1) {
      return badRequest("Invalid quiz ID");
    }

    const currentUser = await requireRole(["ADMIN"]);

    const existing = await prisma.quiz.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Quiz not found");
    }

    const body = await req.json();
    const parsed = createQuizSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { dueDate, visibleFrom, visibleUntil, ...rest } = parsed.data;

    // Sanitize string fields
    const updateData: Record<string, unknown> = { ...rest };
    if (rest.title !== undefined) updateData.title = rest.title.trim();
    if (rest.description !== undefined) updateData.description = rest.description?.trim() || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (visibleFrom !== undefined) updateData.visibleFrom = visibleFrom ? new Date(visibleFrom) : null;
    if (visibleUntil !== undefined) updateData.visibleUntil = visibleUntil ? new Date(visibleUntil) : null;

    const quiz = await prisma.quiz.update({
      where: { id },
      data: updateData,
      include: {
        module: { select: { id: true, title: true } },
        questions: {
          include: { options: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        _count: { select: { questions: true, results: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "UPDATE",
        entity: "Quiz",
        entityId: id,
        oldValues: { title: existing.title, status: existing.status } as Prisma.InputJsonValue,
        newValues: updateData as Prisma.InputJsonValue,
      },
    });

    return success(quiz);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.length < 1) {
      return badRequest("Invalid quiz ID");
    }

    const currentUser = await requireRole(["ADMIN"]);

    const existing = await prisma.quiz.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Quiz not found");
    }

    await prisma.quiz.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "DELETE",
        entity: "Quiz",
        entityId: id,
        oldValues: { title: existing.title, status: existing.status } as Prisma.InputJsonValue,
      },
    });

    return success({ message: "Quiz deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
