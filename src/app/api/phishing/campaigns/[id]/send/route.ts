import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { emailService } from "@/lib/services/email";
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, badRequest, notFound, serverError, success } from "@/lib/server-auth";

interface RouteParams { params: Promise<{ id: string }> }

function renderTemplate(html: string, variables: Record<string, string>): string {
  let rendered = html;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return rendered;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);

    const campaign = await prisma.campaign.findFirst({
      where: { id, ...orgWhere(user), type: "PHISHING_SIMULATION" },
    });
    if (!campaign) return notFound("Phishing campaign not found");

    // Get unsent events
    const events = await prisma.phishingEvent.findMany({
      where: { campaignId: id, emailSentAt: null },
      include: {
        user: { select: { id: true, name: true, email: true } },
        template: true,
      },
    });

    if (events.length === 0) return badRequest("No unsent emails found for this campaign");

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    let sentCount = 0;

    // Send emails (fire and forget for staggered delivery)
    const sendPromises = events.map(async (event, index) => {
      try {
        const nameParts = (event.user.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        const trackingUrl = `${baseUrl}/api/phishing/track/open/${event.token}`;
        const clickUrl = `${baseUrl}/api/phishing/track/click/${event.token}`;

        let html = renderTemplate(event.template.bodyHtml, {
          firstName,
          lastName,
          email: event.user.email,
          trackingUrl,
          clickUrl,
        });

        // Append tracking pixel
        html += `<img src="${trackingUrl}" width="1" height="1" style="display:none" />`;

        await emailService.sendEmail(event.user.email, event.template.subject, html);

        await prisma.phishingEvent.update({
          where: { id: event.id },
          data: { emailSentAt: new Date() },
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send phishing email to ${event.user.email}:`, err);
      }
    });

    // Wait for all sends
    await Promise.allSettled(sendPromises);

    // Update campaign status to ACTIVE
    await prisma.campaign.update({
      where: { id },
      data: { status: "ACTIVE", startDate: new Date() },
    });

    return success({ sent: sentCount, total: events.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
