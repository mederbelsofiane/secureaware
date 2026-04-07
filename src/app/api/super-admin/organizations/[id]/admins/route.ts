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
import { createOrgAdminSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSuperAdmin();
    const { id } = await params;

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id },
    });

    if (!org) {
      return notFound("Organization not found");
    }

    const admins = await prisma.user.findMany({
      where: {
        organizationId: id,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        jobTitle: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return success(admins);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSuperAdmin();
    const { id } = await params;

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id },
    });

    if (!org) {
      return notFound("Organization not found");
    }

    const body = await req.json();
    const result = createOrgAdminSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.errors.map((e) => e.message).join(", "));
    }

    const { name, email, password, jobTitle } = result.data;

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return badRequest("A user with this email already exists");
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        organizationId: id,
        jobTitle: jobTitle || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        jobTitle: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ORG_ADMIN_CREATED",
        entity: "User",
        entityId: newAdmin.id,
        newValues: {
          name,
          email,
          role: "ADMIN",
          organizationId: id,
          organizationName: org.name,
        } as any,
      },
    });

    return success(newAdmin, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
