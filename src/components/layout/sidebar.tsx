"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Shield, LayoutDashboard, BookOpen, FileQuestion, Fish,
  Trophy, User, Award, LogOut, Settings, Users,
  BarChart3, Megaphone, MessageSquare, PenTool, ChevronLeft, ChevronRight,
  Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const employeeLinks = [
    { href: "/dashboard", label: t.sidebar.dashboard, icon: LayoutDashboard },
    { href: "/dashboard/modules", label: t.sidebar.trainingModules, icon: BookOpen },
    { href: "/dashboard/quizzes", label: t.sidebar.myQuizzes, icon: FileQuestion },
    { href: "/dashboard/phishing", label: t.sidebar.phishingTraining, icon: Fish },
    { href: "/dashboard/leaderboard", label: t.sidebar.leaderboard, icon: Trophy },
    { href: "/dashboard/certificates", label: t.sidebar.certificates, icon: Award },
    { href: "/dashboard/profile", label: t.sidebar.profile, icon: User },
  ];

  const adminLinks = [
    { href: "/admin", label: t.sidebar.dashboard, icon: LayoutDashboard },
    { href: "/admin/users", label: t.sidebar.userManagement, icon: Users },
    { href: "/admin/campaigns", label: t.sidebar.campaigns, icon: Megaphone },
    { href: "/admin/quizzes", label: t.sidebar.quizManager, icon: PenTool },
    { href: "/admin/reports", label: t.sidebar.reports, icon: BarChart3 },
    { href: "/admin/contacts", label: t.sidebar.contactRequests, icon: MessageSquare },
    { href: "/admin/settings", label: t.sidebar.settings, icon: Settings },
  ];

  const links = isAdmin && pathname.startsWith("/admin") ? adminLinks : employeeLinks;

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "fixed top-0 h-full backdrop-blur-xl border-r z-40 transition-all duration-300 flex flex-col",
      isRTL ? "right-0 border-l border-r-0" : "left-0",
      theme === "dark" ? "bg-dark-900/95 border-gray-800/50" : "bg-white/97 border-gray-200",
      collapsed ? "w-16" : "w-64"
    )} style={isRTL ? { borderRight: "none" } : undefined}>
      {/* Logo */}
      <div className={cn("h-16 flex items-center px-4 border-b", theme === "dark" ? "border-gray-800/50" : "border-gray-200")}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-accent-blue" />
          </div>
          {!collapsed && (
            <span className={cn("font-bold text-lg", theme === "dark" ? "text-white" : "text-gray-900")}>
              Secure<span className="text-accent-blue">Aware</span>
            </span>
          )}
        </Link>
      </div>

      {/* Role switcher for admins */}
      {isAdmin && !collapsed && (
        <div className={cn("px-3 py-3 border-b", theme === "dark" ? "border-gray-800/50" : "border-gray-200")}>
          <div className={cn("flex gap-1 rounded-lg p-1", theme === "dark" ? "bg-dark-800" : "bg-gray-100")}>
            <Link
              href="/admin"
              className={cn(
                "flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-accent-blue text-white"
                  : theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {t.sidebar.admin}
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-colors",
                pathname.startsWith("/dashboard")
                  ? "bg-accent-blue text-white"
                  : theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {t.sidebar.employee}
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
                : theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-dark-700/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
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
      <div className={cn("p-3 border-t space-y-1", theme === "dark" ? "border-gray-800/50" : "border-gray-200")}>
        {/* Language switcher */}
        <LanguageSwitcher collapsed={collapsed} />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full",
            theme === "dark"
              ? "text-yellow-400 hover:bg-dark-700/50"
              : "text-indigo-600 hover:bg-gray-100"
          )}
          title={theme === "dark" ? t.common.lightMode : t.common.darkMode}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0" />
          )}
          {!collapsed && <span>{theme === "dark" ? t.common.lightMode : t.common.darkMode}</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full",
            theme === "dark" ? "text-gray-500 hover:text-gray-300 hover:bg-dark-700/50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          )}
        >
          {collapsed
            ? (isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)
            : <>{isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}<span>{t.common.collapse}</span></>
          }
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{t.common.signOut}</span>}
        </button>
      </div>
    </aside>
  );
}
