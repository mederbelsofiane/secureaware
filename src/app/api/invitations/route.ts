import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  requireOrgRole,
  orgWhere,
  unauthorized,
  forbidden,
  noOrganization,
  badRequest,
  serverError,
  success,
} from "@/lib/server-auth";
import { z } from "zod";

const invitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "EMPLOYEE", "GUEST"]).default("EMPLOYEE"),
});

const bulkInvitationSchema = z.object({
  invitations: z.array(invitationSchema).min(1).max(50),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireOrgRole(["ADMIN"]);

    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId: user.organizationId!,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(invitations);
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
    const user = await requireOrgRole(["ADMIN"]);

    const body = await req.json();

    // Support both single and bulk invitations
    let invitations: { email: string; role: "ADMIN" | "EMPLOYEE" | "GUEST" }[];

    if (body.invitations) {
      const parsed = bulkInvitationSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
      }
      invitations = parsed.data.invitations;
    } else {
      const parsed = invitationSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
      }
      invitations = [parsed.data];
    }

    // Check org user limit
    const currentUserCount = await prisma.user.count({
      where: { organizationId: user.organizationId! },
    });
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId! },
      select: { maxUsers: true },
    });
    if (org && currentUserCount + invitations.length > org.maxUsers) {
      return badRequest(
        `Organization user limit (${org.maxUsers}) would be exceeded. Current users: ${currentUserCount}`
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiration

    const results: { email: string; status: string; id?: string }[] = [];

    for (const inv of invitations) {
      const normalizedEmail = inv.email.trim().toLowerCase();

      // Check if user already exists in the org
      const existingUser = await prisma.user.findFirst({
        where: { email: normalizedEmail, organizationId: user.organizationId! },
      });
      if (existingUser) {
        results.push({ email: normalizedEmail, status: "already_member" });
        continue;
      }

      // Check for existing pending invitation
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          email: normalizedEmail,
          organizationId: user.organizationId!,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
      if (existingInvitation) {
        results.push({ email: normalizedEmail, status: "already_invited", id: existingInvitation.id });
        continue;
      }

      const invitation = await prisma.invitation.create({
        data: {
          email: normalizedEmail,
          organizationId: user.organizationId!,
          role: inv.role as any,
          expiresAt,
          invitedBy: user.id,
        },
      });

      results.push({ email: normalizedEmail, status: "invited", id: invitation.id });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entity: "Invitation",
        entityId: "bulk",
        newValues: { invitations: results } as Prisma.InputJsonValue,
      },
    });

    return success({ results }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}
