import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  unauthorized,
  forbidden,
  badRequest,
  notFound,
  serverError,
  success,
} from "@/lib/server-auth";
import { quizSubmissionSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: quizId } = await params;
    if (!quizId || typeof quizId !== "string" || quizId.length < 1) {
      return badRequest("Invalid quiz ID");
    }

    const user = await requireAuth();

    const body = await req.json();
    const parsed = quizSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { answers, timeTaken } = parsed.data;

    // Verify quiz exists and is published
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return notFound("Quiz not found");
    }

    if (quiz.status !== "PUBLISHED") {
      return badRequest("This quiz is not available for submission");
    }

    // Verify user is assigned
    const isDirectlyAssigned = await prisma.quizAssignment.findUnique({
      where: { quizId_userId: { quizId, userId: user.id } },
    });

    let isDeptAssigned = false;
    if (!isDirectlyAssigned && user.departmentId) {
      const deptAssignment = await prisma.quizDepartment.findUnique({
        where: { quizId_departmentId: { quizId, departmentId: user.departmentId } },
      });
      isDeptAssigned = !!deptAssignment;
    }

    if (!isDirectlyAssigned && !isDeptAssigned) {
      return forbidden();
    }

    // Calculate score
    const totalQuestions = quiz.questions.length;
    if (totalQuestions === 0) {
      return badRequest("This quiz has no questions");
    }

    let correctAnswers = 0;
    const answerDetails: {
      questionId: string;
      selectedOptionId: string;
      correctOptionId: string;
      isCorrect: boolean;
    }[] = [];

    for (const question of quiz.questions) {
      const selectedOptionId = answers[question.id];
      const correctOption = question.options.find((o) => o.isCorrect);
      const correctOptionId = correctOption?.id || "";
      const isCorrect = selectedOptionId === correctOptionId;

      if (isCorrect) correctAnswers++;

      answerDetails.push({
        questionId: question.id,
        selectedOptionId: selectedOptionId || "",
        correctOptionId,
        isCorrect,
      });
    }

    const score = Math.round((correctAnswers / totalQuestions) * 10000) / 100;
    const passed = score >= quiz.passingScore;

    // Get attempt number
    const previousAttempts = await prisma.quizResult.count({
      where: { userId: user.id, quizId },
    });

    // Save result
    const result = await prisma.quizResult.create({
      data: {
        userId: user.id,
        quizId,
        score,
        passed,
        answers: answerDetails,
        timeTaken,
        attemptNum: previousAttempts + 1,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: passed ? "QUIZ_COMPLETED" : "QUIZ_FAILED",
        target: quiz.title,
        details: `Score: ${score}% (${correctAnswers}/${totalQuestions}) - ${passed ? "PASSED" : "FAILED"}`,
      },
    });

    // Update user risk score based on performance
    const allResults = await prisma.quizResult.findMany({
      where: { userId: user.id },
      select: { score: true },
    });
    const avgScore = allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length;
    const newRiskScore = Math.max(0, Math.min(100, 100 - avgScore));

    await prisma.user.update({
      where: { id: user.id },
      data: { riskScore: Math.round(newRiskScore * 100) / 100 },
    });

    return success({
      result,
      score,
      passed,
      totalQuestions,
      correctAnswers,
      passingScore: quiz.passingScore,
      answerDetails,
    }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
