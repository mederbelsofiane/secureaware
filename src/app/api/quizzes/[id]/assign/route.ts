import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireRole, unauthorized, forbidden, badRequest, notFound, serverError, success } from "@/lib/server-auth";
import { quizAssignmentSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: quizId } = await params;
    if (!quizId || typeof quizId !== "string" || quizId.length < 1) {
      return badRequest("Invalid quiz ID");
    }

    await requireRole(["ADMIN"]);

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return notFound("Quiz not found");
    }

    const [userAssignments, departmentAssignments] = await Promise.all([
      prisma.quizAssignment.findMany({
        where: { quizId },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, department: { select: { id: true, name: true } } },
          },
        },
        orderBy: { assignedAt: "desc" },
      }),
      prisma.quizDepartment.findMany({
        where: { quizId },
        include: {
          department: {
            select: { id: true, name: true, employeeCount: true },
          },
        },
        orderBy: { assignedAt: "desc" },
      }),
    ]);

    return success({
      quizId,
      userAssignments,
      departmentAssignments,
      totalUserAssignments: userAssignments.length,
      totalDepartmentAssignments: departmentAssignments.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: quizId } = await params;
    if (!quizId || typeof quizId !== "string" || quizId.length < 1) {
      return badRequest("Invalid quiz ID");
    }

    const currentUser = await requireRole(["ADMIN"]);

    const body = await req.json();
    const parsed = quizAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { departmentIds, userIds, dueDate } = parsed.data;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return notFound("Quiz not found");
    }

    const results: { userAssignments: number; departmentAssignments: number } = {
      userAssignments: 0,
      departmentAssignments: 0,
    };

    // Assign to departments
    if (departmentIds && departmentIds.length > 0) {
      for (const departmentId of departmentIds) {
        await prisma.quizDepartment.upsert({
          where: { quizId_departmentId: { quizId, departmentId } },
          create: { quizId, departmentId },
          update: {},
        });
        results.departmentAssignments++;
      }
    }

    // Assign to individual users
    if (userIds && userIds.length > 0) {
      for (const userId of userIds) {
        await prisma.quizAssignment.upsert({
          where: { quizId_userId: { quizId, userId } },
          create: {
            quizId,
            userId,
            dueDate: dueDate ? new Date(dueDate) : null,
          },
          update: {
            dueDate: dueDate ? new Date(dueDate) : null,
          },
        });
        results.userAssignments++;

        // Log activity for each assigned user
        await prisma.activity.create({
          data: {
            userId,
            type: "CAMPAIGN_ASSIGNED",
            target: quiz.title,
            details: `Assigned quiz: ${quiz.title}`,
          },
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "ASSIGN",
        entity: "Quiz",
        entityId: quizId,
        newValues: {
          departmentIds: departmentIds || [],
          userIds: userIds || [],
          dueDate: dueDate || null,
        } as Prisma.InputJsonValue,
      },
    });

    return success({
      message: "Quiz assigned successfully",
      ...results,
    }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
