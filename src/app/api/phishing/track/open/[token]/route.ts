import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const TRANSPARENT_GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

interface RouteParams { params: Promise<{ token: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const event = await prisma.phishingEvent.findUnique({ where: { token } });

    if (event && !event.emailOpenedAt) {
      const userAgent = req.headers.get("user-agent") || null;
      const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
      await prisma.phishingEvent.update({
        where: { id: event.id },
        data: { emailOpenedAt: new Date(), userAgent, ipAddress },
      });
    }
  } catch (err) {
    console.error("Tracking pixel error:", err);
  }

  return new Response(TRANSPARENT_GIF, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
