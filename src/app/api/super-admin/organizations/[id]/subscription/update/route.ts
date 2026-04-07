import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, forbidden, badRequest, notFound, serverError, success } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSuperAdmin();
    const { id: orgId } = await params;

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) return notFound("Organization not found");

    const body = await request.json();
    const { plan, maxUsers, billingEmail, subscriptionStartDate, subscriptionEndDate } = body;

    const updateData: Record<string, unknown> = {} as Record<string, unknown>;
    const oldValues: Record<string, unknown> = {} as Record<string, unknown>;

    if (plan !== undefined && plan !== org.plan) {
      oldValues.plan = org.plan;
      updateData.plan = plan;

      // Create subscription event for plan change
      await prisma.subscriptionEvent.create({
        data: {
          organizationId: orgId,
          type: plan > org.plan ? "UPGRADE" : "DOWNGRADE",
          description: `Plan changed from ${org.plan} to ${plan}`,
          planFrom: org.plan,
          planTo: plan,
        },
      });
    }

    if (maxUsers !== undefined) {
      oldValues.maxUsers = org.maxUsers;
      updateData.maxUsers = parseInt(maxUsers);
    }

    if (billingEmail !== undefined) {
      oldValues.billingEmail = org.billingEmail;
      updateData.billingEmail = billingEmail || null;
    }

    if (subscriptionStartDate !== undefined) {
      oldValues.subscriptionStartDate = org.subscriptionStartDate;
      updateData.subscriptionStartDate = subscriptionStartDate ? new Date(subscriptionStartDate) : null;
    }

    if (subscriptionEndDate !== undefined) {
      oldValues.subscriptionEndDate = org.subscriptionEndDate;
      updateData.subscriptionEndDate = subscriptionEndDate ? new Date(subscriptionEndDate) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return badRequest("No fields to update");
    }

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "SUBSCRIPTION_UPDATED",
        entity: "Organization",
        entityId: orgId,
        oldValues: oldValues as Record<string, string>,
        newValues: updateData as Record<string, string>,
      },
    });

    return success(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (message === "FORBIDDEN") return forbidden();
    return serverError(message);
  }
}