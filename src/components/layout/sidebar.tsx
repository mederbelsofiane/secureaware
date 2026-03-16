"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Shield, LayoutDashboard, BookOpen, FileQuestion, Fish,
  Trophy, User, Award, LogOut, Settings, Users,
  BarChart3, Megaphone, MessageSquare, PenTool, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

const employeeLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/modules", label: "Training Modules", icon: BookOpen },
  { href: "/dashboard/quizzes", label: "My Quizzes", icon: FileQuestion },
  { href: "/dashboard/phishing", label: "Phishing Training", icon: Fish },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/quizzes", label: "Quiz Manager", icon: PenTool },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/contacts", label: "Contact Requests", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const links = isAdmin && pathname.startsWith("/admin") ? adminLinks : employeeLinks;

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-dark-900/95 backdrop-blur-xl border-r border-gray-800/50 z-40 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-800/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-accent-blue" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-white">Secure<span className="text-accent-blue">Aware</span></span>
          )}
        </Link>
      </div>

      {/* Role switcher for admins */}
      {isAdmin && !collapsed && (
        <div className="px-3 py-3 border-b border-gray-800/50">
          <div className="flex gap-1 bg-dark-800 rounded-lg p-1">
            <Link
              href="/admin"
              className={cn(
                "flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-colors",
                pathname.startsWith("/admin") ? "bg-accent-blue text-white" : "text-gray-400 hover:text-white"
              )}
            >
              Admin
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-colors",
                pathname.startsWith("/dashboard") ? "bg-accent-blue text-white" : "text-gray-400 hover:text-white"
              )}
            >
              Employee
            </Link>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive(link.href)
                ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                : "text-gray-400 hover:text-white hover:bg-dark-700/50",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? link.label : undefined}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-gray-800/50 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-dark-700/50 transition-colors w-full"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /><span>Collapse</span></>}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
