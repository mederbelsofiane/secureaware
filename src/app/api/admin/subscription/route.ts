import { NextResponse } from "next/server";
import { requireOrgRole, forbidden, serverError, success } from "@/lib/server-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireOrgRole(["ADMIN"]);
    const orgId = user.organizationId!;

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        plan: true,
        status: true,
        maxUsers: true,
        currentUsers: true,
        billingEmail: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get actual user count
    const userCount = await prisma.user.count({
      where: { organizationId: orgId },
    });

    // Get subscription events
    const events = await prisma.subscriptionEvent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 20,
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
    if (message === "NO_ORGANIZATION") return NextResponse.json({ error: "No organization" }, { status: 403 });
    return serverError(message);
  }
}