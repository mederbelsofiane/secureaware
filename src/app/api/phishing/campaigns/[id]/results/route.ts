import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, notFound, serverError, success } from "@/lib/server-auth";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);

    const campaign = await prisma.campaign.findFirst({
      where: { id, ...orgWhere(user), type: "PHISHING_SIMULATION" },
      include: {
        phishingEvents: {
          include: {
            user: { select: { id: true, name: true, email: true, department: { select: { id: true, name: true } } } },
            template: { select: { id: true, name: true, subject: true, difficulty: true } },
          },
        },
      },
    });
    if (!campaign) return notFound("Campaign not found");

    const events = campaign.phishingEvents;
    const totalSent = events.filter((e) => e.emailSentAt).length;
    const opened = events.filter((e) => e.emailOpenedAt).length;
    const clicked = events.filter((e) => e.linkClickedAt).length;
    const reported = events.filter((e) => e.reportedAt).length;

    const openRate = totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((clicked / totalSent) * 100) : 0;
    const reportRate = totalSent > 0 ? Math.round((reported / totalSent) * 100) : 0;

    // Calculate average time to click
    const clickTimes = events
      .filter((e) => e.emailSentAt && e.linkClickedAt)
      .map((e) => new Date(e.linkClickedAt!).getTime() - new Date(e.emailSentAt!).getTime());
    const avgTimeToClick = clickTimes.length > 0 ? Math.round(clickTimes.reduce((a, b) => a + b, 0) / clickTimes.length / 1000) : 0;

    // Department breakdown
    const deptMap = new Map<string, { name: string; sent: number; opened: number; clicked: number; reported: number }>();
    events.forEach((e) => {
      const deptName = e.user.department?.name || "No Department";
      const deptId = e.user.department?.id || "none";
      if (!deptMap.has(deptId)) deptMap.set(deptId, { name: deptName, sent: 0, opened: 0, clicked: 0, reported: 0 });
      const dept = deptMap.get(deptId)!;
      if (e.emailSentAt) dept.sent++;
      if (e.emailOpenedAt) dept.opened++;
      if (e.linkClickedAt) dept.clicked++;
      if (e.reportedAt) dept.reported++;
    });

    return success({
      campaign: { id: campaign.id, name: campaign.name, description: campaign.description, status: campaign.status, startDate: campaign.startDate, endDate: campaign.endDate },
      stats: { totalSent, opened, clicked, reported, openRate, clickRate, reportRate, avgTimeToClick },
      departments: Array.from(deptMap.values()),
      events: events.map((e) => ({
        id: e.id,
        user: e.user,
        template: e.template,
        emailSentAt: e.emailSentAt,
        emailOpenedAt: e.emailOpenedAt,
        linkClickedAt: e.linkClickedAt,
        reportedAt: e.reportedAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
