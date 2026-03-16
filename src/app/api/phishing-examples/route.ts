import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, serverError, success } from "@/lib/server-auth";
import { paginationSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    const returnAll = req.nextUrl.searchParams.get("all") === "true";

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = paginationSchema.safeParse(searchParams);
    const { page = 1, limit = 20, search, sortBy, sortOrder } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20, search: undefined, sortBy: undefined, sortOrder: undefined };

    const skip = returnAll ? 0 : (page - 1) * limit;
    const take = returnAll ? 10000 : limit;
    const difficulty = req.nextUrl.searchParams.get("difficulty");
    const category = req.nextUrl.searchParams.get("category");

    const where: Record<string, unknown> = { isActive: true };
    if (search) {
      where.OR = [
        { subject: { contains: search.trim(), mode: "insensitive" } },
        { sender: { contains: search.trim(), mode: "insensitive" } },
        { body: { contains: search.trim(), mode: "insensitive" } },
      ];
    }
    if (difficulty) where.difficulty = difficulty;
    if (category) where.category = category;

    const orderBy: Record<string, string> = sortBy
      ? { [sortBy]: sortOrder || "asc" }
      : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.phishingExample.findMany({ where, skip, take, orderBy }),
      prisma.phishingExample.count({ where }),
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
    return serverError();
  }
}
