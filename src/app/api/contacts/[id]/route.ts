import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  requireRole,
  unauthorized,
  forbidden,
  badRequest,
  notFound,
  serverError,
  success,
} from "@/lib/server-auth";
import { contactStatusSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.length < 1) {
      return badRequest("Invalid contact ID");
    }

    await requireRole(["ADMIN"]);

    const contact = await prisma.contactRequest.findUnique({
      where: { id },
    });

    if (!contact) {
      return notFound("Contact request not found");
    }

    return success(contact);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.length < 1) {
      return badRequest("Invalid contact ID");
    }

    const currentUser = await requireRole(["ADMIN"]);

    const existing = await prisma.contactRequest.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Contact request not found");
    }

    const body = await req.json();
    const parsed = contactStatusSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    // Sanitize
    const updateData = {
      status: parsed.data.status,
      internalNotes: parsed.data.internalNotes?.trim() || null,
      reviewedBy: currentUser.id,
    };

    const contact = await prisma.contactRequest.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "UPDATE",
        entity: "ContactRequest",
        entityId: id,
        oldValues: { status: existing.status } as Prisma.InputJsonValue,
        newValues: { status: updateData.status } as Prisma.InputJsonValue,
      },
    });

    return success(contact);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}
