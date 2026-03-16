import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, notFound, serverError, success } from "@/lib/server-auth";

export async function GET() {
  try {
    const sessionUser = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        jobTitle: true,
        riskScore: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return notFound("User not found");
    }

    return success(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    return serverError();
  }
}
