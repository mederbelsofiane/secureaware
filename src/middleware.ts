import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Simple in-memory cache for maintenance mode status
let maintenanceCache: { enabled: boolean; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 seconds

async function checkMaintenanceMode(baseUrl: string): Promise<boolean> {
  // Return cached value if still fresh
  if (maintenanceCache && Date.now() - maintenanceCache.timestamp < CACHE_TTL) {
    return maintenanceCache.enabled;
  }

  try {
    const res = await fetch(`${baseUrl}/api/settings/maintenance`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      maintenanceCache = { enabled: !!data.enabled, timestamp: Date.now() };
      return maintenanceCache.enabled;
    }
  } catch {
    // If fetch fails, don't block users
  }
  return false;
}

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // === Maintenance Mode Check ===
    // Skip maintenance check for: /maintenance, /api/*, /_next/*, static assets
    const skipMaintenance =
      pathname === "/maintenance" ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon");

    if (!skipMaintenance) {
      const isAdmin = token?.role === "ADMIN";
      if (!isAdmin) {
        const baseUrl = req.nextUrl.origin;
        const inMaintenance = await checkMaintenanceMode(baseUrl);
        if (inMaintenance) {
          return NextResponse.redirect(new URL("/maintenance", req.url));
        }
      }
    }

    // === Role-based Access Control ===
    // Admin page routes require ADMIN role
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Dashboard routes require EMPLOYEE or ADMIN role
    if (pathname.startsWith("/dashboard")) {
      if (!token?.role || token.role === "GUEST") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public page routes - always allowed
        if (
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/maintenance" ||
          pathname.startsWith("/about") ||
          pathname.startsWith("/features") ||
          pathname.startsWith("/contact") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon")
        ) {
          return true;
        }

        // Protected page routes require token
        return !!token;
      },
    },
  }
);

// Match page routes that need auth and/or maintenance checks
// API routes handle their own authentication via requireAuth/requireRole
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/",
    "/login",
    "/register",
    "/maintenance",
  ],
};
