import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, serverError, success } from "@/lib/server-auth";
import { paginationSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const returnAll = req.nextUrl.searchParams.get("all") === "true";

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = paginationSchema.safeParse(searchParams);
    const { page = 1, limit = 20, search } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20, search: undefined };

    const skip = returnAll ? 0 : (page - 1) * limit;
    const take = returnAll ? 10000 : limit;
    const type = req.nextUrl.searchParams.get("type");

    if (user.role === "ADMIN") {
      // Admin: see all activities
      const where: Record<string, unknown> = {};
      if (type) where.type = type;
      if (search) {
        where.OR = [
          { target: { contains: search.trim(), mode: "insensitive" } },
          { details: { contains: search.trim(), mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        prisma.activity.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                department: { select: { id: true, name: true } },
              },
            },
          },
        }),
        prisma.activity.count({ where }),
      ]);

      if (returnAll) return success(items);

      return success({
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } else {
      // Employee: own activities only
      const where: Record<string, unknown> = { userId: user.id };
      if (type) where.type = type;
      if (search) {
        where.OR = [
          { target: { contains: search.trim(), mode: "insensitive" } },
          { details: { contains: search.trim(), mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        prisma.activity.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.activity.count({ where }),
      ]);

      if (returnAll) return success(items);

      return success({
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    return serverError();
  }
}
