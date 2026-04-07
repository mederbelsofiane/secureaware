import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  requireOrgRole,
  orgWhere,
  unauthorized,
  forbidden,
  noOrganization,
  badRequest,
  notFound,
  serverError,
  success,
} from "@/lib/server-auth";
import { updateCampaignSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.length < 1) {
      return badRequest("Invalid campaign ID");
    }

    const user = await requireOrgRole(["ADMIN"]);

    const campaign = await prisma.campaign.findFirst({
      where: { id, ...orgWhere(user) },
      include: {
        campaignModules: {
          include: {
            module: {
              select: { id: true, title: true, category: true, difficulty: true, durationMins: true },
            },
          },
        },
        campaignDepartments: {
          include: {
            department: {
              select: { id: true, name: true, employeeCount: true },
            },
          },
        },
        campaignUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: { select: { id: true, name: true } },
              },
            },
          },
        },
        campaignQuizzes: {
          include: {
            quiz: {
              select: { id: true, title: true, status: true, passingScore: true },
            },
          },
        },
        _count: {
          select: {
            campaignModules: true,
            campaignUsers: true,
            campaignDepartments: true,
            campaignQuizzes: true,
          },
        },
      },
    });

    if (!campaign) {
      return notFound("Campaign not found");
    }

    return success(campaign);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.length < 1) {
      return badRequest("Invalid campaign ID");
    }

    const currentUser = await requireOrgRole(["ADMIN"]);

    const existing = await prisma.campaign.findFirst({
      where: { id, ...orgWhere(currentUser) },
    });
    if (!existing) {
      return notFound("Campaign not found");
    }

    const body = await req.json();
    const parsed = updateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { moduleIds, departmentIds, userIds, startDate, endDate, ...campaignData } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (campaignData.name !== undefined) updateData.name = campaignData.name.trim();
    if (campaignData.description !== undefined) updateData.description = campaignData.description?.trim() || null;
    if (campaignData.type !== undefined) updateData.type = campaignData.type;
    if (campaignData.status !== undefined) updateData.status = campaignData.status;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    if (moduleIds !== undefined) {
      await prisma.campaignModule.deleteMany({ where: { campaignId: id } });
      if (moduleIds.length > 0) {
        await prisma.campaignModule.createMany({
          data: moduleIds.map((moduleId) => ({ campaignId: id, moduleId })),
        });
      }
    }

    if (departmentIds !== undefined) {
      await prisma.campaignDepartment.deleteMany({ where: { campaignId: id } });
      if (departmentIds.length > 0) {
        await prisma.campaignDepartment.createMany({
          data: departmentIds.map((departmentId) => ({ campaignId: id, departmentId })),
        });
      }
    }

    if (userIds !== undefined) {
      await prisma.campaignUser.deleteMany({ where: { campaignId: id } });
      if (userIds.length > 0) {
        await prisma.campaignUser.createMany({
          data: userIds.map((userId) => ({ campaignId: id, userId })),
        });
      }
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
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

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "UPDATE",
        entity: "Campaign",
        entityId: id,
        oldValues: { name: existing.name, status: existing.status, type: existing.type } as Prisma.InputJsonValue,
        newValues: updateData as Prisma.InputJsonValue,
      },
    });

    return success(campaign);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.length < 1) {
      return badRequest("Invalid campaign ID");
    }

    const currentUser = await requireOrgRole(["ADMIN"]);

    const existing = await prisma.campaign.findFirst({
      where: { id, ...orgWhere(currentUser) },
    });
    if (!existing) {
      return notFound("Campaign not found");
    }

    await prisma.campaign.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "DELETE",
        entity: "Campaign",
        entityId: id,
        oldValues: { name: existing.name, status: existing.status, type: existing.type } as Prisma.InputJsonValue,
      },
    });

    return success({ message: "Campaign deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
