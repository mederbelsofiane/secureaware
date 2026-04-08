import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, badRequest, serverError, success } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);
    const templates = await prisma.phishingTemplate.findMany({
      where: { ...orgWhere(user) },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { phishingEvents: true } } },
    });
    return success(templates);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { name, subject, senderName, senderEmail, bodyHtml, landingPageHtml, difficulty, category } = body;
    if (!name || !subject || !senderName || !senderEmail || !bodyHtml) {
      return badRequest("Missing required fields: name, subject, senderName, senderEmail, bodyHtml");
    }
    const template = await prisma.phishingTemplate.create({
      data: {
        organizationId: user.organizationId!,
        name: name.trim(),
        subject: subject.trim(),
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        bodyHtml,
        landingPageHtml: landingPageHtml || null,
        difficulty: difficulty || "INTERMEDIATE",
        category: category || "email",
      },
    });
    return success(template, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
