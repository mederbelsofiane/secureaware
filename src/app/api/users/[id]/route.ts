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
import { updateUserSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.length < 1) {
      return badRequest("Invalid user ID");
    }

    const currentUser = await requireAuth();

    // Users can view their own profile; admins can view anyone
    if (currentUser.id !== id && currentUser.role !== "ADMIN") {
      return forbidden();
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        jobTitle: true,
        riskScore: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        moduleProgress: {
          include: {
            module: { select: { id: true, title: true, category: true } },
          },
          orderBy: { startedAt: "desc" },
        },
        quizResults: {
          include: {
            quiz: { select: { id: true, title: true, passingScore: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: "desc" },
        },
        certificates: {
          orderBy: { issuedAt: "desc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return notFound("User not found");
    }

    return success(user);
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
      return badRequest("Invalid user ID");
    }

    const currentUser = await requireRole(["ADMIN"]);

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return notFound("User not found");
    }

    // Sanitize inputs
    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name.trim();
    if (parsed.data.email !== undefined) updateData.email = parsed.data.email.trim().toLowerCase();
    if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.jobTitle !== undefined) updateData.jobTitle = parsed.data.jobTitle?.trim() || null;
    if (parsed.data.departmentId !== undefined) updateData.departmentId = parsed.data.departmentId || null;

    // Check email uniqueness if email is being changed
    if (updateData.email && updateData.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: updateData.email as string },
      });
      if (emailTaken) {
        return badRequest("A user with this email already exists");
      }
    }

    // Track old department for count updates
    const oldDeptId = existing.departmentId;
    const newDeptId = updateData.departmentId !== undefined
      ? (updateData.departmentId as string | null)
      : oldDeptId;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        jobTitle: true,
        riskScore: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Update department employee counts if department changed
    if (oldDeptId !== newDeptId) {
      if (oldDeptId) {
        await prisma.department.update({
          where: { id: oldDeptId },
          data: { employeeCount: { decrement: 1 } },
        });
      }
      if (newDeptId) {
        await prisma.department.update({
          where: { id: newDeptId },
          data: { employeeCount: { increment: 1 } },
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "UPDATE",
        entity: "User",
        entityId: id,
        oldValues: {
          name: existing.name,
          email: existing.email,
          role: existing.role,
          status: existing.status,
          departmentId: existing.departmentId,
        } as Prisma.InputJsonValue,
        newValues: updateData as Prisma.InputJsonValue,
      },
    });

    return success(user);
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
      return badRequest("Invalid user ID");
    }

    const currentUser = await requireRole(["ADMIN"]);

    // Prevent admin from deactivating themselves
    if (currentUser.id === id) {
      return badRequest("You cannot deactivate your own account");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return notFound("User not found");
    }

    // Soft delete: set status to INACTIVE
    const user = await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "DELETE",
        entity: "User",
        entityId: id,
        oldValues: { status: existing.status } as Prisma.InputJsonValue,
        newValues: { status: "INACTIVE" } as Prisma.InputJsonValue,
      },
    });

    return success(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
