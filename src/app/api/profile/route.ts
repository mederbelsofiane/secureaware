import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest, notFound, serverError, success } from "@/lib/server-auth";
import { profileUpdateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const sessionUser = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        jobTitle: true,
        phone: true,
        riskScore: true,
        department: { select: { id: true, name: true } },
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: "desc" },
        },
        certificates: {
          orderBy: { issuedAt: "desc" },
        },
        moduleProgress: {
          include: { module: { select: { id: true, title: true, category: true } } },
        },
        quizResults: {
          include: { quiz: { select: { id: true, title: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        createdAt: true,
      },
    });

    if (!user) {
      return notFound("User not found");
    }

    return success(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    return serverError();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await requireAuth();

    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return badRequest(validation.error.errors.map((e) => e.message).join(", "));
    }

    // Only allow updating own profile fields - prevent mass assignment
    const updateData: Record<string, unknown> = {};
    if (validation.data.name !== undefined) updateData.name = validation.data.name.trim();
    if (validation.data.phone !== undefined) updateData.phone = validation.data.phone?.trim() || null;
    if (validation.data.jobTitle !== undefined) updateData.jobTitle = validation.data.jobTitle?.trim() || null;

    const user = await prisma.user.update({
      where: { id: sessionUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
        phone: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: sessionUser.id,
        type: "PROFILE_UPDATED",
        target: "Profile",
        details: "Updated profile information",
      },
    });

    return success({ message: "Profile updated successfully", user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    return serverError();
  }
}
