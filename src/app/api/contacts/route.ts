import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, unauthorized, forbidden, badRequest, serverError, success } from "@/lib/server-auth";
import { paginationSchema, contactSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const returnAll = req.nextUrl.searchParams.get("all") === "true";

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = paginationSchema.safeParse(searchParams);
    const { page = 1, limit = 20, search, sortBy, sortOrder } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20, search: undefined, sortBy: undefined, sortOrder: undefined };

    const skip = returnAll ? 0 : (page - 1) * limit;
    const take = returnAll ? 10000 : limit;
    const status = req.nextUrl.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { company: { contains: search.trim(), mode: "insensitive" } },
        { message: { contains: search.trim(), mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;

    const orderBy: Record<string, string> = sortBy
      ? { [sortBy]: sortOrder || "asc" }
      : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.contactRequest.findMany({ where, skip, take, orderBy }),
      prisma.contactRequest.count({ where }),
    ]);

    if (returnAll) return success(items);

    return success({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
    }

    // Sanitize input
    const sanitizedData = {
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      company: parsed.data.company?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      message: parsed.data.message.trim(),
    };

    const contact = await prisma.contactRequest.create({
      data: sanitizedData,
    });

    return success(
      { id: contact.id, message: "Your message has been received. We will get back to you shortly." },
      201
    );
  } catch (error: unknown) {
    return serverError();
  }
}
