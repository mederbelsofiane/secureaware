import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, forbidden, badRequest, notFound, serverError, success } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSuperAdmin();
    const { id: orgId } = await params;

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        maxUsers: true,
        currentUsers: true,
        billingEmail: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        logo: true,
      },
    });

    if (!organization) {
      return notFound("Organization not found");
    }

    const userCount = await prisma.user.count({
      where: { organizationId: orgId },
    });

    const events = await prisma.subscriptionEvent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    return success({
      ...organization,
      actualUsers: userCount,
      events,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (message === "FORBIDDEN") return forbidden();
    return serverError(message);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSuperAdmin();
    const { id: orgId } = await params;

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) return notFound("Organization not found");

    const body = await request.json();
    const { type, description, amount, currency, planFrom, planTo } = body;

    if (!type) {
      return badRequest("Event type is required");
    }

    const event = await prisma.subscriptionEvent.create({
      data: {
        organizationId: orgId,
        type,
        description: description || null,
        amount: amount ? parseFloat(amount) : null,
        currency: currency || "USD",
        planFrom: planFrom || null,
        planTo: planTo || null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "SUBSCRIPTION_EVENT_CREATED",
        entity: "SubscriptionEvent",
        entityId: event.id,
        newValues: { type, description, amount, orgId },
      },
    });

    return success(event, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (message === "FORBIDDEN") return forbidden();
    return serverError(message);
  }
}