import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireAuth, requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, badRequest, serverError, success } from "@/lib/server-auth";
import { z } from "zod";

const createDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional().nullable(),
});

const updateDepartmentSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const where: Record<string, unknown> = {};
    if (user.organizationId) {
      where.organizationId = user.organizationId;
    }

    const departments = await prisma.department.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        employeeCount: true,
        averageScore: true,
        riskScore: true,
        completionRate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    return success(departments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireOrgRole(["ADMIN"]);

    const body = await req.json();
    const parsed = createDepartmentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const trimmedName = parsed.data.name.trim();

    // Check uniqueness within org
    const existing = await prisma.department.findFirst({
      where: { name: trimmedName, ...orgWhere(currentUser) },
    });
    if (existing) {
      return badRequest("A department with this name already exists");
    }

    const department = await prisma.department.create({
      data: {
        name: trimmedName,
        description: parsed.data.description?.trim() || null,
        organizationId: currentUser.organizationId!,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "CREATE",
        entity: "Department",
        entityId: department.id,
        newValues: { name: trimmedName } as Prisma.InputJsonValue,
      },
    });

    return success(department, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await requireOrgRole(["ADMIN"]);

    const body = await req.json();
    const parsed = updateDepartmentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { id, ...updateFields } = parsed.data;

    const existing = await prisma.department.findFirst({
      where: { id, ...orgWhere(currentUser) },
    });
    if (!existing) {
      return badRequest("Department not found");
    }

    const updateData: Record<string, unknown> = {};
    if (updateFields.name !== undefined) {
      const trimmedName = updateFields.name.trim();
      if (trimmedName !== existing.name) {
        const nameTaken = await prisma.department.findFirst({
          where: { name: trimmedName, ...orgWhere(currentUser), id: { not: id } },
        });
        if (nameTaken) {
          return badRequest("A department with this name already exists");
        }
      }
      updateData.name = trimmedName;
    }
    if (updateFields.description !== undefined) {
      updateData.description = updateFields.description?.trim() || null;
    }

    const department = await prisma.department.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "UPDATE",
        entity: "Department",
        entityId: id,
        oldValues: { name: existing.name, description: existing.description } as Prisma.InputJsonValue,
        newValues: updateData as Prisma.InputJsonValue,
      },
    });

    return success(department);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
