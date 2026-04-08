import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, serverError, success } from "@/lib/server-auth";

interface RouteParams { params: Promise<{ token: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const event = await prisma.phishingEvent.findUnique({ where: { token } });
    if (!event) return notFound("Event not found");

    if (!event.reportedAt) {
      await prisma.phishingEvent.update({
        where: { id: event.id },
        data: { reportedAt: new Date() },
      });
    }

    return success({ message: "Thank you for reporting this phishing attempt!" });
  } catch (error: unknown) {
    console.error("Report phishing error:", error);
    return serverError();
  }
}
