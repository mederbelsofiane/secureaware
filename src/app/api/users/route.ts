import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, badRequest, serverError, success } from "@/lib/server-auth";
import { paginationSchema, createUserSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOrgRole(["ADMIN"]);

    const returnAll = req.nextUrl.searchParams.get("all") === "true";

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = paginationSchema.safeParse(searchParams);
    const { page = 1, limit = 20, search, sortBy, sortOrder } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20, search: undefined, sortBy: undefined, sortOrder: undefined };

    const skip = returnAll ? 0 : (page - 1) * limit;
    const take = returnAll ? 10000 : limit;

    const role = req.nextUrl.searchParams.get("role");
    const status = req.nextUrl.searchParams.get("status");
    const departmentId = req.nextUrl.searchParams.get("departmentId");

    const where: Record<string, unknown> = { ...orgWhere(user) };
    if (search) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { jobTitle: { contains: search.trim(), mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const orderBy: Record<string, string> = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
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
      }),
      prisma.user.count({ where }),
    ]);

    if (returnAll) return success(items);

    return success({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireOrgRole(["ADMIN"]);

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { name, email, password, role, departmentId, jobTitle } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return badRequest("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        role: role as any,
        departmentId: departmentId || null,
        jobTitle: jobTitle?.trim() || null,
        organizationId: currentUser.organizationId,
      },
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (departmentId) {
      await prisma.department.update({
        where: { id: departmentId },
        data: { employeeCount: { increment: 1 } },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "CREATE",
        entity: "User",
        entityId: user.id,
        newValues: { name: trimmedName, email: normalizedEmail, role } as Prisma.InputJsonValue,
      },
    });

    return success(user, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
