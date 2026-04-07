import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { badRequest, notFound, serverError, success } from "@/lib/server-auth";
import { z } from "zod";

const acceptSchema = z.object({
  token: z.string().min(1, "Token is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = acceptSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    const { token, name, password } = parsed.data;

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: { select: { id: true, name: true, slug: true } } },
    });

    if (!invitation) {
      return notFound("Invalid invitation token");
    }

    if (invitation.acceptedAt) {
      return badRequest("This invitation has already been accepted");
    }

    if (invitation.expiresAt < new Date()) {
      return badRequest("This invitation has expired");
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });
    if (existingUser) {
      return badRequest("An account with this email already exists");
    }

    const passwordHash = await hash(password, 12);

    // Create user and mark invitation as accepted in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: invitation.email,
          passwordHash,
          role: invitation.role,
          status: "ACTIVE",
          organizationId: invitation.organizationId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      return user;
    });

    return success({
      message: "Account created successfully",
      user: result,
      organization: invitation.organization,
    }, 201);
  } catch (error: unknown) {
    console.error("Invitation accept error:", error);
    return serverError();
  }
}
