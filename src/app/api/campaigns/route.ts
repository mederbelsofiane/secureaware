import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireRole, unauthorized, forbidden, badRequest, serverError, success } from "@/lib/server-auth";
import { paginationSchema, createCampaignSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const returnAll = req.nextUrl.searchParams.get("all") === "true";

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = paginationSchema.safeParse(searchParams);
    const { page = 1, limit = 20, search, sortBy, sortOrder } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20, search: undefined, sortBy: undefined, sortOrder: undefined };

    const skip = returnAll ? 0 : (page - 1) * limit;
    const take = returnAll ? 10000 : limit;
    const status = req.nextUrl.searchParams.get("status");
    const type = req.nextUrl.searchParams.get("type");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (type) where.type = type;

    const orderBy: Record<string, string> = sortBy
      ? { [sortBy]: sortOrder || "asc" }
      : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          _count: {
            select: {
              campaignModules: true,
              campaignUsers: true,
              campaignDepartments: true,
              campaignQuizzes: true,
            },
          },
          campaignDepartments: {
            include: {
              department: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.campaign.count({ where }),
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
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["ADMIN"]);

    const body = await req.json();
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { moduleIds, departmentIds, userIds, startDate, endDate, ...campaignData } = parsed.data;

    // Sanitize
    const sanitizedData = {
      ...campaignData,
      name: campaignData.name.trim(),
      description: campaignData.description?.trim() || null,
    };

    const campaign = await prisma.campaign.create({
      data: {
        ...sanitizedData,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: user.id,
        campaignModules: moduleIds && moduleIds.length > 0
          ? { create: moduleIds.map((moduleId) => ({ moduleId })) }
          : undefined,
        campaignDepartments: departmentIds && departmentIds.length > 0
          ? { create: departmentIds.map((departmentId) => ({ departmentId })) }
          : undefined,
        campaignUsers: userIds && userIds.length > 0
          ? { create: userIds.map((userId) => ({ userId })) }
          : undefined,
      },
      include: {
        campaignModules: {
          include: { module: { select: { id: true, title: true } } },
        },
        campaignDepartments: {
          include: { department: { select: { id: true, name: true } } },
        },
        campaignUsers: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: {
          select: {
            campaignModules: true,
            campaignUsers: true,
            campaignDepartments: true,
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entity: "Campaign",
        entityId: campaign.id,
        newValues: { name: sanitizedData.name, type: sanitizedData.type } as Prisma.InputJsonValue,
      },
    });

    return success(campaign, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
