"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { PageLoading } from "@/components/ui/loading";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Shield,
  LayoutDashboard,
  Building2,
  ScrollText,
  LogOut,
  Crown,
} from "lucide-react";

const navLinks = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/super-admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      session?.user?.role !== "SUPER_ADMIN"
    ) {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-dark-950 light:bg-gray-50 flex items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "SUPER_ADMIN") {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/super-admin") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="sa-layout min-h-screen bg-dark-950">
      {/* Fixed Sidebar */}
      <aside className="sa-sidebar fixed top-0 left-0 h-full w-64 backdrop-blur-xl bg-dark-900/95 border-r border-gray-800/50 z-40 flex flex-col">
        {/* Logo */}
        <div className="sa-sidebar-header h-16 flex items-center justify-between px-4 border-b border-gray-800/50">
          <Link href="/super-admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <span className="font-bold text-lg sa-text-primary">
              Secure<span className="text-purple-400">Aware</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Super Admin Badge */}
        <div className="px-4 py-3 sa-sidebar-section border-b border-gray-800/50">
          <div className="sa-badge-super flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">
              Super Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "sa-nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive(link.href)
                  ? "sa-nav-active bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  : "sa-nav-inactive text-gray-400 hover:text-white hover:bg-dark-700/50"
              )}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="sa-sidebar-bottom p-3 border-t border-gray-800/50">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs sa-text-muted truncate">
              {session.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sa-main ml-64 min-h-screen">{children}</main>
    </div>
  );
}
