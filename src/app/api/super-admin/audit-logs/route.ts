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
import { paginationSchema } from "@/lib/validations";

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

    const { page, limit, sortBy, sortOrder } = paginationResult.data;
    const skip = (page - 1) * limit;

    // Filters
    const action = searchParams.get("action") || undefined;
    const entity = searchParams.get("entity") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    // Build where clause
    const where: Prisma.AuditLogWhereInput = {};

    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }

    if (entity) {
      where.entity = { contains: entity, mode: "insensitive" };
    }

    if (userId) {
      where.userId = userId;
    }

    // Date range filtering
    if (from || to) {
      where.createdAt = {};
      if (from) {
        (where.createdAt as Prisma.DateTimeFilter).gte = new Date(from);
      }
      if (to) {
        (where.createdAt as Prisma.DateTimeFilter).lte = new Date(to);
      }
    }

    // Build orderBy
    const orderBy: Prisma.AuditLogOrderByWithRelationInput = {};
    if (sortBy) {
      (orderBy as Record<string, string>)[sortBy] = sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [rawItems, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Batch fetch users for audit logs (AuditLog has no user relation)
    const auditUserIds = Array.from(new Set(rawItems.map(l => l.userId).filter(Boolean))) as string[];
    const auditUsers = auditUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: auditUserIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const userMap = new Map(auditUsers.map(u => [u.id, u]));

    const items = rawItems.map(log => ({
      ...log,
      user: log.userId ? userMap.get(log.userId) || null : null,
    }));

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
