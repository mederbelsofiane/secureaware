import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);
    const orgFilter = orgWhere(user);

    // Get all phishing events for org
    const allEvents = await prisma.phishingEvent.findMany({
      where: { ...orgFilter },
      include: {
        user: { select: { name: true, email: true, department: { select: { name: true } } } },
        campaign: { select: { id: true, name: true, status: true, startDate: true } },
      },
    });

    const totalSimulations = allEvents.length;
    const totalSent = allEvents.filter((e) => e.emailSentAt).length;
    const totalOpened = allEvents.filter((e) => e.emailOpenedAt).length;
    const totalClicked = allEvents.filter((e) => e.linkClickedAt).length;
    const totalReported = allEvents.filter((e) => e.reportedAt).length;

    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
    const reportRate = totalSent > 0 ? Math.round((totalReported / totalSent) * 100) : 0;

    // Recent campaigns
    const campaigns = await prisma.campaign.findMany({
      where: { ...orgFilter, type: "PHISHING_SIMULATION" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { _count: { select: { phishingEvents: true, campaignUsers: true } } },
    });

    // Department breakdown
    const deptMap = new Map<string, { name: string; sent: number; clicked: number; reported: number }>();
    allEvents.forEach((e) => {
      const deptName = e.user.department?.name || "No Department";
      if (!deptMap.has(deptName)) deptMap.set(deptName, { name: deptName, sent: 0, clicked: 0, reported: 0 });
      const dept = deptMap.get(deptName)!;
      if (e.emailSentAt) dept.sent++;
      if (e.linkClickedAt) dept.clicked++;
      if (e.reportedAt) dept.reported++;
    });

    // Trend data (group by month)
    const trendMap = new Map<string, { month: string; sent: number; opened: number; clicked: number; reported: number }>();
    allEvents.forEach((e) => {
      if (!e.emailSentAt) return;
      const month = new Date(e.emailSentAt).toISOString().slice(0, 7); // YYYY-MM
      if (!trendMap.has(month)) trendMap.set(month, { month, sent: 0, opened: 0, clicked: 0, reported: 0 });
      const t = trendMap.get(month)!;
      t.sent++;
      if (e.emailOpenedAt) t.opened++;
      if (e.linkClickedAt) t.clicked++;
      if (e.reportedAt) t.reported++;
    });

    return success({
      stats: { totalSimulations, totalSent, openRate, clickRate, reportRate },
      campaigns,
      departments: Array.from(deptMap.values()),
      trend: Array.from(trendMap.values()).sort((a, b) => a.month.localeCompare(b.month)),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
