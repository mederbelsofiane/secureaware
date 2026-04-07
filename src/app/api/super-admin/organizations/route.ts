import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  requireSuperAdmin,
  unauthorized,
  forbidden,
  badRequest,
  serverError,
  success,
} from "@/lib/server-auth";
import {
  createOrganizationSchema,
  paginationSchema,
} from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await requireSuperAdmin();

    const searchParams = req.nextUrl.searchParams;

    // Parse pagination
    const paginationResult = paginationSchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
    });

    if (!paginationResult.success) {
      return badRequest("Invalid pagination parameters");
    }

    const { page, limit, search, sortBy, sortOrder } = paginationResult.data;
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status") || undefined;
    const plan = searchParams.get("plan") || undefined;

    // Build where clause
    const where: Prisma.OrganizationWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status as Prisma.EnumOrganizationStatusFilter;
    }

    if (plan) {
      where.plan = plan as Prisma.EnumOrganizationPlanFilter;
    }

    // Build orderBy
    const orderBy: Prisma.OrganizationOrderByWithRelationInput = {};
    if (sortBy) {
      (orderBy as Record<string, string>)[sortBy] = sortOrder || "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [items, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          status: true,
          maxUsers: true,
          domain: true,
          billingEmail: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return success({
      items,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireSuperAdmin();

    const body = await req.json();
    const result = createOrganizationSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.errors.map((e) => e.message).join(", "));
    }

    const { name, slug, plan, maxUsers, domain, billingEmail, notes } =
      result.data;

    // Check slug uniqueness
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return badRequest("An organization with this slug already exists");
    }

    // Check domain uniqueness if provided
    if (domain) {
      const existingDomain = await prisma.organization.findUnique({
        where: { domain },
      });
      if (existingDomain) {
        return badRequest("An organization with this domain already exists");
      }
    }

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        plan,
        maxUsers,
        domain: domain || null,
        billingEmail: billingEmail || null,
        notes: notes || null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ORG_CREATED",
        entity: "Organization",
        entityId: org.id,
        newValues: { name, slug, plan, maxUsers } as any,
      },
    });

    return success(org, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
