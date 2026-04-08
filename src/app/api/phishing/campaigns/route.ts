import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, badRequest, serverError, success } from "@/lib/server-auth";

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
