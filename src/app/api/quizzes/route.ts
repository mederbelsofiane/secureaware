import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireAuth, requireRole, unauthorized, forbidden, badRequest, serverError, success } from "@/lib/server-auth";
import { paginationSchema, createQuizSchema, createQuestionSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const returnAll = req.nextUrl.searchParams.get("all") === "true";

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = paginationSchema.safeParse(searchParams);
    const { page = 1, limit = 20, search, sortBy, sortOrder } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20, search: undefined, sortBy: undefined, sortOrder: undefined };

    const skip = returnAll ? 0 : (page - 1) * limit;
    const take = returnAll ? 10000 : limit;
    const status = req.nextUrl.searchParams.get("status");
    const category = req.nextUrl.searchParams.get("category");
    const difficulty = req.nextUrl.searchParams.get("difficulty");

    if (user.role === "ADMIN") {
      const where: Record<string, unknown> = {};
      if (search) {
        where.OR = [
          { title: { contains: search.trim(), mode: "insensitive" } },
          { description: { contains: search.trim(), mode: "insensitive" } },
        ];
      }
      if (status) where.status = status;
      if (category) where.category = category;
      if (difficulty) where.difficulty = difficulty;

      const orderBy: Record<string, string> = sortBy
        ? { [sortBy]: sortOrder || "asc" }
        : { createdAt: "desc" };

      const [items, total] = await Promise.all([
        prisma.quiz.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            module: { select: { id: true, title: true } },
            _count: { select: { questions: true, results: true, quizAssignments: true } },
          },
        }),
        prisma.quiz.count({ where }),
      ]);

      if (returnAll) return success(items);
      return success({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
    } else {
      // Employee: only assigned & published quizzes
      const assignments = await prisma.quizAssignment.findMany({
        where: { userId: user.id },
        select: { quizId: true, dueDate: true, assignedAt: true },
      });

      let departmentQuizIds: string[] = [];
      if (user.departmentId) {
        const deptAssignments = await prisma.quizDepartment.findMany({
          where: { departmentId: user.departmentId },
          select: { quizId: true },
        });
        departmentQuizIds = deptAssignments.map((d) => d.quizId);
      }

      const assignedQuizIds = [
        ...Array.from(new Set([...assignments.map((a) => a.quizId), ...departmentQuizIds])),
      ];

      const where: Record<string, unknown> = {
        id: { in: assignedQuizIds },
        status: "PUBLISHED",
      };
      if (search) {
        where.OR = [
          { title: { contains: search.trim(), mode: "insensitive" } },
          { description: { contains: search.trim(), mode: "insensitive" } },
        ];
      }
      if (category) where.category = category;
      if (difficulty) where.difficulty = difficulty;

      const [items, total] = await Promise.all([
        prisma.quiz.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            module: { select: { id: true, title: true } },
            questions: {
              select: { id: true },
            },
            _count: { select: { questions: true } },
          },
        }),
        prisma.quiz.count({ where }),
      ]);

      // Attach user results and assignment info
      const quizIds = items.map((q) => q.id);
      const userResults = await prisma.quizResult.findMany({
        where: { userId: user.id, quizId: { in: quizIds } },
        orderBy: { createdAt: "desc" },
      });
      const resultsMap = new Map<string, typeof userResults>();
      for (const r of userResults) {
        if (!resultsMap.has(r.quizId)) resultsMap.set(r.quizId, []);
        resultsMap.get(r.quizId)!.push(r);
      }

      const assignmentMap = new Map(assignments.map((a) => [a.quizId, a]));

      const itemsWithMeta = items.map((q) => ({
        ...q,
        results: resultsMap.get(q.id) || [],
        assignment: assignmentMap.get(q.id) || null,
      }));

      if (returnAll) return success(itemsWithMeta);
      return success({ items: itemsWithMeta, total, page, limit, totalPages: Math.ceil(total / limit) });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

const createQuizWithQuestionsSchema = createQuizSchema.extend({
  questions: z.array(createQuestionSchema).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["ADMIN"]);

    const body = await req.json();
    const parsed = createQuizWithQuestionsSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { questions, dueDate, visibleFrom, visibleUntil, ...quizData } = parsed.data;

    // Sanitize string fields
    const sanitizedData = {
      ...quizData,
      title: quizData.title.trim(),
      description: quizData.description?.trim() || null,
    };

    const quiz = await prisma.quiz.create({
      data: {
        ...sanitizedData,
        dueDate: dueDate ? new Date(dueDate) : null,
        visibleFrom: visibleFrom ? new Date(visibleFrom) : null,
        visibleUntil: visibleUntil ? new Date(visibleUntil) : null,
        createdBy: user.id,
        questions: questions
          ? {
              create: questions.map((q, qi) => ({
                text: q.text.trim(),
                explanation: q.explanation?.trim() || null,
                order: q.order ?? qi,
                options: {
                  create: q.options.map((o, oi) => ({
                    text: o.text.trim(),
                    isCorrect: o.isCorrect,
                    order: o.order ?? oi,
                  })),
                },
              })),
            }
          : undefined,
      },
      include: {
        questions: {
          include: { options: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        _count: { select: { questions: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entity: "Quiz",
        entityId: quiz.id,
        newValues: { title: sanitizedData.title, category: sanitizedData.category, difficulty: sanitizedData.difficulty } as Prisma.InputJsonValue,
      },
    });

    return success(quiz, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
