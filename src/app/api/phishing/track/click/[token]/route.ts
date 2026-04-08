import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams { params: Promise<{ token: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { token } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const event = await prisma.phishingEvent.findUnique({
      where: { token },
      include: { template: true },
    });

    if (event && !event.linkClickedAt) {
      const userAgent = req.headers.get("user-agent") || null;
      const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
      await prisma.phishingEvent.update({
        where: { id: event.id },
        data: { linkClickedAt: new Date(), userAgent, ipAddress },
      });
    }
  } catch (err) {
    console.error("Click tracking error:", err);
  }

  return NextResponse.redirect(new URL(`/phishing-caught/${token}`, baseUrl));
}
