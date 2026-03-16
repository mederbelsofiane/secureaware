import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { registerSchema } from "@/lib/validations";
import { badRequest, serverError, success } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return badRequest(validation.error.errors.map((e) => e.message).join(", "));
    }

    const { name, email, password } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // Check if user already exists - use generic message to prevent enumeration
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Generic message to prevent user enumeration
      return badRequest("Unable to create account. Please try again or contact support.");
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await hash(password, 12);

    // Create user with EMPLOYEE role by default
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        role: "EMPLOYEE",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Audit log for registration
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        entity: "User",
        entityId: user.id,
        newValues: { name: trimmedName, email: normalizedEmail, role: "EMPLOYEE" } as Prisma.InputJsonValue,
      },
    });

    return success(
      { message: "Account created successfully", user },
      201
    );
  } catch (error: unknown) {
    return serverError();
  }
}
