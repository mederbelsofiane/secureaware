import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  requireSuperAdmin,
  unauthorized,
  forbidden,
  serverError,
  success,
} from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireSuperAdmin();

    // Organization counts by status
    const [totalOrganizations, activeOrganizations, suspendedOrganizations, inactiveOrganizations] =
      await Promise.all([
        prisma.organization.count(),
        prisma.organization.count({ where: { status: "ACTIVE" } }),
        prisma.organization.count({ where: { status: "SUSPENDED" } }),
        prisma.organization.count({ where: { status: "INACTIVE" } }),
      ]);

    // Total users across ALL organizations
    const totalUsers = await prisma.user.count();

    // Organizations grouped by plan
    const orgsByPlanRaw = await prisma.organization.groupBy({
      by: ["plan"],
      _count: { plan: true },
    });

    const orgsByPlan: Record<string, number> = {
      FREE: 0,
      STARTER: 0,
      PROFESSIONAL: 0,
      ENTERPRISE: 0,
    };
    for (const entry of orgsByPlanRaw) {
      orgsByPlan[entry.plan] = entry._count.plan;
    }

    // Recent 5 organizations with user counts
    const recentOrganizations = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true,
        createdAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    // Recent 10 audit logs (AuditLog has no user relation, so we manually join)
    const recentAuditLogsRaw = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Batch fetch users for audit logs
    const auditUserIds = Array.from(new Set(recentAuditLogsRaw.map(l => l.userId).filter(Boolean))) as string[];
    const auditUsers = auditUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: auditUserIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const userMap = new Map(auditUsers.map(u => [u.id, u]));

    const recentAuditLogs = recentAuditLogsRaw.map(log => ({
      ...log,
      user: log.userId ? userMap.get(log.userId) || null : null,
    }));

    return success({
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      inactiveOrganizations,
      totalUsers,
      orgsByPlan,
      recentOrganizations,
      recentAuditLogs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
