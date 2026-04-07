import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireSuperAdmin, forbidden, badRequest, serverError, success } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/logos");

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Determine which org to upload for
    let orgId: string;
    const searchParams = request.nextUrl.searchParams;
    const queryOrgId = searchParams.get("orgId");

    if (user.role === "SUPER_ADMIN") {
      if (!queryOrgId) {
        return badRequest("orgId query parameter required for super admin");
      }
      orgId = queryOrgId;
    } else if (user.role === "ADMIN") {
      if (!user.organizationId) {
        return badRequest("No organization found for user");
      }
      // Admin can only upload for their own org
      if (queryOrgId && queryOrgId !== user.organizationId) {
        return forbidden();
      }
      orgId = user.organizationId;
    } else {
      return forbidden();
    }

    // Verify org exists
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return badRequest("Organization not found");
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return badRequest("No logo file provided");
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest("Invalid file type. Allowed: PNG, JPG, JPEG, SVG");
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return badRequest("File too large. Maximum size: 2MB");
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `${orgId}-${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update organization logo path
    const logoPath = `/uploads/logos/${filename}`;
    await prisma.organization.update({
      where: { id: orgId },
      data: { logo: logoPath },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGO_UPLOAD",
        entity: "Organization",
        entityId: orgId,
        newValues: { logo: logoPath },
      },
    });

    return success({ logo: logoPath, message: "Logo uploaded successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (message === "FORBIDDEN") return forbidden();
    return serverError(message);
  }
}