import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { registerSchema } from "@/lib/validations";
import { badRequest, serverError, success } from "@/lib/server-auth";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);
}

async function uniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 0;
  while (true) {
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (!existing) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return badRequest(validation.error.errors.map((e) => e.message).join(", "));
    }

    const { name, email, password, organizationName } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return badRequest("Unable to create account. Please try again or contact support.");
    }

    const passwordHash = await hash(password, 12);

    // If organizationName provided, create org + admin user in a transaction
    if (organizationName && organizationName.trim().length >= 2) {
      const orgName = organizationName.trim();
      const baseSlug = generateSlug(orgName);
      const slug = await uniqueSlug(baseSlug);

      const result = await prisma.$transaction(async (tx) => {
        // Create organization
        const org = await tx.organization.create({
          data: {
            name: orgName,
            slug,
            plan: "FREE",
            maxUsers: 50,
          },
        });

        // Create admin user linked to org
        const user = await tx.user.create({
          data: {
            name: trimmedName,
            email: normalizedEmail,
            passwordHash,
            role: "ADMIN",
            status: "ACTIVE",
            organizationId: org.id,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        // Create default departments for the org
        const defaultDepartments = [
          { name: "Information Technology", description: "IT infrastructure, development, and support" },
          { name: "Human Resources", description: "People operations and employee relations" },
          { name: "Finance & Accounting", description: "Financial planning and reporting" },
          { name: "Sales & Marketing", description: "Business development and brand management" },
          { name: "Operations", description: "Business operations and logistics" },
        ];

        for (const dept of defaultDepartments) {
          await tx.department.create({
            data: {
              ...dept,
              organizationId: org.id,
            },
          });
        }

        // Audit log
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "REGISTER",
            entity: "Organization",
            entityId: org.id,
            newValues: {
              organizationName: orgName,
              slug,
              userName: trimmedName,
              userEmail: normalizedEmail,
              role: "ADMIN",
            } as Prisma.InputJsonValue,
          },
        });

        return { user, org };
      });

      return success(
        {
          message: "Organization and account created successfully",
          user: result.user,
          organization: { id: result.org.id, name: result.org.name, slug: result.org.slug },
        },
        201
      );
    }

    // No org name: create standalone user (legacy / invitation flow)
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
    console.error("Registration error:", error);
    return serverError();
  }
}
