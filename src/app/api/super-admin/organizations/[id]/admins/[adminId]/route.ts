import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { hash } from "bcryptjs";
import {
  requireSuperAdmin,
  unauthorized,
  forbidden,
  badRequest,
  notFound,
  serverError,
  success,
} from "@/lib/server-auth";
import { updateOrgAdminSchema } from "@/lib/validations";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; adminId: string }> }
) {
  try {
    const user = await requireSuperAdmin();
    const { id, adminId } = await params;

    // Verify the admin exists and belongs to this org
    const existingAdmin = await prisma.user.findFirst({
      where: {
        id: adminId,
        organizationId: id,
        role: "ADMIN",
      },
    });

    if (!existingAdmin) {
      return notFound("Admin not found in this organization");
    }

    const body = await req.json();
    const result = updateOrgAdminSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.errors.map((e) => e.message).join(", "));
    }

    const data = result.data;

    // If email changed, check uniqueness
    if (data.email && data.email !== existingAdmin.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        return badRequest("A user with this email already exists");
      }
    }

    // Build update payload
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;

    // If password provided, hash it
    if (data.password) {
      updateData.passwordHash = await hash(data.password, 12);
    }

    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        jobTitle: true,
        organizationId: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Audit log with old/new values
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    if (data.name && data.name !== existingAdmin.name) {
      oldValues.name = existingAdmin.name;
      newValues.name = data.name;
    }
    if (data.email && data.email !== existingAdmin.email) {
      oldValues.email = existingAdmin.email;
      newValues.email = data.email;
    }
    if (data.status && data.status !== existingAdmin.status) {
      oldValues.status = existingAdmin.status;
      newValues.status = data.status;
    }
    if (data.jobTitle !== undefined && data.jobTitle !== existingAdmin.jobTitle) {
      oldValues.jobTitle = existingAdmin.jobTitle;
      newValues.jobTitle = data.jobTitle;
    }
    if (data.password) {
      newValues.passwordChanged = true;
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ORG_ADMIN_UPDATED",
        entity: "User",
        entityId: adminId,
        oldValues: oldValues as any,
        newValues: newValues as any,
      },
    });

    return success(updatedAdmin);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; adminId: string }> }
) {
  try {
    const user = await requireSuperAdmin();
    const { id, adminId } = await params;

    // Verify admin belongs to this org
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        organizationId: id,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return notFound("Admin not found in this organization");
    }

    // Soft delete: set status to INACTIVE
    await prisma.user.update({
      where: { id: adminId },
      data: { status: "INACTIVE" },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ORG_ADMIN_DELETED",
        entity: "User",
        entityId: adminId,
        oldValues: {
          name: admin.name,
          email: admin.email,
          status: admin.status,
        } as any,
        newValues: {
          status: "INACTIVE",
          organizationId: id,
        } as any,
      },
    });

    return success({ message: "Admin deactivated successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
