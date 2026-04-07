import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  requireSuperAdmin,
  unauthorized,
  forbidden,
  badRequest,
  notFound,
  serverError,
  success,
} from "@/lib/server-auth";
import { updateOrganizationSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSuperAdmin();
    const { id } = await params;

    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            lastLoginAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        departments: {
          select: {
            id: true,
            name: true,
            _count: {
              select: { users: true },
            },
          },
        },
        _count: {
          select: {
            users: true,
            departments: true,
          },
        },
      },
    });

    if (!org) {
      return notFound("Organization not found");
    }

    return success(org);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSuperAdmin();
    const { id } = await params;

    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return notFound("Organization not found");
    }

    const body = await req.json();
    const result = updateOrganizationSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.errors.map((e) => e.message).join(", "));
    }

    const data = result.data;

    // If slug changed, check uniqueness
    if (data.slug && data.slug !== existingOrg.slug) {
      const slugExists = await prisma.organization.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return badRequest("An organization with this slug already exists");
      }
    }

    // Build update data, handling date strings
    const updateData: Record<string, unknown> = { ...data };

    if (data.subscriptionStartDate !== undefined) {
      updateData.subscriptionStartDate = data.subscriptionStartDate
        ? new Date(data.subscriptionStartDate)
        : null;
    }

    if (data.subscriptionEndDate !== undefined) {
      updateData.subscriptionEndDate = data.subscriptionEndDate
        ? new Date(data.subscriptionEndDate)
        : null;
    }

    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: updateData,
    });

    // Build audit old/new values
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    for (const key of Object.keys(data) as (keyof typeof data)[]) {
      const oldVal = (existingOrg as Record<string, unknown>)[key];
      const newVal = data[key];
      if (oldVal !== newVal) {
        oldValues[key] = oldVal;
        newValues[key] = newVal;
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ORG_UPDATED",
        entity: "Organization",
        entityId: id,
        oldValues: oldValues as any,
        newValues: newValues as any,
      },
    });

    return success(updatedOrg);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSuperAdmin();
    const { id } = await params;

    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!org) {
      return notFound("Organization not found");
    }

    if (org._count.users > 0) {
      // Soft delete: set status to INACTIVE
      await prisma.organization.update({
        where: { id },
        data: { status: "INACTIVE" },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "ORG_SOFT_DELETED",
          entity: "Organization",
          entityId: id,
          oldValues: { status: org.status } as any,
          newValues: {
            status: "INACTIVE",
            reason: `Soft deleted - ${org._count.users} users exist`,
          } as any,
        },
      });

      return success({
        message: "Organization deactivated (has existing users)",
        softDelete: true,
      });
    } else {
      // Hard delete: no users
      await prisma.organization.delete({
        where: { id },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "ORG_HARD_DELETED",
          entity: "Organization",
          entityId: id,
          oldValues: { name: org.name, slug: org.slug, plan: org.plan } as any,
        },
      });

      return success({
        message: "Organization permanently deleted",
        softDelete: false,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
