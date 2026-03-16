import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireAuth, requireRole, unauthorized, forbidden, badRequest, serverError, success } from "@/lib/server-auth";
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
    await requireAuth();

    const departments = await prisma.department.findMany({
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

    // Departments always return a flat array (used as lookup lists)
    return success(departments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireRole(["ADMIN"]);

    const body = await req.json();
    const parsed = createDepartmentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const trimmedName = parsed.data.name.trim();

    // Check uniqueness
    const existing = await prisma.department.findUnique({
      where: { name: trimmedName },
    });
    if (existing) {
      return badRequest("A department with this name already exists");
    }

    const department = await prisma.department.create({
      data: {
        name: trimmedName,
        description: parsed.data.description?.trim() || null,
      },
    });

    // Audit log
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
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await requireRole(["ADMIN"]);

    const body = await req.json();
    const parsed = updateDepartmentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { id, ...updateFields } = parsed.data;

    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      return badRequest("Department not found");
    }

    // Build update data with sanitization
    const updateData: Record<string, unknown> = {};
    if (updateFields.name !== undefined) {
      const trimmedName = updateFields.name.trim();
      // Check uniqueness if name is changing
      if (trimmedName !== existing.name) {
        const nameTaken = await prisma.department.findUnique({ where: { name: trimmedName } });
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

    // Audit log
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
    return serverError();
  }
}
