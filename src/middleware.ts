import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

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

// Only match page routes - NOT API routes
// API routes handle their own authentication via requireAuth/requireRole
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
