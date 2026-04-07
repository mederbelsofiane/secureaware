import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { SessionUser, UserRole } from "@/types";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role as UserRole)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// ============================================
// Super Admin Helper
// ============================================

/** Require SUPER_ADMIN role - no organization required */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// ============================================
// Organization (Multi-Tenancy) Helpers
// ============================================

/** Require user belongs to an organization */
export async function requireOrg(): Promise<SessionUser> {
  const user = await requireAuth();
  if (!user.organizationId) {
    throw new Error("NO_ORGANIZATION");
  }
  return user;
}

/** Require org membership + specific role(s) */
export async function requireOrgRole(roles: UserRole[]): Promise<SessionUser> {
  const user = await requireOrg();
  if (!roles.includes(user.role as UserRole)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/** Returns a where clause scoped to the user's organization */
export function orgWhere(user: SessionUser): { organizationId: string } {
  return { organizationId: user.organizationId! };
}

/** Returns OR clause for org-specific + global records (for modules, badges, phishing) */
export function orgOrGlobalWhere(user: SessionUser) {
  return {
    OR: [
      { organizationId: user.organizationId },
      { isGlobal: true },
    ],
  };
}

// ============================================
// API Route Response Helpers
// ============================================

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function noOrganization() {
  return NextResponse.json({ error: "No organization. Please join or create an organization." }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  console.error("Server error:", message);
  return NextResponse.json({ error: message }, { status: 500 });
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
