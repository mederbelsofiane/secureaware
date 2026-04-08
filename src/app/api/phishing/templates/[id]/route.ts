import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, badRequest, notFound, serverError, success } from "@/lib/server-auth";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);
    const template = await prisma.phishingTemplate.findFirst({
      where: { id, ...orgWhere(user) },
      include: { _count: { select: { phishingEvents: true } } },
    });
    if (!template) return notFound("Template not found");
    return success(template);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);
    const existing = await prisma.phishingTemplate.findFirst({ where: { id, ...orgWhere(user) } });
    if (!existing) return notFound("Template not found");
    const body = await req.json();
    const { name, subject, senderName, senderEmail, bodyHtml, landingPageHtml, difficulty, category, isActive } = body;
    const template = await prisma.phishingTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(subject !== undefined && { subject: subject.trim() }),
        ...(senderName !== undefined && { senderName: senderName.trim() }),
        ...(senderEmail !== undefined && { senderEmail: senderEmail.trim() }),
        ...(bodyHtml !== undefined && { bodyHtml }),
        ...(landingPageHtml !== undefined && { landingPageHtml }),
        ...(difficulty !== undefined && { difficulty }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return success(template);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);
    const existing = await prisma.phishingTemplate.findFirst({ where: { id, ...orgWhere(user) } });
    if (!existing) return notFound("Template not found");
    await prisma.phishingTemplate.delete({ where: { id } });
    return success({ message: "Template deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
