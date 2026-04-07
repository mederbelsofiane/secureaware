import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, orgOrGlobalWhere, unauthorized, noOrganization, serverError, success } from "@/lib/server-auth";
import { paginationSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const returnAll = req.nextUrl.searchParams.get("all") === "true";

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = paginationSchema.safeParse(searchParams);
    const { page = 1, limit = 20, search, sortBy, sortOrder } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20, search: undefined, sortBy: undefined, sortOrder: undefined };

    const skip = returnAll ? 0 : (page - 1) * limit;
    const take = returnAll ? 10000 : limit;
    const category = req.nextUrl.searchParams.get("category");
    const difficulty = req.nextUrl.searchParams.get("difficulty");

    const where: Record<string, unknown> = {};

    // Scope to org + global modules if user has an org
    if (user.organizationId) {
      Object.assign(where, orgOrGlobalWhere(user));
    }

    // Employees only see published modules
    if (user.role !== "ADMIN") {
      where.isPublished = true;
    }

    if (search) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        {
          OR: [
            { title: { contains: search.trim(), mode: "insensitive" } },
            { description: { contains: search.trim(), mode: "insensitive" } },
          ],
        },
      ];
    }
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const orderBy: Record<string, string> = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || "asc";
    } else {
      orderBy.order = "asc";
    }

    const [items, total] = await Promise.all([
      prisma.module.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          lessons: {
            select: { id: true, title: true, type: true, durationMins: true, order: true },
            orderBy: { order: "asc" },
          },
          quiz: {
            select: { id: true, title: true, status: true },
          },
          _count: {
            select: { lessons: true, moduleProgress: true },
          },
        },
      }),
      prisma.module.count({ where }),
    ]);

    // If employee, attach their progress for each module
    let itemsWithProgress = items;
    if (user.role !== "ADMIN") {
      const progressRecords = await prisma.moduleProgress.findMany({
        where: {
          userId: user.id,
          moduleId: { in: items.map((m) => m.id) },
        },
      });
      const progressMap = new Map(progressRecords.map((p) => [p.moduleId, p]));

      itemsWithProgress = items.map((m) => ({
        ...m,
        userProgress: progressMap.get(m.id) || null,
      }));
    }

    if (returnAll) return success(itemsWithProgress);

    return success({
      items: itemsWithProgress,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
