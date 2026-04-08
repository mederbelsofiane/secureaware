import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, badRequest, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      ...orgWhere(user),
      type: "PHISHING_SIMULATION",
    };
    if (status) where.status = status;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          _count: { select: { campaignUsers: true, phishingEvents: true } },
          phishingEvents: {
            select: {
              emailSentAt: true,
              emailOpenedAt: true,
              linkClickedAt: true,
              reportedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    // Calculate stats for each campaign
    const campaignsWithStats = campaigns.map((c) => {
      const events = c.phishingEvents;
      const sent = events.filter((e) => e.emailSentAt).length;
      const opened = events.filter((e) => e.emailOpenedAt).length;
      const clicked = events.filter((e) => e.linkClickedAt).length;
      const reported = events.filter((e) => e.reportedAt).length;
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        status: c.status,
        startDate: c.startDate,
        endDate: c.endDate,
        createdAt: c.createdAt,
        targets: c._count.campaignUsers,
        sent,
        openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
        reportRate: sent > 0 ? Math.round((reported / sent) * 100) : 0,
      };
    });

    return success({ campaigns: campaignsWithStats, total, page, limit });
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
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { name, description, templateId, userIds, departmentIds, scheduledAt, staggerMinutes } = body;
    if (!name || !templateId) return badRequest("Missing required fields: name, templateId");

    // Validate template belongs to org
    const template = await prisma.phishingTemplate.findFirst({
      where: { id: templateId, ...orgWhere(user) },
    });
    if (!template) return badRequest("Template not found or does not belong to your organization");

    // Collect target user IDs
    const targetUserIds = new Set<string>(userIds || []);

    // If departmentIds provided, find all users in those departments
    if (departmentIds && departmentIds.length > 0) {
      const deptUsers = await prisma.user.findMany({
        where: {
          organizationId: user.organizationId!,
          departmentId: { in: departmentIds },
          status: "ACTIVE",
        },
        select: { id: true },
      });
      deptUsers.forEach((u) => targetUserIds.add(u.id));
    }

    if (targetUserIds.size === 0) return badRequest("No target users selected");

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: "PHISHING_SIMULATION",
        status: "DRAFT",
        startDate: scheduledAt ? new Date(scheduledAt) : null,
        organizationId: user.organizationId!,
        createdBy: user.id,
        campaignUsers: {
          create: Array.from(targetUserIds).map((userId) => ({ userId })),
        },
      },
    });

    // Create PhishingEvent for each user
    const events = await prisma.phishingEvent.createMany({
      data: Array.from(targetUserIds).map((userId) => ({
        campaignId: campaign.id,
        userId,
        templateId,
        organizationId: user.organizationId!,
      })),
    });

    return success({
      campaign,
      eventsCreated: events.count,
      staggerMinutes: staggerMinutes || 0,
    }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
